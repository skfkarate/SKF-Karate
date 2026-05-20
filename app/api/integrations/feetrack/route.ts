import type { Session } from 'next-auth'

import { authorizeStaffCredentials, type AuthUser } from '@/lib/server/auth/options'
import { normaliseSkfId } from '@/lib/utils/registration'
import { AppError, AuthenticationError, AuthorizationError, ValidationError } from '@/src/server/lib/errors'
import { logger } from '@/src/server/lib/logger'
import { timingSafeStringEqual } from '@/src/server/lib/security'
import { FeeOperationsService } from '@/src/server/services/fee-operations.service'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const

const FEE_TRACK_ROLES = new Set(FeeOperationsService.roles)

type ActionBody = Record<string, unknown> & {
  action?: string
  staff?: AuthUser
}

type FeeTrackSession = Session & {
  user: Session['user'] & {
    id: string
    name: string
    role: string
    branchScope?: string
  }
}

type LedgerEntry = {
  skfId: string
  feeType: string
  amount: number
  status: string
  receiptId?: string | null
  paidDate?: string | null
  metadata?: Record<string, unknown>
}

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

function assertApiKey(request: Request) {
  const expected = process.env.FEETRACK_API_KEY
  if (!expected) {
    throw new AppError(
      'FEETRACK_NOT_CONFIGURED',
      'FeeTrack integration API key is not configured.',
      503
    )
  }

  const actual = request.headers.get('x-feetrack-api-key') || ''
  if (!timingSafeStringEqual(actual, expected)) {
    throw new AuthenticationError('Invalid FeeTrack integration key.')
  }
}

function sessionFromStaff(staff: AuthUser): FeeTrackSession {
  return {
    expires: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    user: {
      id: staff.id,
      name: staff.name || staff.id,
      role: staff.role,
      branchScope: staff.branchScope || 'all',
    },
  } as FeeTrackSession
}

function assertStaff(body: ActionBody) {
  if (!body.staff?.id || !body.staff.role) {
    throw new AuthenticationError('FeeTrack staff session is required.')
  }

  if (!FEE_TRACK_ROLES.has(body.staff.role)) {
    throw new AuthorizationError('This staff account cannot access FeeTrack.')
  }

  return sessionFromStaff(body.staff)
}

function normalizeKey(value: unknown) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeBranch(value: unknown, options: { allowOverall?: boolean } = {}) {
  const raw = String(value || '').trim()
  const key = normalizeKey(raw)

  if (options.allowOverall && (!key || key === 'overall' || key === 'all' || key === 'both')) {
    return ''
  }

  if (['mpsc', 'mp', 'mp sports club', 'm p sports club'].includes(key)) {
    return 'M P Sports Club'
  }

  if (['herohalli', 'hero'].includes(key)) {
    return 'Herohalli'
  }

  throw new ValidationError({ branch: ['FeeTrack currently supports only M P Sports Club and Herohalli.'] })
}

function normalizeScope(value: unknown) {
  const key = normalizeKey(value)
  if (['mpsc', 'mp', 'mp sports club', 'm p sports club'].includes(key)) return 'M P Sports Club'
  if (['herohalli', 'hero'].includes(key)) return 'Herohalli'
  if (!key || key === 'both' || key === 'all' || key === 'bangalore') return 'Both'
  return String(value || '').trim() || 'Both'
}

function feeTrackScope(value: unknown) {
  const key = normalizeKey(value)
  if (['m p sports club', 'mp sports club', 'mpsc', 'mp'].includes(key)) return 'MPSC'
  if (key === 'herohalli') return 'Herohalli'
  if (!key || key === 'both' || key === 'all' || key === 'bangalore') return 'Both'
  return String(value || '').trim() || 'Both'
}

function monthName(input: unknown) {
  if (typeof input === 'number' || /^\d+$/.test(String(input || '').trim())) {
    const index = Number(input)
    if (index >= 0 && index < MONTHS.length) return MONTHS[index]
  }

  const key = String(input || '').trim().toLowerCase()
  const match = MONTHS.find((month) => {
    const lower = month.toLowerCase()
    return lower === key || lower.slice(0, 3) === key.slice(0, 3)
  })

  return match || MONTHS[new Date().getMonth()]
}

function monthIndex(input: unknown) {
  const normalized = monthName(input)
  return MONTHS.findIndex((month) => month === normalized)
}

function optionalMonthIndex(input: unknown) {
  const raw = String(input || '').trim()
  if (!raw) return null
  return monthIndex(raw)
}

function targetYear(input: unknown) {
  const year = Number(input || new Date().getFullYear())
  return Number.isFinite(year) ? Math.trunc(year) : new Date().getFullYear()
}

