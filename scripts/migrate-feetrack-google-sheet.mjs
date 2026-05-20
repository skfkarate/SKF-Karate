#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'

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
]

const MONTH_COLUMNS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const BRANCHES = [
  {
    key: 'Herohalli',
    dbSheet: 'DB_Herohalli',
    feesSheet: 'Fees_Herohalli',
    creditsSheet: 'ReferralCredits_Herohalli',
    branchName: 'Herohalli',
  },
  {
    key: 'MPSC',
    dbSheet: 'DB_MP',
    feesSheet: 'Fees_MP',
    creditsSheet: 'ReferralCredits_MP',
    branchName: 'M P Sports Club',
  },
]

function loadDotEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf8')
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const index = trimmed.indexOf('=')
    if (index <= 0) continue
    const key = trimmed.slice(0, index).trim()
    let value = trimmed.slice(index + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadDotEnvFile(path.resolve(process.cwd(), '.env.local'))
loadDotEnvFile(path.resolve(process.cwd(), '.env'))

const args = new Set(process.argv.slice(2))
const dryRun = !args.has('--apply')
const targetYear = Number(process.env.FEETRACK_MIGRATION_YEAR || new Date().getFullYear())
const sheetId = process.env.FEETRACK_GOOGLE_SHEET_ID || process.env.GOOGLE_SHEET_ID

const report = {
  dryRun,
  sheetId: sheetId ? 'configured' : 'missing',
  targetYear,
  read: {},
  skipped: [],
  warnings: [],
  upserts: {
    athletes: 0,
    billingProfiles: 0,
    feeRecords: 0,
    feeReceipts: 0,
    feeCredits: 0,
    developmentExpenses: 0,
    specialDays: 0,
  },
}

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required.`)
  }
  return value
}

function cell(row, index) {
  return row[index] === null || row[index] === undefined ? '' : String(row[index]).trim()
}

function normalizeSkfId(value) {
  return String(value || '').trim().toUpperCase()
}

function normalizeBranch(value, fallback) {
  const key = String(value || fallback || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ')
  if (['mpsc', 'mp', 'mp sports club', 'm p sports club'].includes(key.trim())) return 'M P Sports Club'
  if (key.includes('herohalli')) return 'Herohalli'
  return fallback
}

function normalizeDate(value) {
  const text = String(value || '').trim()
  if (!text) return ''

  const dmy = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/)
  if (dmy) return validDate(dmy[3], dmy[2], dmy[1]) || ''

  const ymd = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  if (ymd) return validDate(ymd[1], ymd[2], ymd[3]) || ''

  const parsed = new Date(text)
  if (Number.isNaN(parsed.getTime())) return ''
  return parsed.toISOString().slice(0, 10)
}

function validDate(year, month, day) {
  const yyyy = String(year).padStart(4, '0')
  const mm = String(month).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  const parsed = new Date(`${yyyy}-${mm}-${dd}T00:00:00.000Z`)
  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getUTCFullYear() !== Number(yyyy) ||
    parsed.getUTCMonth() + 1 !== Number(mm) ||
    parsed.getUTCDate() !== Number(dd)
  ) {
    return ''
  }
  return `${yyyy}-${mm}-${dd}`
}

function numberValue(value) {
  const normalized = String(value || '').replace(/[^\d.-]/g, '')
  const parsed = Number(normalized || 0)
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0
}

function monthStartDate(joinMonth) {
  const index = Number(joinMonth)
  const month = Number.isFinite(index) ? Math.min(11, Math.max(0, Math.trunc(index))) : 0
  return `${targetYear}-${String(month + 1).padStart(2, '0')}-01`
}

function splitName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return { firstName: '', lastName: '' }
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

function feeStatus(value) {
  const key = String(value || '').trim().toLowerCase()
  if (!key || key === 'pending' || key === 'due' || key === 'unpaid') return 'due'
  if (key === 'paid' || key === 'yes' || key === 'true') return 'paid'
  if (key === 'break' || key === 'pause' || key === 'paused') return 'break'
  if (key === 'waived' || key === 'n/a' || key === 'na') return 'waived'
  if (key === 'discontinued' || key === 'left' || key === 'inactive') return 'waived'
  report.warnings.push(`Unknown fee status "${value}" mapped to due.`)
  return 'due'
}

function receiptId(skfId, feeType, month, year) {
  const monthNumber = String(Math.max(1, MONTHS.indexOf(month) + 1)).padStart(2, '0')
  const typeCode = feeType === 'admission' ? 'ADM' : feeType === 'dress' ? 'DRS' : 'MON'
  return `SKF-FEE-${year}-${monthNumber}-${typeCode}-${normalizeSkfId(skfId)}`
}

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: requireEnv('GOOGLE_SERVICE_ACCOUNT_EMAIL'),
      private_key: requireEnv('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })
  return google.sheets({ version: 'v4', auth })
}

async function readSheet(sheets, range) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range,
  })
  const rows = response.data.values || []
  report.read[range] = Math.max(0, rows.length - 1)
  return rows.slice(1)
}

async function writeOrDry(label, fn) {
  if (dryRun) {
    report.upserts[label] += 1
    return null
  }

  const result = await fn()
  report.upserts[label] += 1
  return result
}

async function upsertAthlete(supabase, student) {
  const skfId = normalizeSkfId(student.skfId)
  const dob = normalizeDate(student.dateOfBirth)
  if (!skfId || !student.name || !dob) {
    report.skipped.push({
      type: 'athlete',
      skfId,
      name: student.name,
      reason: 'Missing SKF ID, name, or DOB. Athlete and portal login not created.',
    })
    return null
  }

  const { firstName, lastName } = splitName(student.name)
  const now = new Date().toISOString()
  const row = {
    id: `athlete_${skfId.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    skf_id: skfId,
    first_name: firstName,
    last_name: lastName,
    date_of_birth: dob,
    gender: 'male',
    photo_url: null,
    branch_name: student.branchName,
    current_belt: 'white',
    join_date: student.billingStartDate,
    status: student.status === 'Inactive' ? 'inactive' : 'active',
    parent_name: student.parentName || null,
    phone: student.phone || null,
    email: student.email || null,
    batch: null,
    monthly_fee: student.monthlyFee,
    photo_consent: false,
    is_public: true,
    is_featured: false,
    achievements: [],
    points_history: [],
    points_balance: 0,
    points_lifetime: 0,
    updated_at: now,
  }

  return writeOrDry('athletes', async () => {
    const { data, error } = await supabase
      .from('athletes')
      .upsert(row, { onConflict: 'skf_id' })
      .select('skf_id')
      .single()
    if (error) throw error
    return data
  })
}

