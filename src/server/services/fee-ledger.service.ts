import type { FeeRow } from '@/types'
import {
  ensureFeeRowsForStudent,
  findFeeByReceiptIdLive,
  getAllFeesLive,
  getFeesBySkfIdLive,
  getStudentBySkfId,
  markFeeAsPaid,
  markFeeStatus,
} from '@/lib/server/sheets'
import {
  getAllAthletesLive,
  getAthleteByRegistrationNumberLive,
} from '@/lib/server/repositories/athletes-live'

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

type LedgerStatus = 'paid' | 'due' | 'overdue'

type AthleteLike = {
  registrationNumber?: string | null
  firstName?: string | null
  lastName?: string | null
  branchName?: string | null
  monthlyFee?: number | null
  joinDate?: string | null
  status?: string | null
  pointsBalance?: number | null
  pointsLifetime?: number | null
}

export interface FeeLedgerEntry {
  key: string
  skfId: string
  athleteName: string
  branch: string
  month: string
  monthIndex: number
  year: number
  amount: number
  status: LedgerStatus
  paidDate: string | null
  receiptId: string | null
  paymentMethod: string | null
}

function toMonthName(input: string): string {
  const normalized = String(input || '').trim().toLowerCase()
  if (!normalized) return ''

  const month = MONTHS.find((candidate) => {
    const full = candidate.toLowerCase()
    const short = candidate.slice(0, 3).toLowerCase()
    return normalized === full || normalized === short
  })

  return month || String(input || '').trim()
}

function getMonthIndex(input: string): number {
  const normalizedName = toMonthName(input)
  return MONTHS.findIndex((month) => month === normalizedName)
}

function deriveLedgerStatus(row: FeeRow): LedgerStatus {
  if (row.status === 'paid') return 'paid'
  if (row.status === 'overdue') return 'overdue'

  const monthIndex = getMonthIndex(row.month)
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  if (row.year < currentYear) return 'overdue'
  if (row.year === currentYear && monthIndex >= 0 && monthIndex < currentMonth) return 'overdue'
  return 'due'
}

function buildAthleteDisplayName(athlete?: AthleteLike | null): string {
  if (!athlete) return 'SKF Athlete'
  const fullName = [athlete.firstName, athlete.lastName].filter(Boolean).join(' ').trim()
  return fullName || 'SKF Athlete'
}

function normalizeRupees(value: unknown): number {
  const amount = Number(value || 0)
  return Number.isFinite(amount) ? Math.max(0, amount) : 0
}

function buildReceiptId(skfId: string, month: string, year: number) {
  const monthIndex = getMonthIndex(month)
  const monthToken = monthIndex >= 0 ? MONTHS[monthIndex].slice(0, 3).toUpperCase() : String(month || '').slice(0, 3).toUpperCase()
  return `RCP_${skfId}_${monthToken}_${year}`
}