function statusToMonthStatus(status: string) {
  if (status === 'paid') return 'Paid'
  if (status === 'break') return 'Break'
  if (status === 'discontinued') return 'Discontinued'
  if (status === 'waived') return 'N/A'
  if (status === 'pending_verification') return 'Pending Verification'
  return 'Pending'
}

function readAmount(value: unknown) {
  const amount = Number(value || 0)
  return Number.isFinite(amount) ? Math.max(0, amount) : 0
}

function readSignedAmount(value: unknown) {
  const amount = Number(value || 0)
  return Number.isFinite(amount) ? amount : 0
}

function hasAmount(value: unknown) {
  return value !== undefined && value !== null && value !== ''
}

function compactDate(value: unknown) {
  return String(value || '').split('T')[0] || ''
}

async function getNonRecurringRows(session: FeeTrackSession, year: number, branch: string) {
  const ledger = await FeeOperationsService.getLedger(session, {
    year,
    city: 'bangalore',
    branch,
    feeType: 'all',
  })
  const bySkfId = new Map<string, { admission?: LedgerEntry; dress?: LedgerEntry }>()

  for (const entry of ledger.entries as LedgerEntry[]) {
    if (entry.feeType !== 'admission' && entry.feeType !== 'dress') continue
    const current = bySkfId.get(entry.skfId) || {}
    if (entry.feeType === 'admission' && !current.admission) current.admission = entry
    if (entry.feeType === 'dress' && !current.dress) current.dress = entry
    bySkfId.set(entry.skfId, current)
  }

  return bySkfId
}

function mapStudent(row: Record<string, unknown>, extras?: { admission?: LedgerEntry; dress?: LedgerEntry }) {
  const rawStatus = String(row.status || 'due')
  const billingStatus = normalizeKey(row.billingStatus)
  const status = billingStatus === 'discontinued' && rawStatus === 'waived'
    ? 'discontinued'
    : rawStatus
  const joinDate = String(row.joinDate || '')
  const joined = joinDate ? new Date(joinDate) : null
  const admission = extras?.admission
  const dress = extras?.dress
  const monthStatus = statusToMonthStatus(status)

  return {
    id: row.skfId,
    name: row.name,
    parentName: row.parentName || '',
    status: monthStatus === 'Discontinued'
      ? 'Discontinued'
      : monthStatus === 'Break'
        ? 'Break'
        : 'Active',
    fee: readAmount(row.amount),
    phone: row.phone || '',
    whatsapp: row.phone || '',
    dateOfBirth: '',
    email: row.email || '',
    paid: status === 'paid',
    monthStatus,
    joinMonth: joined && Number.isFinite(joined.getTime()) ? joined.getMonth() : 0,
    originalFee: readAmount(row.originalAmount),
    creditApplied: readAmount(row.creditApplied),
    trainingMonths: readAmount(row.trainingMonths),
    trainingExperience: String(row.trainingExperience || ''),
    receiptId: row.receiptId || null,
    paidDate: row.paidDate || null,
    admissionFee: admission ? readAmount(admission.amount) : undefined,
    admissionStatus: admission?.status === 'paid' ? 'Paid' : admission ? 'Pending' : undefined,
    admissionReceiptId: admission?.receiptId || null,
    dressFee: dress ? readAmount(dress.amount) : undefined,
    dressCost: dress ? readAmount(dress.metadata?.dressCost) : undefined,
    dressStatus: dress?.status === 'paid' ? 'Paid' : dress ? 'Pending' : undefined,
    dressReceiptId: dress?.receiptId || null,
  }
}

function mapCredit(row: Record<string, unknown>) {
  return {
    id: String(row.id || ''),
    studentId: String(row.skf_id || ''),
    studentName: String(row.athleteName || 'SKF Athlete'),
    amount: readAmount(row.amount),
    reason: String(row.reason || ''),
    dateEarned: compactDate(row.earned_at || row.created_at),
    usedInMonth: row.used_month ? monthIndex(row.used_month) : null,
    usedDate: compactDate(row.used_at),
    isUsed: String(row.status || '') === 'used',
    description: String(row.description || ''),
  }
}

function mapExpense(row: Record<string, unknown>) {
  return {
    id: String(row.id || row.expense_code || ''),
    month: monthIndex(row.month),
    year: String(row.year || new Date().getFullYear()),
    title: String(row.title || ''),
    description: String(row.description || ''),
    scope: feeTrackScope(row.scope),
    amount: readAmount(row.amount),
    dateAdded: compactDate(row.created_at),
  }
}

