#!/usr/bin/env node

import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

function readEnvFile(path) {
  if (!fs.existsSync(path)) return {}
  return Object.fromEntries(
    fs
      .readFileSync(path, 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter((line) => !line.startsWith('#'))
      .filter((line) => line.includes('='))
      .map((line) => {
        const index = line.indexOf('=')
        const key = line.slice(0, index)
        const value = line.slice(index + 1).replace(/^"|"$/g, '').replace(/\\n/g, '\n')
        return [key, value]
      })
  )
}

const env = { ...readEnvFile('.env'), ...readEnvFile('.env.local'), ...process.env }
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.')
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const BRANCH_NAME = 'M P Sports Club'
const TARGET_YEAR = 2026
const MONTHS = ['January', 'February', 'March', 'April', 'May']

const STUDENTS = [
  {
    skfId: 'SKF25MP001',
    name: 'Neshu Ram',
    monthlyFee: 2000,
    dateOfBirth: '2018-11-09',
    gender: 'female',
    joinDate: '2025-10-17',
    parentName: 'Sharathbabu',
    phone: '9591779191',
    email: 'sharathbabuhn@gmail.com',
    statuses: ['Paid', 'Paid', 'Paid', 'Break', ''],
  },
  {
    skfId: 'SKF25MP002',
    name: 'Ganvith Ishan',
    monthlyFee: 0,
    dateOfBirth: '2019-03-04',
    gender: 'male',
    joinDate: '2025-10-27',
    parentName: 'Balaji',
    phone: '8123404357',
    email: 'balaji.mp111@gmail.com',
    statuses: ['Paid', 'Paid', 'Paid', 'Break', ''],
  },
  {
    skfId: 'SKF25MP003',
    name: 'Duvan Gowda',
    monthlyFee: 2500,
    dateOfBirth: '2019-12-06',
    gender: 'male',
    joinDate: '2025-10-28',
    parentName: 'Darshan B B',
    phone: '9886633051',
    email: 'imdrshngwda@gmail.com',
    statuses: ['Paid', 'Paid', 'Paid', 'Break', 'Paid'],
  },
  {
    skfId: 'SKF25MP004',
    name: 'Viharika S Gowda',
    monthlyFee: 2500,
    dateOfBirth: '2017-05-26',
    gender: 'female',
    joinDate: '2025-10-28',
    parentName: 'Siddaraju S',
    phone: '7019063688',
    email: 'Siddu.borntorule@gmail.com',
    statuses: ['Paid', 'Paid', 'Break', 'Break', ''],
  },
  {
    skfId: 'SKF25MP005',
    name: 'Samisha K Gowda',
    monthlyFee: 2000,
    dateOfBirth: '2020-05-16',
    gender: 'female',
    joinDate: '2025-10-31',
    parentName: 'Kiran Kumar J',
    phone: '9611766327',
    email: 'jayaramyalinil@gmail.com',
    statuses: ['Paid', 'Paid', '', 'Break', ''],
  },
  {
    skfId: 'SKF25MP006',
    name: 'Tharush H Gowda',
    monthlyFee: 2000,
    dateOfBirth: '2020-10-08',
    gender: 'male',
    joinDate: '2025-10-27',
    parentName: 'Samatha',
    phone: '7619373844',
    email: 'samatharsha080@gmail.com',
    statuses: ['Paid', 'Paid', 'Paid', 'Break', ''],
  },
  {
    skfId: 'SKF25MP007',
    name: 'Purvank P',
    monthlyFee: 2000,
    dateOfBirth: '2021-03-29',
    gender: 'male',
    joinDate: '2025-11-09',
    parentName: 'Keerthana',
    phone: '8618404399',
    email: 'keerthanarasna@gmail.com',
    statuses: ['Paid', 'Paid', 'Paid', 'Break', ''],
  },
]

const CREDITS = [
  {
    creditCode: 'REF-M-001',
    skfId: 'SKF25MP006',
    amount: 500,
    reason: 'Purvank P (SKF25MP007)',
    earnedAt: '2026-01-17',
    usedMonthIndex: 0,
    usedAt: '2026-01-17T17:35:52.292Z',
  },
]

function splitName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] || 'SKF',
    lastName: parts.slice(1).join(' ') || 'Athlete',
  }
}