export class FeeLedgerService {
  static async getPortalLedger(skfId: string, year?: number) {
    const normalizedSkfId = String(skfId || '').trim().toUpperCase()
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth()
    const requestedYear = Number(year || currentYear)
    const targetYear = Number.isFinite(requestedYear)
      ? Math.min(Math.max(2020, Math.trunc(requestedYear)), currentYear)
      : currentYear

    const [athlete, initialFeeRows] = await Promise.all([
      getAthleteByRegistrationNumberLive(normalizedSkfId),
      getFeesBySkfIdLive(normalizedSkfId, targetYear),
    ])
    let student: Awaited<ReturnType<typeof getStudentBySkfId>> | null = null
    let feeRows = initialFeeRows

    // Sync only when needed for the current year to avoid expensive work on every request.
    if (targetYear === currentYear) {
      const hasCurrentMonthRow = feeRows.some((row) => getMonthIndex(row.month) === currentMonth)
      if (!hasCurrentMonthRow) {
        await ensureFeeRowsForStudent(normalizedSkfId, {
          monthlyFee: normalizeRupees(athlete?.monthlyFee || 0),
          enrolledDate: String(athlete?.joinDate || '').trim() || undefined,
          year: currentYear,
        })
        feeRows = await getFeesBySkfIdLive(normalizedSkfId, targetYear)
      }
    }

    const athleteName = buildAthleteDisplayName(athlete)
    const athleteBranch = String(athlete?.branchName || '').trim()
    if (!athleteBranch) {
      student = await getStudentBySkfId(normalizedSkfId)
    }
    const branch = athleteBranch || String(student?.branch || '').trim() || 'SKF Branch'

    const entries: FeeLedgerEntry[] = feeRows
      .map((row) => {
        const month = toMonthName(row.month)
        const monthIndex = getMonthIndex(month)
        return {
          key: `${row.skfId}:${month}:${row.year}`,
          skfId: row.skfId,
          athleteName,
          branch,
          month,
          monthIndex,
          year: row.year,
          amount: normalizeRupees(row.amount),
          status: deriveLedgerStatus(row),
          paidDate: row.paidDate || null,
          receiptId: row.receiptId || null,
          paymentMethod: row.paymentMethod || null,
        }
      })
      .filter((entry) => (targetYear === currentYear ? entry.monthIndex <= currentMonth : true))
      .sort((a, b) => (b.year - a.year) || (b.monthIndex - a.monthIndex))

    const paid = entries.filter((entry) => entry.status === 'paid')
    const due = entries.filter((entry) => entry.status !== 'paid')
    const nextDue = [...due].sort((a, b) => (a.year - b.year) || (a.monthIndex - b.monthIndex))[0] || null

    return {
      brand: {
        featureName: 'Monthly Training Fee',
        subtitle: 'Training Fee Status & Receipts',
      },
      profile: {
        skfId: normalizedSkfId,
        athleteName,
        branch,
      },
      summary: {
        year: targetYear,
        totalExpected: entries.reduce((sum, row) => sum + row.amount, 0),
        totalPaid: paid.reduce((sum, row) => sum + row.amount, 0),
        totalDue: due.reduce((sum, row) => sum + row.amount, 0),
        paidCount: paid.length,
        dueCount: due.length,
      },
      nextDue,
      entries,
    }
  }

  static async createPaymentOrderTarget(skfId: string, year?: number, month?: string) {
    const ledger = await this.getPortalLedger(skfId, year)

    if (month) {
      const normalizedMonth = toMonthName(month)
      const selected = ledger.entries.find(
        (entry) =>
          entry.month.toLowerCase() === normalizedMonth.toLowerCase() &&
          entry.year === (year || ledger.summary.year) &&
          entry.status !== 'paid'
      )
      if (selected) {
        return selected
      }
    }

    return ledger.nextDue
  }