function mapPaymentProof(row: Record<string, unknown>) {
  const metadata = (row.metadata && typeof row.metadata === 'object')
    ? row.metadata as Record<string, unknown>
    : {}
  const proofMonth = metadata.month || row.month
  const proofYear = metadata.year || row.year

  return {
    id: String(row.id || ''),
    studentId: String(row.skf_id || ''),
    studentName: String(row.athleteName || 'SKF Athlete'),
    branch: feeTrackScope(row.branch),
    amount: readAmount(row.amount),
    submittedAt: String(row.submitted_at || ''),
    paymentReference: String(row.payment_reference || ''),
    proofUrl: String(row.signedUrl || ''),
    proofFilename: String(row.proof_filename || ''),
    feeType: String(metadata.feeType || 'monthly'),
    month: optionalMonthIndex(proofMonth),
    monthName: proofMonth ? monthName(proofMonth) : '',
    year: proofYear ? targetYear(proofYear) : new Date().getFullYear(),
    status: String(row.status || 'submitted'),
  }
}

function mapDevelopmentFund(data: Record<string, unknown>) {
  const monthlyBreakdown = ((data.monthlyBreakdown as Record<string, unknown>[]) || []).map((row) => ({
    month: monthIndex(row.month),
    year: String(row.year || data.year || new Date().getFullYear()),
    collected: readAmount(row.collected),
    devFund: readAmount(row.devFund),
    spent: readAmount(row.spent),
    carryForward: readSignedAmount(row.carryForward),
  }))

  const expenses = ((data.expenses as Record<string, unknown>[]) || []).map(mapExpense)

  return {
    branch: 'All',
    monthlyBreakdown,
    expenses,
    totalContributions: readAmount(data.totalContributions),
    totalSpent: readAmount(data.totalSpent),
    availableBalance: readSignedAmount(data.availableBalance),
    reserveUsed: 0,
  }
}

async function login(body: ActionBody) {
  const username = String(body.username || '')
  const password = String(body.password || '')
  const staff = await authorizeStaffCredentials(username, password)
  if (!staff || !FEE_TRACK_ROLES.has(staff.role)) {
    throw new AuthenticationError('Invalid FeeTrack credentials.')
  }

  return {
    success: true,
    staff: {
      id: staff.id,
      name: staff.name || staff.id,
      role: staff.role,
      branchScope: staff.branchScope || 'all',
    },
  }
}

async function getStudents(session: FeeTrackSession, body: ActionBody) {
  const branch = normalizeBranch(body.branch)
  const year = targetYear(body.year)
  const month = monthName(body.month)
  const [studentData, breakData, waivedData, nonRecurring] = await Promise.all([
    FeeOperationsService.getStudents(session, {
      year,
      month,
      city: 'bangalore',
      branch,
    }),
    FeeOperationsService.getStudents(session, {
      year,
      month,
      city: 'bangalore',
      branch,
      status: 'break',
    }),
    FeeOperationsService.getStudents(session, {
      year,
      month,
      city: 'bangalore',
      branch,
      status: 'waived',
    }),
    getNonRecurringRows(session, year, branch),
  ])
  const billableStudents = studentData.students as Record<string, unknown>[]
  const breakStudents = (breakData.students as Record<string, unknown>[]) || []
  const discontinuedStudents = ((waivedData.students as Record<string, unknown>[]) || [])
    .filter((student) => normalizeKey(student.billingStatus) === 'discontinued')

  const bySkfId = new Map<string, Record<string, unknown>>()
  for (const student of [...billableStudents, ...breakStudents, ...discontinuedStudents]) {
    bySkfId.set(String(student.skfId || ''), student)
  }

  return {
    success: true,
    students: Array.from(bySkfId.values()).map((student: Record<string, unknown>) =>
      mapStudent(student, nonRecurring.get(String(student.skfId || '')))
    ),
  }
}

async function markPaid(session: FeeTrackSession, body: ActionBody) {
  const branch = normalizeBranch(body.branch)
  const month = monthName(body.month)
  const year = targetYear(body.year)
  const result = await FeeOperationsService.runLedgerAction(session, {
    action: 'mark_paid',
    skfId: String(body.id || body.skfId || ''),
    month,
    year,
    feeType: 'monthly',
    paymentMethod: 'manual',
    paymentReference: 'FeeTrack',
  })
  return { success: true, branch, data: result }
}

async function markPaidWithCredit(session: FeeTrackSession, body: ActionBody) {
  const month = monthName(body.month)
  const year = targetYear(body.year)
  const skfId = String(body.id || body.skfId || '')
  const creditResult = await FeeOperationsService.runLedgerAction(session, {
    action: 'apply_credit',
    creditId: String(body.creditId || ''),
    skfId,
    month,
    year,
    feeType: 'monthly',
  })

  const target = (creditResult as { target?: { status?: string; amount?: number } }).target
  let paidResult: unknown = creditResult
  if (target?.status !== 'paid') {
    paidResult = await FeeOperationsService.runLedgerAction(session, {
      action: 'mark_paid',
      skfId,
      month,
      year,
      feeType: 'monthly',
      amount: target?.amount,
      paymentMethod: 'manual',
      paymentReference: 'FeeTrack credit settlement',
    })
  }

  return { success: true, data: paidResult, credit: creditResult }
}