async function upsertBillingProfile(supabase, student) {
  const row = {
    skf_id: normalizeSkfId(student.skfId),
    billing_status: student.status === 'Inactive' ? 'discontinued' : 'active',
    monthly_fee: student.monthlyFee,
    admission_fee: student.admissionFee,
    dress_fee: student.dressFee,
    dress_cost: student.dressCost,
    billing_start_date: student.billingStartDate,
    billing_end_date: student.endMonth === '' ? null : monthStartDate(student.endMonth),
    branch_snapshot: student.branchName,
    updated_at: new Date().toISOString(),
  }

  if (!row.skf_id) return

  return writeOrDry('billingProfiles', async () => {
    const { error } = await supabase
      .from('student_billing_profiles')
      .upsert(row, { onConflict: 'skf_id' })
    if (error) throw error
  })
}

async function upsertFeeRecord(supabase, row) {
  return writeOrDry('feeRecords', async () => {
    const { data, error } = await supabase
      .from('fee_records')
      .upsert(row, { onConflict: 'skf_id,fee_type,month,year' })
      .select('*')
      .single()
    if (error) throw error
    return data
  })
}

async function ensureReceipt(supabase, feeRow, studentName, branchName) {
  if (!feeRow || feeRow.status !== 'paid' || feeRow.fee_type === 'credit_adjustment') return

  return writeOrDry('feeReceipts', async () => {
    const issuedAt = feeRow.paid_date || new Date().toISOString()
    const payload = {
      receipt_id: feeRow.receipt_id,
      fee_record_id: feeRow.id,
      skf_id: feeRow.skf_id,
      student_name: studentName,
      branch: branchName,
      fee_type: feeRow.fee_type.replace(/_/g, ' '),
      month: feeRow.month,
      year: feeRow.year,
      amount: feeRow.amount,
      paid_date: issuedAt,
      payment_method: feeRow.payment_method || 'Migrated Sheet',
      verified_by: feeRow.verified_by || 'Migration',
      verified_at: feeRow.verified_at || issuedAt,
      dojo_address: `SKF Karate, ${branchName}`,
      theme_id: 'skf_classic',
      issued_at: issuedAt,
      snapshot: {},
    }
    payload.snapshot = {
      receiptId: payload.receipt_id,
      skfId: payload.skf_id,
      studentName: payload.student_name,
      branch: payload.branch,
      feeType: payload.fee_type,
      month: payload.month,
      year: payload.year,
      amount: payload.amount,
      paidDate: payload.paid_date,
      paymentMethod: payload.payment_method,
      verifiedBy: payload.verified_by,
      verifiedAt: payload.verified_at,
      dojoAddress: payload.dojo_address,
      themeId: payload.theme_id,
      issuedAt,
    }

    const { error } = await supabase
      .from('fee_receipts')
      .upsert(payload, { onConflict: 'receipt_id' })
    if (error) throw error
  })
}

