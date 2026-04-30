import type { FeeRow } from '@/types'
import { ApiError } from '@/lib/server/api'
import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import {
  ensureFeeRowsForStudent as ensureSheetFeeRowsForStudent,
  findFeeByReceiptIdLive as findSheetFeeByReceiptIdLive,
  getAllFeesLive as getAllSheetFeesLive,
  getFeesBySkfIdLive as getSheetFeesBySkfIdLive,
  markFeeAsPaid as markSheetFeeAsPaid,
  markFeeStatus as markSheetFeeStatus,
} from '@/lib/server/sheets'

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

type FeeRecordRow = {
  skf_id?: string | null
  month?: string | null
  year?: number | string | null
  amount?: number | string | null
  status?: string | null
  paid_date?: string | null
  receipt_id?: string | null
  payment_method?: string | null
}

function requireFeeDatabase() {
  if (!isSupabaseReady()) {
    if (process.env.NODE_ENV === 'production') {
      throw new ApiError(503, 'Supabase fee ledger is not configured.')
    }
    return false
  }

  return true
}

function normalizeSkfId(skfId: string) {
  return String(skfId || '').trim().toUpperCase()
}

function mapFeeRecord(row: FeeRecordRow): FeeRow {
  return {
    skfId: normalizeSkfId(row.skf_id || ''),
    month: String(row.month || '').trim(),
    year: Number(row.year || new Date().getFullYear()),
    amount: Number(row.amount || 0),
    status: (row.status || 'due') as FeeRow['status'],
    paidDate: row.paid_date || '',
    receiptId: row.receipt_id || '',
    paymentMethod: row.payment_method || '',
  }
}

function startMonthForYear(enrolledDate: string | undefined, year: number) {
  const enrolledAt = enrolledDate ? new Date(enrolledDate) : null
  return enrolledAt && Number.isFinite(enrolledAt.getTime()) && enrolledAt.getFullYear() === year
    ? enrolledAt.getMonth()
    : 0
}

export async function getFeesBySkfIdLive(skfId: string, year?: number): Promise<FeeRow[]> {
  const normalizedSkfId = normalizeSkfId(skfId)
  if (!requireFeeDatabase()) {
    return getSheetFeesBySkfIdLive(normalizedSkfId, year)
  }

  let query = supabaseAdmin
    .from('fee_records')
    .select('skf_id, month, year, amount, status, paid_date, receipt_id, payment_method')
    .eq('skf_id', normalizedSkfId)

  if (year) {
    query = query.eq('year', year)
  }

  const { data, error } = await query.order('year', { ascending: false })
  if (error) throw error
  return (data || []).map(mapFeeRecord)
}

export async function getAllFeesLive(year?: number): Promise<FeeRow[]> {
  if (!requireFeeDatabase()) {
    return getAllSheetFeesLive(year)
  }

  let query = supabaseAdmin
    .from('fee_records')
    .select('skf_id, month, year, amount, status, paid_date, receipt_id, payment_method')

  if (year) {
    query = query.eq('year', year)
  }

  const { data, error } = await query.order('year', { ascending: false })
  if (error) throw error
  return (data || []).map(mapFeeRecord)
}

export async function findFeeByReceiptIdLive(receiptId: string): Promise<FeeRow | null> {
  const normalizedReceiptId = String(receiptId || '').trim()
  if (!normalizedReceiptId) return null

  if (!requireFeeDatabase()) {
    return findSheetFeeByReceiptIdLive(normalizedReceiptId)
  }

  const { data, error } = await supabaseAdmin
    .from('fee_records')
    .select('skf_id, month, year, amount, status, paid_date, receipt_id, payment_method')
    .eq('receipt_id', normalizedReceiptId)
    .maybeSingle()

  if (error) throw error
  return data ? mapFeeRecord(data) : null
}

export async function ensureFeeRowsForStudent(
  skfId: string,
  options: {
    monthlyFee: number
    enrolledDate?: string
    year: number
    overwriteAmount?: boolean
  }
): Promise<{ created: number; updated: number }> {
  const normalizedSkfId = normalizeSkfId(skfId)
  const year = Number(options.year || new Date().getFullYear())
  if (!normalizedSkfId || !year) return { created: 0, updated: 0 }

  if (!requireFeeDatabase()) {
    return ensureSheetFeeRowsForStudent(normalizedSkfId, options)
  }

  const startMonth = startMonthForYear(options.enrolledDate, year)
  const { data: existingRows, error: existingError } = await supabaseAdmin
    .from('fee_records')
    .select('month, amount')
    .eq('skf_id', normalizedSkfId)
    .eq('year', year)

  if (existingError) throw existingError

  const existingByMonth = new Map(
    (existingRows || []).map((row) => [String(row.month || '').trim(), Number(row.amount || 0)])
  )
  const now = new Date().toISOString()
  const rowsToInsert = []
  const rowsToUpdate = []

  for (let index = startMonth; index < MONTHS.length; index += 1) {
    const month = MONTHS[index]
    const existingAmount = existingByMonth.get(month)

    if (existingAmount === undefined) {
      rowsToInsert.push({
        skf_id: normalizedSkfId,
        month,
        year,
        amount: Number(options.monthlyFee || 0),
        status: 'due',
        updated_at: now,
      })
      continue
    }

    if (options.overwriteAmount && existingAmount !== Number(options.monthlyFee || 0)) {
      rowsToUpdate.push(month)
    }
  }

  if (rowsToInsert.length) {
    const { error } = await supabaseAdmin.from('fee_records').insert(rowsToInsert)
    if (error) throw error
  }

  for (const month of rowsToUpdate) {
    const { error } = await supabaseAdmin
      .from('fee_records')
      .update({ amount: Number(options.monthlyFee || 0), updated_at: now })
      .eq('skf_id', normalizedSkfId)
      .eq('month', month)
      .eq('year', year)

    if (error) throw error
  }

  return { created: rowsToInsert.length, updated: rowsToUpdate.length }
}

export async function markFeeAsPaid(
  skfId: string,
  month: string,
  receiptId: string,
  paymentId: string,
  year?: number
): Promise<boolean> {
  const normalizedSkfId = normalizeSkfId(skfId)
  const targetYear = Number(year || new Date().getFullYear())

  if (!requireFeeDatabase()) {
    return markSheetFeeAsPaid(normalizedSkfId, month, receiptId, paymentId, targetYear)
  }

  const { error } = await supabaseAdmin
    .from('fee_records')
    .update({
      status: 'paid',
      paid_date: new Date().toISOString(),
      receipt_id: receiptId,
      payment_method: paymentId,
      updated_at: new Date().toISOString(),
    })
    .eq('skf_id', normalizedSkfId)
    .eq('month', month)
    .eq('year', targetYear)

  if (error) throw error
  return true
}

export async function markFeeStatus(
  skfId: string,
  month: string,
  year: number,
  updates: Partial<Pick<FeeRow, 'status' | 'paidDate' | 'receiptId' | 'paymentMethod'>>
): Promise<boolean> {
  const normalizedSkfId = normalizeSkfId(skfId)
  if (!requireFeeDatabase()) {
    return markSheetFeeStatus(normalizedSkfId, month, year, updates)
  }

  const { error } = await supabaseAdmin
    .from('fee_records')
    .update({
      status: updates.status || 'due',
      paid_date: updates.paidDate || null,
      receipt_id: updates.receiptId || null,
      payment_method: updates.paymentMethod || null,
      updated_at: new Date().toISOString(),
    })
    .eq('skf_id', normalizedSkfId)
    .eq('month', month)
    .eq('year', year)

  if (error) throw error
  return true
}