function normalizeStatus(value) {
  const key = String(value || '').trim().toLowerCase()
  if (key === 'paid') return 'paid'
  if (key === 'break') return 'break'
  return 'due'
}

function monthFromIndex(index) {
  const parsed = Number(index)
  return MONTHS[Math.max(0, Math.min(MONTHS.length - 1, Number.isFinite(parsed) ? parsed : 0))]
}

function receiptId(skfId, month, year) {
  const monthNumber = String(Math.max(1, MONTHS.indexOf(month) + 1)).padStart(2, '0')
  return `SKF-FEE-${year}-${monthNumber}-MON-${skfId}`
}

function paidDate(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex, 10, 5, 30, 0)).toISOString()
}

function athletePayload(student) {
  const { firstName, lastName } = splitName(student.name)
  return {
    id: student.skfId,
    skf_id: student.skfId,
    first_name: firstName,
    last_name: lastName,
    date_of_birth: student.dateOfBirth,
    gender: student.gender,
    branch_name: BRANCH_NAME,
    current_belt: 'white',
    join_date: student.joinDate,
    status: 'active',
    parent_name: student.parentName,
    phone: student.phone,
    email: student.email,
    monthly_fee: student.monthlyFee,
    updated_at: new Date().toISOString(),
  }
}

function billingProfilePayload(student) {
  return {
    skf_id: student.skfId,
    billing_status: 'active',
    monthly_fee: student.monthlyFee,
    admission_fee: 0,
    dress_fee: 0,
    dress_cost: 0,
    billing_start_date: student.joinDate,
    billing_end_date: null,
    branch_snapshot: BRANCH_NAME,
    updated_at: new Date().toISOString(),
  }
}

function feePayload(student, month, monthIndex) {
  const status = normalizeStatus(student.statuses[monthIndex])
  const isPaid = status === 'paid'
  const date = isPaid ? paidDate(TARGET_YEAR, monthIndex) : null
  return {
    skf_id: student.skfId,
    fee_type: 'monthly',
    month,
    year: TARGET_YEAR,
    amount: student.monthlyFee,
    status,
    paid_date: date,
    receipt_id: isPaid ? receiptId(student.skfId, month, TARGET_YEAR) : null,
    payment_method: isPaid ? 'Seeded fee table' : null,
    verified_by: isPaid ? 'Seed Script' : null,
    verified_at: date,
    rejected_reason: null,
    notes: null,
    metadata: {
      seededFrom: 'scripts/seed_mp_sports.mjs',
      source: 'manual MP Sports Jan-May 2026 table',
    },
    updated_at: new Date().toISOString(),
  }
}

function creditPayload(credit) {
  const usedMonth = monthFromIndex(credit.usedMonthIndex)
  return {
    credit_code: credit.creditCode,
    skf_id: credit.skfId,
    branch: BRANCH_NAME,
    amount: credit.amount,
    reason: credit.reason,
    description: credit.reason,
    status: 'used',
    earned_at: credit.earnedAt,
    used_month: usedMonth,
    used_year: TARGET_YEAR,
    used_at: credit.usedAt,
    updated_at: new Date().toISOString(),
  }
}

function creditAdjustmentPayload(credit, creditRow) {
  const usedMonth = monthFromIndex(credit.usedMonthIndex)
  return {
    skf_id: credit.skfId,
    fee_type: 'credit_adjustment',
    month: usedMonth,
    year: TARGET_YEAR,
    amount: credit.amount,
    status: 'paid',
    paid_date: credit.usedAt,
    receipt_id: null,
    payment_method: 'credit adjustment',
    verified_by: 'Seed Script',
    verified_at: credit.usedAt,
    rejected_reason: null,
    notes: `Referral credit ${credit.creditCode} applied to monthly fee.`,
    metadata: {
      appliedToFeeType: 'monthly',
      lastCreditId: creditRow?.id || null,
      creditCode: credit.creditCode,
      seededFrom: 'scripts/seed_mp_sports.mjs',
    },
    updated_at: new Date().toISOString(),
  }
}