async function migrateStudents(supabase, sheets) {
  const studentsBySkfId = new Map()

  for (const branch of BRANCHES) {
    const rows = await readSheet(sheets, `${branch.dbSheet}!A:P`)
    for (const row of rows) {
      const skfId = normalizeSkfId(cell(row, 0))
      if (!skfId) continue
      const student = {
        skfId,
        name: cell(row, 1),
        parentName: cell(row, 2),
        status: cell(row, 3).toLowerCase() === 'inactive' ? 'Inactive' : 'Active',
        monthlyFee: numberValue(cell(row, 4)),
        phone: cell(row, 5),
        whatsapp: cell(row, 6),
        dateOfBirth: cell(row, 7),
        email: cell(row, 8),
        joinMonth: cell(row, 9) || 0,
        endMonth: cell(row, 10),
        admissionFee: numberValue(cell(row, 11)),
        admissionStatus: cell(row, 12),
        dressFee: numberValue(cell(row, 13)),
        dressCost: numberValue(cell(row, 14)),
        dressStatus: cell(row, 15),
        branchName: normalizeBranch(branch.key, branch.branchName),
        billingStartDate: monthStartDate(cell(row, 9) || 0),
      }
      studentsBySkfId.set(skfId, student)
      await upsertAthlete(supabase, student)
      await upsertBillingProfile(supabase, student)
    }
  }

  return studentsBySkfId
}

async function migrateFees(supabase, sheets, studentsBySkfId) {
  for (const branch of BRANCHES) {
    const rows = await readSheet(sheets, `${branch.feesSheet}!A:O`)
    for (const row of rows) {
      const skfId = normalizeSkfId(cell(row, 0))
      if (!skfId) continue
      const student = studentsBySkfId.get(skfId) || {
        name: cell(row, 1),
        branchName: branch.branchName,
        monthlyFee: numberValue(cell(row, 2)),
      }
      const amount = numberValue(cell(row, 2)) || numberValue(student.monthlyFee)
      const year = Number(cell(row, 3) || targetYear)

      for (let index = 0; index < MONTHS.length; index += 1) {
        const month = MONTHS[index]
        const status = feeStatus(cell(row, 4 + index))
        const paid = status === 'paid'
        const id = receiptId(skfId, 'monthly', month, year)
        const feeRow = await upsertFeeRecord(supabase, {
          skf_id: skfId,
          fee_type: 'monthly',
          month,
          year,
          amount,
          status,
          paid_date: paid ? new Date(Date.UTC(year, index, 10)).toISOString() : null,
          receipt_id: paid ? id : null,
          payment_method: paid ? 'Migrated Sheet' : null,
          verified_by: paid ? 'Migration' : null,
          verified_at: paid ? new Date(Date.UTC(year, index, 10)).toISOString() : null,
          metadata: { migratedFrom: branch.feesSheet, sourceColumn: MONTH_COLUMNS[index] },
          updated_at: new Date().toISOString(),
        })
        await ensureReceipt(supabase, feeRow, student.name, student.branchName)
      }
    }
  }
}