async function runStatusAction(session: FeeTrackSession, body: ActionBody, action: 'mark_break' | 'mark_discontinued') {
  const result = await FeeOperationsService.runLedgerAction(session, {
    action,
    skfId: String(body.id || body.skfId || ''),
    month: monthName(body.month),
    year: targetYear(body.year),
    feeType: 'monthly',
    reason: action === 'mark_break' ? 'Marked break from FeeTrack.' : 'Marked discontinued from FeeTrack.',
  })
  return { success: true, data: result }
}

async function resumeStudent(session: FeeTrackSession, body: ActionBody) {
  const result = await FeeOperationsService.runLedgerAction(session, {
    action: 'resume_billing',
    skfId: String(body.id || body.skfId || ''),
    month: monthName(body.month),
    year: targetYear(body.year),
    monthlyFee: hasAmount(body.monthlyFee) ? readAmount(body.monthlyFee) : undefined,
    reason: String(body.reason || 'Student resumed from FeeTrack.'),
  })
  return { success: true, data: result }
}

async function markNonRecurringPaid(session: FeeTrackSession, body: ActionBody) {
  const feeType = String(body.feeType || '').toLowerCase() === 'dress' ? 'dress' : 'admission'
  const result = await FeeOperationsService.runLedgerAction(session, {
    action: 'mark_paid',
    skfId: String(body.studentId || body.id || body.skfId || ''),
    month: monthName(body.month),
    year: targetYear(body.year),
    feeType,
    paymentMethod: 'manual',
    paymentReference: 'FeeTrack',
  })
  return { success: true, data: result }
}

async function getBranchCounts(session: FeeTrackSession) {
  const [herohalli, mp] = await Promise.all([
    FeeOperationsService.getStudents(session, {
      year: new Date().getFullYear(),
      month: MONTHS[new Date().getMonth()],
      city: 'bangalore',
      branch: 'Herohalli',
    }),
    FeeOperationsService.getStudents(session, {
      year: new Date().getFullYear(),
      month: MONTHS[new Date().getMonth()],
      city: 'bangalore',
      branch: 'M P Sports Club',
    }),
  ])

  return {
    success: true,
    data: {
      herohalli: herohalli.summary.students,
      mp: mp.summary.students,
    },
  }
}

async function getPaymentVerifications(session: FeeTrackSession, body: ActionBody) {
  const branch = normalizeBranch(body.branch, { allowOverall: true })
  const data = await FeeOperationsService.getPaymentProofs(session, {
    city: 'bangalore',
    branch,
    status: 'pending_verification',
    limit: 100,
  })

  return {
    success: true,
    data: {
      verifications: ((data.proofs as Record<string, unknown>[]) || []).map(mapPaymentProof),
      pagination: data.pagination,
    },
  }
}

async function approvePaymentVerification(session: FeeTrackSession, body: ActionBody) {
  const proofId = String(body.proofId || '').trim()
  if (!proofId) throw new ValidationError({ proofId: ['Payment proof ID is required.'] })
  const result = await FeeOperationsService.approvePaymentProof(session, proofId, String(body.note || ''))
  return { success: true, data: result }
}

async function rejectPaymentVerification(session: FeeTrackSession, body: ActionBody) {
  const proofId = String(body.proofId || '').trim()
  if (!proofId) throw new ValidationError({ proofId: ['Payment proof ID is required.'] })
  const result = await FeeOperationsService.rejectPaymentProof(session, proofId, String(body.note || ''))
  return { success: true, data: result }
}

async function getCredits(session: FeeTrackSession, body: ActionBody) {
  const branch = normalizeBranch(body.branch)
  const data = await FeeOperationsService.getCredits(session, {
    city: 'bangalore',
    branch,
    status: body.status ? String(body.status) as 'available' | 'used' | 'cancelled' : undefined,
  })
  const credits = data.credits.map(mapCredit)
  return {
    success: true,
    data: {
      credits,
      totalUnused: credits.filter((credit) => !credit.isUsed).reduce((sum, credit) => sum + credit.amount, 0),
      totalUsed: credits.filter((credit) => credit.isUsed).reduce((sum, credit) => sum + credit.amount, 0),
    },
  }
}

