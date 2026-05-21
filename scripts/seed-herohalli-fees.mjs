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

const BRANCH_NAME = 'Herohalli'
const TARGET_YEAR = 2026
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

const STUDENTS = [
  {
    skfId: 'SKF17BL000',
    name: 'SHRIROSHAN P',
    monthlyFee: 1000,
    dateOfBirth: '2007-07-03',
    gender: 'male',
    joinDate: '2017-01-01',
    parentName: 'Prasad M',
    phone: '7795840272',
    email: 'shriroshanp@gmail.com',
    year: TARGET_YEAR,
    statuses: ['Paid', 'Paid', 'Break', 'Break'],
  },
  {
    skfId: 'SKF20HE001',
    name: 'SANJANA S',
    monthlyFee: 400,
    dateOfBirth: '2007-03-16',
    gender: 'female',
    joinDate: '2020-01-01',
    parentName: 'Shivanna. H G',
    phone: '9008069437',
    email: 'shivannahg4@gmail.com',
    year: TARGET_YEAR,
    statuses: ['Break', 'Break', 'Break', 'Break'],
  },
  {
    skfId: 'SKF20HE002',
    name: 'TEJASHREE S',
    monthlyFee: 400,
    dateOfBirth: '2011-12-21',
    gender: 'female',
    joinDate: '2020-01-01',
    parentName: 'Shivanna. H G',
    phone: '8892544741',
    email: 'shivannahg4@gmail.com',
    year: TARGET_YEAR,
    statuses: ['Break', 'Break', 'Break', 'Break'],
  },
  {
    skfId: 'SKF20HE003',
    name: 'AYUSH KASHYAP G',
    monthlyFee: 400,
    dateOfBirth: '2014-08-17',
    gender: 'male',
    joinDate: '2020-01-01',
    parentName: 'Girish',
    phone: '9743804467',
    email: 'srikrishnakalamandir50@gmail.com',
    year: TARGET_YEAR,
    statuses: ['', 'Paid', 'Break', 'Break'],
  },
  {
    skfId: 'SKF21HE001',
    name: 'ISHAAN GOWDA B S',
    monthlyFee: 400,
    dateOfBirth: '2009-03-30',
    gender: 'male',
    joinDate: '2021-01-08',
    parentName: 'Suresh M',
    phone: '8147043216',
    email: 'ishaangowda3027@gmail.com',
    year: TARGET_YEAR,
    statuses: ['Paid', 'Paid', 'Break', 'Break'],
  },
  {
    skfId: 'SKF21HE002',
    name: 'JNANAVIRAM',
    monthlyFee: 0,
    dateOfBirth: '2015-07-15',
    gender: 'female',
    joinDate: '2021-01-01',
    parentName: 'Ramu G',
    phone: '7795280342',
    email: 'ramugowda21s@gmail.com',
    year: TARGET_YEAR,
    statuses: ['Paid', 'Paid', 'Break', 'Break'],
  },
  {
    skfId: 'SKF21HE003',
    name: 'SHASHANK R',
    monthlyFee: 500,
    dateOfBirth: '2003-02-19',
    gender: 'male',
    joinDate: '2021-01-01',
    parentName: '',
    phone: '',
    email: '',
    year: TARGET_YEAR,
    statuses: ['Paid', 'Paid', 'Break', 'Break'],
  },
  {
    skfId: 'SKF21HE004',
    name: 'PRANAV',
    monthlyFee: 400,
    dateOfBirth: '2000-01-01',
    gender: 'male',
    joinDate: '2021-01-01',
    parentName: '',
    phone: '',
    email: '',
    year: TARGET_YEAR,
    statuses: ['Paid', 'Paid', 'Break', 'Break'],
  },
  {
    skfId: 'SKF23HE001',
    name: 'HARSHA KUMAR S P',
    monthlyFee: 400,
    dateOfBirth: '2012-12-02',
    gender: 'male',
    joinDate: '2023-01-01',
    parentName: 'Puttaraju S B',
    phone: '9972734491',
    email: 'puttarajuputtu00225@gmail.com',
    year: TARGET_YEAR,
    statuses: ['Paid', 'Paid', 'Break', 'Break'],
  },
  {
    skfId: 'SKF23HE003',
    name: 'DEEKSHARAM',
    monthlyFee: 0,
    dateOfBirth: '2017-09-07',
    gender: 'female',
    joinDate: '2023-01-01',
    parentName: 'Ramu G',
    phone: '7795280342',
    email: 'ramugowda21s@gmail.com',
    year: TARGET_YEAR,
    statuses: ['Paid', 'Paid', 'Break', 'Break'],
  },
  {
    skfId: 'SKF23HE004',
    name: 'MANOGNA B N',
    monthlyFee: 400,
    dateOfBirth: '2014-06-03',
    gender: 'female',
    joinDate: '2023-01-01',
    parentName: 'Narayana B N',
    phone: '9113549736',
    email: 'prithviraj219bescom@gmail.com',
    year: TARGET_YEAR,
    statuses: ['Paid', 'Paid', 'Break', 'Break'],
  },
  {
    skfId: 'SKF23HE005',
    name: 'PRITHVI RAJ B N',
    monthlyFee: 400,
    dateOfBirth: '2012-09-21',
    gender: 'male',
    joinDate: '2023-01-01',
    parentName: 'Narayana B N',
    phone: '9113549736',
    email: 'prithviraj219bescom@gmail.com',
    year: TARGET_YEAR,
    statuses: ['Paid', 'Paid', 'Break', 'Break'],
  },
  {
    skfId: 'SKF23HE006',
    name: 'KUSHAL K',
    monthlyFee: 400,
    dateOfBirth: '2015-11-28',
    gender: 'male',
    joinDate: '2023-01-01',
    parentName: 'Kumar M S',
    phone: '9008099968',
    email: 'kumarradhakushsl@gmail.com',
    year: TARGET_YEAR,
    statuses: ['Break', 'Break', 'Break', 'Break'],
  },
  {
    skfId: 'SKF24HE001',
    name: 'KUSHIL V',
    monthlyFee: 400,
    dateOfBirth: '2017-01-21',
    gender: 'male',
    joinDate: '2024-01-01',
    parentName: 'Venkatesh S',
    phone: '9620512480',
    email: 'kushivenki7527@gmail.com',
    year: TARGET_YEAR,
    statuses: ['Paid', 'Paid', 'Break', 'Break'],
  },
  {
    skfId: 'SKF25HE001',
    name: 'LIKHITH GOWDA U R',
    monthlyFee: 400,
    dateOfBirth: '2020-02-01',
    gender: 'male',
    joinDate: '2025-01-01',
    parentName: 'Rajesh U N',
    phone: '9880952278',
    email: 'rajeshun1984@gmail.com',
    year: TARGET_YEAR,
    statuses: ['Paid', 'Paid', 'Break', 'Break'],
  },
  {
    skfId: 'SKF26HE001',
    name: 'M MONISHPRASAD',
    monthlyFee: 400,
    dateOfBirth: '2020-07-24',
    gender: 'male',
    joinDate: '2026-01-01',
    parentName: 'Murthy G K',
    phone: '6366669065',
    email: '',
    year: TARGET_YEAR,
    statuses: ['', 'Paid', 'Break', 'Break'],
  },
]