function receiptPayload(feeRow, student) {
  const issuedAt = feeRow.paid_date || new Date().toISOString()
  const payload = {
    receipt_id: feeRow.receipt_id,
    fee_record_id: feeRow.id,
    skf_id: feeRow.skf_id,
    student_name: student.name,
    branch: BRANCH_NAME,
    fee_type: 'monthly',
    month: feeRow.month,
    year: feeRow.year,
    amount: feeRow.amount,
    paid_date: issuedAt,
    payment_method: feeRow.payment_method || 'Seeded fee table',
    verified_by: feeRow.verified_by || 'Seed Script',
    verified_at: feeRow.verified_at || issuedAt,
    dojo_address: `SKF Karate, ${BRANCH_NAME}`,
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

  return payload
}

async function upsertOrThrow(table, payload, options = {}) {
  const { data, error } = await supabase.from(table).upsert(payload, options).select('*')
  if (error) throw error
  return Array.isArray(data) ? data[0] : data
}

let receiptsAvailable = true

function isMissingTableError(error, table) {
  const message = String(error?.message || '').toLowerCase()
  return String(error?.code || '') === 'PGRST205' && message.includes(table)
}

async function upsertReceipt(payload) {
  if (!receiptsAvailable) return false

  const { error } = await supabase
    .from('fee_receipts')
    .upsert(payload, { onConflict: 'receipt_id' })

  if (!error) return true

  if (isMissingTableError(error, 'fee_receipts')) {
    receiptsAvailable = false
    console.warn('fee_receipts table is missing; seeded fee_records with receipt IDs but skipped receipt rows.')
    return false
  }

  throw error
}

async function main() {
  const summary = {
    athletes: 0,
    billingProfiles: 0,
    feeRecords: 0,
    receipts: 0,
    credits: 0,
    creditAdjustments: 0,
    paid: 0,
    break: 0,
    due: 0,
  }

  for (const student of STUDENTS) {
    await upsertOrThrow('athletes', athletePayload(student), { onConflict: 'skf_id' })
    summary.athletes += 1

    await upsertOrThrow('student_billing_profiles', billingProfilePayload(student), {
      onConflict: 'skf_id',
    })
    summary.billingProfiles += 1

    for (let index = 0; index < MONTHS.length; index += 1) {
      const month = MONTHS[index]
      const feeRow = await upsertOrThrow('fee_records', feePayload(student, month, index), {
        onConflict: 'skf_id,fee_type,month,year',
      })
      summary.feeRecords += 1
      summary[feeRow.status] += 1

      if (feeRow.status === 'paid') {
        if (await upsertReceipt(receiptPayload(feeRow, student))) {
          summary.receipts += 1
        }
      }
    }
  }

  for (const credit of CREDITS) {
    const creditRow = await upsertOrThrow('fee_credits', creditPayload(credit), {
      onConflict: 'credit_code',
    })
    const adjustmentRow = await upsertOrThrow('fee_records', creditAdjustmentPayload(credit, creditRow), {
      onConflict: 'skf_id,fee_type,month,year',
    })
    const { error: creditUpdateError } = await supabase
      .from('fee_credits')
      .update({
        used_fee_record_id: adjustmentRow.id,
        used_month: adjustmentRow.month,
        used_year: adjustmentRow.year,
        used_at: credit.usedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', creditRow.id)
    if (creditUpdateError) throw creditUpdateError
    summary.credits += 1
    summary.creditAdjustments += 1
  }

  const { data, error } = await supabase
    .from('fee_records')
    .select('skf_id, month, year, amount, status')
    .in('skf_id', STUDENTS.map((student) => student.skfId))
    .eq('fee_type', 'monthly')
    .eq('year', TARGET_YEAR)

  if (error) throw error

  const seededRows = (data || []).filter((row) => MONTHS.includes(row.month))
  const totalPaid = seededRows
    .filter((row) => row.status === 'paid')
    .reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const totalDue = seededRows
    .filter((row) => row.status === 'due' || row.status === 'overdue')
    .reduce((sum, row) => sum + Number(row.amount || 0), 0)

  console.log('MP Sports fee seed complete.')
  console.log(JSON.stringify({ ...summary, totalPaid, totalDue }, null, 2))
}

main().catch((error) => {
  console.error('MP Sports fee seed failed.')
  console.error(error)
  process.exit(1)
})