async function getStudentCredits(session: FeeTrackSession, body: ActionBody) {
  const data = await FeeOperationsService.getCredits(session, {
    city: 'bangalore',
    branch: normalizeBranch(body.branch),
    status: 'available',
  })
  const skfId = normaliseSkfId(String(body.studentId || body.id || body.skfId || ''))
  const credits = data.credits
    .filter((credit: Record<string, unknown>) => normaliseSkfId(String(credit.skf_id || '')) === skfId)
    .map((credit: Record<string, unknown>) => ({
      id: String(credit.id || ''),
      amount: readAmount(credit.amount),
      reason: String(credit.reason || ''),
      dateEarned: compactDate(credit.earned_at || credit.created_at),
    }))

  return {
    success: true,
    data: {
      credits,
      totalAvailable: credits.reduce((sum, credit) => sum + credit.amount, 0),
    },
  }
}

async function addReferralCredit(session: FeeTrackSession, body: ActionBody) {
  const created = await FeeOperationsService.createCredit(session, {
    skfId: String(body.studentId || ''),
    amount: readAmount(body.amount),
    reason: String(body.reason || 'Referral credit'),
    description: String(body.description || ''),
  })

  if (body.usedInMonth !== undefined && body.usedInMonth !== null && body.usedInMonth !== '') {
    await FeeOperationsService.runLedgerAction(session, {
      action: 'apply_credit',
      creditId: String((created as { id?: string }).id || ''),
      skfId: String(body.studentId || ''),
      month: monthName(body.usedInMonth),
      year: targetYear(body.year),
      feeType: 'monthly',
    })
  }

  return { success: true, data: created }
}

async function getDevelopmentFund(session: FeeTrackSession, body: ActionBody) {
  const data = await FeeOperationsService.getDevelopmentFund(session, {
    city: 'bangalore',
    year: targetYear(body.year),
  })
  return { success: true, data: mapDevelopmentFund(data as Record<string, unknown>) }
}

async function addDevelopmentExpense(session: FeeTrackSession, body: ActionBody) {
  const result = await FeeOperationsService.createDevelopmentExpense(session, {
    month: monthName(body.month),
    year: targetYear(body.year),
    title: String(body.title || ''),
    description: String(body.description || ''),
    scope: normalizeScope(body.scope),
    amount: readAmount(body.amount),
  })
  return { success: true, data: mapExpense(result as Record<string, unknown>) }
}

async function deleteDevelopmentExpense(session: FeeTrackSession, body: ActionBody) {
  const result = await FeeOperationsService.deleteDevelopmentExpense(session, String(body.expenseId || ''))
  return { success: true, data: result }
}

async function addExtraIncome(session: FeeTrackSession, body: ActionBody) {
  const result = await FeeOperationsService.createExtraIncome(session, {
    month: monthName(body.month),
    year: targetYear(body.year),
    title: String(body.title || ''),
    description: String(body.description || ''),
    scope: normalizeScope(body.scope),
    amount: readAmount(body.amount),
  })
  return { success: true, data: mapExtraIncome(result as Record<string, unknown>) }
}

async function deleteExtraIncome(session: FeeTrackSession, body: ActionBody) {
  const result = await FeeOperationsService.deleteExtraIncome(session, String(body.incomeId || ''))
  return { success: true, data: result }
}

function mapExtraIncome(row: Record<string, unknown>) {
  return {
    id: String(row.id || row.income_code || ''),
    month: monthIndex(row.month),
    year: String(row.year || new Date().getFullYear()),
    title: String(row.title || ''),
    description: String(row.description || ''),
    scope: feeTrackScope(row.scope),
    amount: readAmount(row.amount),
    dateAdded: compactDate(row.created_at),
  }
}

function financeFormulae() {
  return {
    expected: 'Active monthly fee students only. Break and discontinued students are excluded.',
    collected: 'Verified monthly fees marked paid for the selected month.',
    monthlyFeeCash: 'Monthly fees collected minus referral credits applied.',
    grossIncome: 'Monthly fee cash + admission collected + dress profit + extra income.',
    developmentFundContribution: '30% of gross income.',
    developmentFundBalance: 'Total development fund contributions minus development expenses.',
    availableBalance: 'Opening reserve + gross income - development expenses through the selected month.',
    pending: 'Monthly fees still due or rejected. Submitted proofs awaiting verification stay in the action inbox until approved.',
  }
}

function ledgerCategoryLabel(feeType: string) {
  if (feeType === 'monthly') return 'Monthly Fee'
  if (feeType === 'admission') return 'Admission'
  if (feeType === 'dress') return 'Dress'
  if (feeType === 'credit_adjustment') return 'Referral Credit'
  return 'Fee'
}

function ledgerFormulaKey(feeType: string) {
  if (feeType === 'monthly') return 'monthlyFeeCash'
  if (feeType === 'admission') return 'admissionCollected'
  if (feeType === 'dress') return 'dressProfit'
  if (feeType === 'credit_adjustment') return 'creditsApplied'
  return 'grossIncome'
}