async function migrateCredits(supabase, sheets) {
  for (const branch of BRANCHES) {
    const rows = await readSheet(sheets, `${branch.creditsSheet}!A:H`)
    for (const row of rows) {
      const code = cell(row, 0) || `CR_${normalizeSkfId(cell(row, 1))}_${Date.now().toString(36)}`
      const skfId = normalizeSkfId(cell(row, 1))
      if (!skfId) continue
      const usedMonth = cell(row, 6)
      const payload = {
        credit_code: code,
        skf_id: skfId,
        branch: branch.branchName,
        amount: numberValue(cell(row, 3)),
        reason: cell(row, 4),
        description: cell(row, 4),
        status: usedMonth ? 'used' : 'available',
        earned_at: normalizeDate(cell(row, 5)) || new Date().toISOString(),
        used_month: usedMonth ? monthFromZeroBasedSheetValue(usedMonth) : null,
        used_year: usedMonth ? targetYear : null,
        used_at: normalizeDate(cell(row, 7)) || null,
        updated_at: new Date().toISOString(),
      }

      await writeOrDry('feeCredits', async () => {
        const { error } = await supabase
          .from('fee_credits')
          .upsert(payload, { onConflict: 'credit_code' })
        if (error) throw error
      })
    }
  }
}

function monthFromZeroBasedSheetValue(value) {
  const text = String(value || '').trim()
  if (/^\d+$/.test(text)) return MONTHS[Math.max(0, Math.min(11, Number(text)))]
  const match = MONTHS.find((month) => month.toLowerCase() === text.toLowerCase() || month.slice(0, 3).toLowerCase() === text.slice(0, 3).toLowerCase())
  return match || null
}

function monthFromOneBasedSheetValue(value) {
  const text = String(value || '').trim()
  if (/^\d+$/.test(text)) return MONTHS[Math.max(0, Math.min(11, Number(text) - 1))]
  return monthFromZeroBasedSheetValue(value)
}

async function migrateDevelopmentFund(supabase, sheets) {
  const rows = await readSheet(sheets, 'DevFund!A:H')
  for (const row of rows) {
    const code = cell(row, 0) || `DEV_${Date.now().toString(36)}`
    const payload = {
      expense_code: code,
      month: monthFromOneBasedSheetValue(cell(row, 1)) || MONTHS[new Date().getMonth()],
      year: Number(cell(row, 2) || targetYear),
      title: cell(row, 3) || cell(row, 4) || 'Development expense',
      description: cell(row, 4),
      scope: normalizeBranch(cell(row, 5), cell(row, 5) || 'Both'),
      amount: numberValue(cell(row, 6)),
      created_by: 'Migration',
      created_at: normalizeDate(cell(row, 7)) || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    await writeOrDry('developmentExpenses', async () => {
      const { error } = await supabase
        .from('development_fund_expenses')
        .upsert(payload, { onConflict: 'expense_code' })
      if (error) throw error
    })
  }
}

async function migrateSpecialDays(supabase, sheets) {
  const rows = await readSheet(sheets, 'SpecialDays!A:D')
  for (const row of rows) {
    const name = cell(row, 0)
    const dateToken = cell(row, 1)
    if (!name || !dateToken) continue
    const payload = {
      name,
      date_token: dateToken,
      category: cell(row, 2),
      notes: cell(row, 3),
      is_active: true,
      updated_at: new Date().toISOString(),
    }

    await writeOrDry('specialDays', async () => {
      const { data: existing, error: lookupError } = await supabase
        .from('special_days')
        .select('id')
        .eq('name', name)
        .eq('date_token', dateToken)
        .maybeSingle()
      if (lookupError) throw lookupError

      const query = existing?.id
        ? supabase.from('special_days').update(payload).eq('id', existing.id)
        : supabase.from('special_days').insert(payload)
      const { error } = await query
      if (error) throw error
    })
  }
}

async function main() {
  if (!sheetId) throw new Error('FEETRACK_GOOGLE_SHEET_ID or GOOGLE_SHEET_ID is required.')
  const sheets = await getSheetsClient()
  const supabase = createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    { auth: { persistSession: false } }
  )

  const studentsBySkfId = await migrateStudents(supabase, sheets)
  await migrateFees(supabase, sheets, studentsBySkfId)
  await migrateCredits(supabase, sheets)
  await migrateDevelopmentFund(supabase, sheets)
  await migrateSpecialDays(supabase, sheets)

  console.log(JSON.stringify(report, null, 2))
  if (dryRun) {
    console.log('Dry run only. Re-run with --apply to write to Supabase.')
  }
}

main().catch((error) => {
  console.error(error)
  console.log(JSON.stringify(report, null, 2))
  process.exitCode = 1
})