  static async getAdminLedger(filters?: {
    year?: number
    month?: string
    status?: LedgerStatus | 'all'
    branch?: string
    search?: string
  }) {
    const targetYear = Number(filters?.year || new Date().getFullYear())
    const allFees = await getAllFeesLive(targetYear)
    const athletes = (await getAllAthletesLive()) as AthleteLike[]
    const athleteBySkfId = new Map(
      athletes.map((athlete) => [String(athlete.registrationNumber || '').toUpperCase(), athlete] as const)
    )

    const search = String(filters?.search || '').trim().toLowerCase()
    const statusFilter = String(filters?.status || 'all').toLowerCase()
    const branchFilter = String(filters?.branch || '').trim().toLowerCase()
    const monthFilter = toMonthName(String(filters?.month || '').trim())

    const entries = allFees
      .map((row) => {
        const skfId = String(row.skfId || '').trim().toUpperCase()
        const athlete = athleteBySkfId.get(skfId)
        const athleteName = buildAthleteDisplayName(athlete)
        const branch = String(athlete?.branchName || '').trim() || 'Unknown'
        const month = toMonthName(row.month)
        const monthIndex = getMonthIndex(month)
        const status = deriveLedgerStatus(row)

        return {
          key: `${skfId}:${month}:${row.year}`,
          skfId,
          athleteName,
          branch,
          month,
          monthIndex,
          year: row.year,
          amount: normalizeRupees(row.amount),
          status,
          paidDate: row.paidDate || null,
          receiptId: row.receiptId || null,
          paymentMethod: row.paymentMethod || null,
        } satisfies FeeLedgerEntry
      })
      .filter((entry) => (monthFilter ? entry.month.toLowerCase() === monthFilter.toLowerCase() : true))
      .filter((entry) => (statusFilter === 'all' ? true : entry.status === statusFilter))
      .filter((entry) => (branchFilter ? entry.branch.toLowerCase() === branchFilter : true))
      .filter((entry) => {
        if (!search) return true
        return (
          entry.skfId.toLowerCase().includes(search) ||
          entry.athleteName.toLowerCase().includes(search) ||
          entry.branch.toLowerCase().includes(search)
        )
      })
      .sort((a, b) => (b.year - a.year) || (b.monthIndex - a.monthIndex) || a.athleteName.localeCompare(b.athleteName))

    const summary = {
      totalRows: entries.length,
      totalExpected: entries.reduce((sum, row) => sum + row.amount, 0),
      totalPaid: entries.filter((row) => row.status === 'paid').reduce((sum, row) => sum + row.amount, 0),
      totalDue: entries.filter((row) => row.status !== 'paid').reduce((sum, row) => sum + row.amount, 0),
      paidCount: entries.filter((row) => row.status === 'paid').length,
      dueCount: entries.filter((row) => row.status === 'due').length,
      overdueCount: entries.filter((row) => row.status === 'overdue').length,
    }

    const activeAthletes = athletes.filter(
      (athlete) => String(athlete?.status || '').toLowerCase() === 'active'
    )
    const trackedAthletes = new Set(entries.map((entry) => entry.skfId)).size
    const activeBranches = new Set(
      activeAthletes
        .map((athlete) => String(athlete?.branchName || '').trim().toLowerCase())
        .filter(Boolean)
    ).size
    const creditsInCirculation = activeAthletes.reduce(
      (sum, athlete) => sum + Number(athlete?.pointsBalance || 0),
      0
    )
    const lifetimeCredits = activeAthletes.reduce(
      (sum, athlete) => sum + Number(athlete?.pointsLifetime || 0),
      0
    )
    const creditHolders = activeAthletes.filter((athlete) => Number(athlete?.pointsBalance || 0) > 0).length

    return {
      brand: {
        featureName: 'Training Fee Console',
        subtitle: 'Monthly Training Fee Operations',
      },
      filters: {
        year: targetYear,
        month: monthFilter || 'All',
        status: statusFilter,
        branch: branchFilter || 'all',
        search: search || '',
      },
      summary,
      operations: {
        activeAthletes: activeAthletes.length,
        trackedAthletes,
        activeBranches,
        creditsInCirculation,
        lifetimeCredits,
        creditHolders,
      },
      entries,
    }
  }

  static async markPaid(input: {
    skfId: string
    month: string
    year: number
    paymentMethod?: string
    paymentReference?: string
    receiptId?: string
  }) {
    const skfId = String(input.skfId || '').trim().toUpperCase()
    const month = toMonthName(input.month)
    const year = Number(input.year || new Date().getFullYear())

    if (!skfId || !month || !year) {
      throw new Error('Invalid fee payment request.')
    }

    const athlete = await getAthleteByRegistrationNumberLive(skfId)
    await ensureFeeRowsForStudent(skfId, {
      monthlyFee: normalizeRupees(athlete?.monthlyFee || 0),
      enrolledDate: String(athlete?.joinDate || '').trim() || undefined,
      year,
    })

    const receiptId = String(input.receiptId || '').trim() || buildReceiptId(skfId, month, year)
    const paymentMethod = [String(input.paymentMethod || '').trim(), String(input.paymentReference || '').trim()]
      .filter(Boolean)
      .join(' • ') || 'Manual'

    const updated = await markFeeAsPaid(skfId, month, receiptId, paymentMethod, year)
    if (!updated) {
      throw new Error('Unable to mark fee as paid.')
    }

    return {
      success: true,
      skfId,
      month,
      year,
      receiptId,
      paymentMethod,
    }
  }