async function getFinanceCommandCenter(session: FeeTrackSession, body: ActionBody) {
  const branch = normalizeBranch(body.branch, { allowOverall: true })
  const month = monthName(body.month)
  const selectedMonth = monthIndex(month)
  const year = targetYear(body.year)

  const [dashboard, finance, ledger] = await Promise.all([
    FeeOperationsService.getDashboard(session, {
      year,
      month,
      city: 'bangalore',
      branch,
    }),
    FeeOperationsService.getFinance(session, {
      year,
      month,
      city: 'bangalore',
      branch,
    }),
    FeeOperationsService.getLedger(session, {
      year,
      month,
      city: 'bangalore',
      branch,
      feeType: 'all',
    }),
  ])

  const financeRows = (finance.monthlyBreakdown as Record<string, unknown>[]) || []
  const monthRow = financeRows.find((row) => row.month === month) || {}
  const bankPosition = (finance.bankPosition as Record<string, unknown>) || {}
  const monthlyFeeCash = readAmount(monthRow.monthlyCash)
  const admissionCollected = readAmount(monthRow.admissionCollected)
  const dressProfit = readSignedAmount(monthRow.dressProfit)
  const extraIncome = readAmount(monthRow.extraIncome)
  const grossIncome = hasAmount(monthRow.grossIncome)
    ? readSignedAmount(monthRow.grossIncome)
    : monthlyFeeCash + admissionCollected + dressProfit + extraIncome
  const developmentExpenses = readAmount(monthRow.developmentExpenses)
  const developmentFundContribution = readAmount(monthRow.developmentAllocation)
  const developmentFundBalance = readSignedAmount(bankPosition.developmentFundBalance)
  const availableBalance = readSignedAmount(bankPosition.actualBankBalance)
  const creditsApplied = readAmount(monthRow.creditsApplied)
  const expected = readAmount(dashboard.summary.expected)
  const collected = readAmount(dashboard.summary.collected)
  const pending = readAmount(dashboard.summary.pending)
  const warnings: { level: 'info' | 'warning' | 'danger'; message: string }[] = []

  if (pending > 0) {
    warnings.push({
      level: 'warning',
      message: `${dashboard.summary.pendingCount} student${dashboard.summary.pendingCount === 1 ? '' : 's'} still pending for ${month}.`,
    })
  }

  if (developmentFundBalance < 0) {
    warnings.push({
      level: 'danger',
      message: 'Development fund balance is negative after recorded expenses.',
    })
  }

  if (Math.abs(grossIncome - (monthlyFeeCash + admissionCollected + dressProfit + extraIncome)) > 1) {
    warnings.push({
      level: 'warning',
      message: 'Income formula mismatch detected. Review monthly fee, admission, dress, and extra income ledger rows.',
    })
  }

  const feeLedgerRows = ((ledger.entries as Record<string, unknown>[]) || []).map((entry) => {
    const feeType = String(entry.feeType || 'monthly')
    const amount = readAmount(entry.amount)
    const isCredit = feeType === 'credit_adjustment'
    const paid = String(entry.status || '') === 'paid'
    return {
      id: String(entry.id || entry.key || ''),
      date: compactDate(entry.paidDate) || `${year}-${String(selectedMonth + 1).padStart(2, '0')}-01`,
      month: monthIndex(entry.month),
      year: readAmount(entry.year) || year,
      branch: feeTrackScope(entry.branch),
      label: isCredit
        ? `Credit applied - ${entry.athleteName || 'SKF Athlete'}`
        : `${ledgerCategoryLabel(feeType)} - ${entry.athleteName || 'SKF Athlete'}`,
      category: feeType,
      type: isCredit ? 'credit' : paid ? 'income' : 'pending',
      amount: isCredit ? -amount : amount,
      studentId: String(entry.skfId || ''),
      studentName: String(entry.athleteName || ''),
      receiptId: String(entry.receiptId || ''),
      status: String(entry.status || ''),
      formulaKey: !paid && !isCredit ? 'pending' : ledgerFormulaKey(feeType),
    }
  })

  const expenseLedgerRows = (((finance.expenses as Record<string, unknown>[]) || [])
    .filter((expense) => monthName(expense.month) === month)
    .map((expense) => ({
      id: String(expense.id || expense.expense_code || ''),
      date: compactDate(expense.created_at),
      month: selectedMonth,
      year,
      branch: feeTrackScope(expense.scope),
      label: String(expense.title || expense.description || 'Development expense'),
      category: 'development_expense',
      type: 'expense',
      amount: -readAmount(expense.amount),
      studentId: '',
      studentName: '',
      receiptId: '',
      status: 'recorded',
      formulaKey: 'developmentExpenses',
    })))

  const extraIncomeLedgerRows = (((finance.extraIncomes as Record<string, unknown>[]) || [])
    .filter((income) => monthName(income.month) === month)
    .map((income) => ({
      id: String(income.id || income.income_code || ''),
      date: compactDate(income.created_at),
      month: selectedMonth,
      year,
      branch: feeTrackScope(income.scope),
      label: String(income.title || income.description || 'Extra income'),
      category: 'extra_income',
      type: 'income',
      amount: readAmount(income.amount),
      studentId: '',
      studentName: '',
      receiptId: '',
      status: 'recorded',
      formulaKey: 'extraIncome',
    })))

  return {
    success: true,
    data: {
      month: selectedMonth,
      year,
      periodLabel: `${month} ${year}`,
      branch: branch ? feeTrackScope(branch) : 'Overall',
      summary: {
        activeStudents: readAmount(dashboard.summary.students),
        paidStudents: readAmount(dashboard.summary.paidCount),
        pendingStudents: readAmount(dashboard.summary.pendingCount),
        expected,
        collected,
        pending,
        creditsApplied,
        monthlyFeeCash,
        admissionCollected,
        dressProfit,
        extraIncome,
        grossIncome,
        developmentFundContribution,
        developmentExpenses,
        developmentFundBalance,
        availableBalance,
        collectionRate: readAmount(dashboard.summary.collectionRate),
      },
      incomeBreakdown: [
        {
          key: 'monthlyFeeCash',
          label: 'Monthly fee cash',
          amount: monthlyFeeCash,
          formula: financeFormulae().monthlyFeeCash,
        },
        {
          key: 'admissionCollected',
          label: 'Admission collected',
          amount: admissionCollected,
          formula: 'Admission fee rows marked paid.',
        },
        {
          key: 'dressProfit',
          label: 'Dress profit',
          amount: dressProfit,
          formula: 'Dress fee collected minus dress cost.',
        },
        {
          key: 'extraIncome',
          label: 'Extra income',
          amount: extraIncome,
          formula: 'Additional revenue like summer camps, events, etc.',
        },
      ],
      expenseBreakdown: [
        {
          key: 'developmentExpenses',
          label: 'Development expenses',
          amount: developmentExpenses,
          formula: 'Recorded development fund expenses for the selected month.',
        },
      ],
      cashFlowByMonth: financeRows.map((row) => {
        const income = hasAmount(row.grossIncome)
          ? readSignedAmount(row.grossIncome)
          : readAmount(row.monthlyCash) + readAmount(row.admissionCollected) + readSignedAmount(row.dressProfit)
        return {
          month: monthIndex(row.month),
          year: readAmount(row.year) || year,
          income,
          developmentFundContribution: readAmount(row.developmentAllocation),
          expenses: readAmount(row.developmentExpenses),
          net: readSignedAmount(row.bankMovement),
          balance: readSignedAmount(row.cumulativeBank),
          developmentFundBalance: readSignedAmount(row.cumulativeDevelopmentFund),
        }
      }),
      ledgerRows: [...feeLedgerRows, ...expenseLedgerRows, ...extraIncomeLedgerRows].sort((a, b) =>
        b.date.localeCompare(a.date) || a.label.localeCompare(b.label)
      ),
      warnings,
      formulas: financeFormulae(),
    },
  }
}