function titleCase(value) {
  return String(value || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function splitName(name) {
  const parts = titleCase(name).split(/\s+/).filter(Boolean)
  return {
    firstName: parts[0] || 'SKF',
    lastName: parts.slice(1).join(' ') || 'Athlete',
  }
}

function normalizeStatus(value) {
  const key = String(value || '').trim().toLowerCase()
  if (key === 'paid') return 'paid'
  if (key === 'break') return 'break'
  if (key === 'discontinued') return 'waived'
  if (key === 'waived') return 'waived'
  return 'due'
}

function receiptId(skfId, feeType, month, year) {
  const monthNumber = String(Math.max(1, MONTHS.indexOf(month) + 1)).padStart(2, '0')
  const typeCode = feeType === 'admission' ? 'ADM' : feeType === 'dress' ? 'DRS' : 'MON'
  return `SKF-FEE-${year}-${monthNumber}-${typeCode}-${skfId}`
}

function paidDate(year, monthIndex) {
  return new Date(Date.UTC(year, monthIndex, 10, 5, 30, 0)).toISOString()
}

function athletePayload(student) {
  const { firstName, lastName } = splitName(student.name)
  return {
    id: `athlete_herohalli_${student.skfId.toLowerCase()}`,
    skf_id: student.skfId,
    first_name: firstName,
    last_name: lastName,
    date_of_birth: student.dateOfBirth,
    gender: student.gender,
    branch_name: BRANCH_NAME,
    current_belt: 'white',
    join_date: student.joinDate,
    status: 'active',
    parent_name: student.parentName || null,
    phone: student.phone || null,
    email: student.email || null,
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
  const date = isPaid ? paidDate(student.year, monthIndex) : null
  return {
    skf_id: student.skfId,
    fee_type: 'monthly',
    month,
    year: student.year,
    amount: student.monthlyFee,
    status,
    paid_date: date,
    receipt_id: isPaid ? receiptId(student.skfId, 'monthly', month, student.year) : null,
    payment_method: isPaid ? 'Seeded fee table' : null,
    verified_by: isPaid ? 'Seed Script' : null,
    verified_at: date,
    rejected_reason: null,
    notes: null,
    metadata: {
      seededFrom: 'scripts/seed-herohalli-fees.mjs',
      source: 'manual Herohalli 2026 table',
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
    student_name: titleCase(student.name),
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

async function upsertAthlete(student) {
  const payload = athletePayload(student)
  const { data: existing, error: lookupError } = await supabase
    .from('athletes')
    .select('id')
    .eq('skf_id', student.skfId)
    .maybeSingle()

  if (lookupError) throw lookupError

  if (!existing) {
    return upsertOrThrow('athletes', payload, { onConflict: 'skf_id' })
  }

  const updatePayload = { ...payload }
  delete updatePayload.id
  const { data, error } = await supabase
    .from('athletes')
    .update(updatePayload)
    .eq('skf_id', student.skfId)
    .select('*')
    .single()
  if (error) throw error
  return data
}

async function main() {
  const summary = {
    athletes: 0,
    billingProfiles: 0,
    feeRecords: 0,
    receipts: 0,
    paid: 0,
    break: 0,
    due: 0,
    waived: 0,
  }

  for (const student of STUDENTS) {
    await upsertAthlete(student)
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

  const { data, error } = await supabase
    .from('fee_records')
    .select('skf_id, month, year, amount, status')
    .in('skf_id', STUDENTS.map((student) => student.skfId))
    .eq('fee_type', 'monthly')
    .eq('year', TARGET_YEAR)

  if (error) throw error

  const totalPaid = (data || [])
    .filter((row) => row.status === 'paid')
    .reduce((sum, row) => sum + Number(row.amount || 0), 0)
  const totalDue = (data || [])
    .filter((row) => row.status === 'due' || row.status === 'overdue')
    .reduce((sum, row) => sum + Number(row.amount || 0), 0)

  console.log('Herohalli fee seed complete.')
  console.log(JSON.stringify({ ...summary, totalPaid, totalDue }, null, 2))
}

main().catch((error) => {
  console.error('Herohalli fee seed failed.')
  console.error(error)
  process.exit(1)
})