  static async markDue(input: { skfId: string; month: string; year: number }) {
    const skfId = String(input.skfId || '').trim().toUpperCase()
    const month = toMonthName(input.month)
    const year = Number(input.year || new Date().getFullYear())
    if (!skfId || !month || !year) {
      throw new Error('Invalid fee status request.')
    }

    const updated = await markFeeStatus(skfId, month, year, {
      status: 'due',
      paidDate: '',
      receiptId: '',
      paymentMethod: '',
    })
    if (!updated) {
      throw new Error('Unable to mark fee as due.')
    }

    return { success: true, skfId, month, year }
  }

  static async syncStudent(input: {
    skfId: string
    monthlyFee?: number
    enrolledDate?: string
    year?: number
  }) {
    const skfId = String(input.skfId || '').trim().toUpperCase()
    if (!skfId) {
      throw new Error('Missing SKF ID.')
    }

    const athlete = await getAthleteByRegistrationNumberLive(skfId)
    const result = await ensureFeeRowsForStudent(skfId, {
      monthlyFee: normalizeRupees(input.monthlyFee ?? athlete?.monthlyFee ?? 0),
      enrolledDate: String(input.enrolledDate || athlete?.joinDate || '').trim() || undefined,
      year: Number(input.year || new Date().getFullYear()),
      overwriteAmount: true,
    })

    return {
      success: true,
      skfId,
      ...result,
    }
  }

  static async syncAllActiveAthletes(year?: number) {
    const targetYear = Number(year || new Date().getFullYear())
    const athletes = (await getAllAthletesLive()) as AthleteLike[]
    const activeAthletes = athletes.filter(
      (athlete) => String(athlete?.status || '').toLowerCase() === 'active'
    )

    let created = 0
    let updated = 0
    for (const athlete of activeAthletes) {
      const result = await ensureFeeRowsForStudent(String(athlete.registrationNumber || ''), {
        monthlyFee: normalizeRupees(athlete.monthlyFee || 0),
        enrolledDate: String(athlete.joinDate || '').trim() || undefined,
        year: targetYear,
        overwriteAmount: true,
      })
      created += result.created
      updated += result.updated
    }

    return {
      success: true,
      year: targetYear,
      athletes: activeAthletes.length,
      created,
      updated,
    }
  }

  static async getReceiptData(skfId: string, receiptId: string) {
    const normalizedSkfId = String(skfId || '').trim().toUpperCase()
    const normalizedReceiptId = String(receiptId || '').trim()
    if (!normalizedSkfId || !normalizedReceiptId) {
      return null
    }

    const receiptRow = await findFeeByReceiptIdLive(normalizedReceiptId)
    if (!receiptRow) return null
    if (String(receiptRow.skfId || '').trim().toUpperCase() !== normalizedSkfId) return null

    const [athlete, student] = await Promise.all([
      getAthleteByRegistrationNumberLive(normalizedSkfId),
      getStudentBySkfId(normalizedSkfId),
    ])

    const athleteName = buildAthleteDisplayName(athlete) || student?.name || 'SKF Athlete'
    const branch = String(athlete?.branchName || student?.branch || '').trim() || 'SKF Branch'
    const paidDate = receiptRow.paidDate || new Date().toISOString()

    const branchAddressMap: Record<string, string> = {
      herohalli: 'SKF Karate, Herohalli, Bengaluru',
      'mp sports club': 'SKF Karate, MP Sports Club, Bengaluru',
      mpsc: 'SKF Karate, MP Sports Club, Bengaluru',
    }
    const dojoAddress = branchAddressMap[branch.trim().toLowerCase()] || `SKF Karate, ${branch}`

    return {
      receiptId: normalizedReceiptId,
      skfId: normalizedSkfId,
      athleteName,
      branch,
      month: toMonthName(receiptRow.month),
      year: receiptRow.year,
      amount: normalizeRupees(receiptRow.amount),
      paidDate,
      paymentMethod: receiptRow.paymentMethod || 'Manual Entry',
      dojoAddress,
    }
  }
}