async function getFinancialSummary(session: FeeTrackSession, body: ActionBody) {
  const branch = normalizeBranch(body.branch, { allowOverall: true })
  const month = monthName(body.month)
  const year = targetYear(body.year)
  const [dashboard, finance, ledger] = await Promise.all([
    FeeOperationsService.getDashboard(session, {
      year,
      month,
      city: 'bangalore',
      branch,
    }),
    FeeOperationsService.getFinance(session, {
      year,
      month,
      city: 'bangalore',
      branch,
    }),
    FeeOperationsService.getLedger(session, {
      year,
      month,
      city: 'bangalore',
      branch,
      feeType: 'all',
    }),
  ])
  const monthRow = finance.monthlyBreakdown.find((row: Record<string, unknown>) => row.month === month) || {}
  const isOverall = !branch
  const reserveAmount = isOverall ? readAmount(finance.bankPosition?.reserveAmount) : 0
  const actualBankBalance = isOverall
    ? readSignedAmount(finance.bankPosition?.actualBankBalance)
    : readSignedAmount(monthRow.bankMovement)
  const creditDetails = ledger.entries
    .filter((entry: Record<string, unknown>) => entry.feeType === 'credit_adjustment' && entry.status === 'paid')
    .map((entry: Record<string, unknown>) => ({
      studentName: String(entry.athleteName || ''),
      amount: readAmount(entry.amount),
      reason: 'Fee credit',
      description: String(entry.notes || ''),
      date: compactDate(entry.paidDate),
    }))

  return {
    success: true,
    data: {
      month: monthIndex(month),
      branch: branch || 'Overall',
      activeStudents: dashboard.summary.students,
      paidStudents: dashboard.summary.paidCount,
      pendingStudents: dashboard.summary.pendingCount,
      expected: dashboard.summary.expected,
      collected: dashboard.summary.collected,
      pending: dashboard.summary.pending,
      creditsApplied: readAmount(monthRow.creditsApplied),
      creditDetails,
      actualReceived: readSignedAmount(monthRow.bankMovement),
      actualBankBalance,
      devFundAllocation: readAmount(monthRow.developmentAllocation),
      devFundSpent: readAmount(monthRow.developmentExpenses),
      devFundBalance: readSignedAmount(finance.bankPosition?.developmentFundBalance),
      totalContributions: readAmount(finance.bankPosition?.developmentAllocation),
      availableBalance: readSignedAmount(finance.bankPosition?.developmentFundBalance),
      yearlyBreakdown: finance.monthlyBreakdown.map((row: Record<string, unknown>) => ({
        month: String(row.month || '').slice(0, 3),
        revenue: hasAmount(row.grossIncome)
          ? readSignedAmount(row.grossIncome)
          : readAmount(row.monthlyCash) + readAmount(row.admissionCollected) + readSignedAmount(row.dressProfit),
        devFund: readAmount(row.developmentAllocation),
        expenses: readAmount(row.developmentExpenses),
        net: readSignedAmount(row.bankMovement),
        cumulativeRevenue: readSignedAmount(row.cumulativeBank),
        cumulativeBank: readSignedAmount(row.cumulativeBank),
      })),
      admissionCollected: readAmount(monthRow.admissionCollected),
      dressProfit: readSignedAmount(monthRow.dressProfit),
      grossIncome: hasAmount(monthRow.grossIncome)
        ? readSignedAmount(monthRow.grossIncome)
        : readAmount(monthRow.monthlyCash) + readAmount(monthRow.admissionCollected) + readSignedAmount(monthRow.dressProfit),
      reserveUsed: reserveAmount,
    },
  }
}

async function handleAction(body: ActionBody) {
  if (body.action === 'login') return login(body)

  const session = assertStaff(body)

  switch (body.action) {
    case 'get_students':
      return getStudents(session, body)
    case 'mark_paid':
      return markPaid(session, body)
    case 'mark_paid_with_credit':
      return markPaidWithCredit(session, body)
    case 'mark_break':
      return runStatusAction(session, body, 'mark_break')
    case 'mark_discontinued':
      return runStatusAction(session, body, 'mark_discontinued')
    case 'resume_student':
      return resumeStudent(session, body)
    case 'mark_non_recurring_paid':
      return markNonRecurringPaid(session, body)
    case 'add_student':
      throw new ValidationError({
        student: ['Add students from the SKF-Karate admin so DOB, portal login, belt, and billing data stay complete.'],
      })
    case 'get_branch_counts':
      return getBranchCounts(session)
    case 'get_payment_verifications':
      return getPaymentVerifications(session, body)
    case 'approve_payment_verification':
      return approvePaymentVerification(session, body)
    case 'reject_payment_verification':
      return rejectPaymentVerification(session, body)
    case 'get_referral_credits':
      return getCredits(session, body)
    case 'add_referral_credit':
      return addReferralCredit(session, body)
    case 'get_student_credits':
      return getStudentCredits(session, body)
    case 'get_dev_fund':
      return getDevelopmentFund(session, body)
    case 'add_dev_expense':
      return addDevelopmentExpense(session, body)
    case 'delete_dev_expense':
      return deleteDevelopmentExpense(session, body)
    case 'add_extra_income':
      return addExtraIncome(session, body)
    case 'delete_extra_income':
      return deleteExtraIncome(session, body)
    case 'get_finance_command_center':
      return getFinanceCommandCenter(session, body)
    case 'get_financial_summary':
      return getFinancialSummary(session, body)
    default:
      throw new ValidationError({ action: ['Unsupported FeeTrack action.'] })
  }
}

export async function POST(request: Request) {
  try {
    assertApiKey(request)
    const body = await request.json() as ActionBody
    return json(await handleAction(body))
  } catch (error) {
    logger.error('feetrack.integration_failed', { error })
    if (error instanceof AppError) {
      return json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.expose ? error.details : undefined,
      }, error.statusCode)
    }

    return json({
      success: false,
      error: 'FeeTrack integration failed.',
    }, 500)
  }
}

export async function GET() {
  return json({
    success: true,
    service: 'SKF-Karate FeeTrack integration',
    configured: Boolean(process.env.FEETRACK_API_KEY),
  })
}
