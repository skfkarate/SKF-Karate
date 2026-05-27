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
  id?: string | null
  skf_id?: string | null
  fee_type?: string | null
  month?: string | null
  year?: number | string | null
  amount?: number | string | null
  status?: string | null
  paid_date?: string | null
  receipt_id?: string | null
  payment_method?: string | null
  verified_by?: string | null
  verified_at?: string | null
  rejected_reason?: string | null
  notes?: string | null
  metadata?: Record<string, unknown> | null
  source_key?: string | null
  source_type?: string | null
  source_id?: string | null
  source_label?: string | null
  due_date?: string | null
  branch_snapshot?: string | null
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

function throwFeeRepositoryError(error: unknown): never {
  const details = error && typeof error === 'object' ? error as Record<string, unknown> : {}
  const code = String(details.code || '')
  const message = String(details.message || '')
  const hint = String(details.hint || '')
  const combined = `${code} ${message} ${hint}`.toLowerCase()

  if (
    ['42p01', '42703', 'pgrst200', 'pgrst202', 'pgrst204', 'pgrst205'].includes(code.toLowerCase()) ||
    combined.includes('fee_records')
  ) {
    throw new ApiError(503, 'Fee database schema is not ready. Run database/migrations/015_fee_operations_console.sql in Supabase, then reload the fee page.', {
      details: { code, message, hint },
    })
  }

  throw new ApiError(503, 'Fee database request failed.', {
    details: { code, message, hint },
  })
}

function normalizeSkfId(skfId: string) {
  return String(skfId || '').trim().toUpperCase()
}

function mapFeeRecord(row: FeeRecordRow): FeeRow {
  return {
    id: row.id || undefined,
    skfId: normalizeSkfId(row.skf_id || ''),
    feeType: (row.fee_type || 'monthly') as FeeRow['feeType'],
    month: String(row.month || '').trim(),
    year: Number(row.year || new Date().getFullYear()),
    amount: Number(row.amount || 0),
    status: (row.status || 'due') as FeeRow['status'],
    paidDate: row.paid_date || '',
    receiptId: row.receipt_id || '',
    paymentMethod: row.payment_method || '',
    verifiedBy: row.verified_by || '',
    verifiedAt: row.verified_at || '',
    rejectedReason: row.rejected_reason || '',
    notes: row.notes || '',
    metadata: row.metadata || {},
    sourceKey: row.source_key || '',
    sourceType: row.source_type || '',
    sourceId: row.source_id || '',
    sourceLabel: row.source_label || '',
    dueDate: row.due_date || '',
    branchSnapshot: row.branch_snapshot || '',
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
    .select('id, skf_id, fee_type, month, year, amount, status, paid_date, receipt_id, payment_method, verified_by, verified_at, rejected_reason, notes, metadata, source_key, source_type, source_id, source_label, due_date, branch_snapshot')
    .eq('skf_id', normalizedSkfId)

  if (year) {
    query = query.eq('year', year)
  }

  const { data, error } = await query.order('year', { ascending: false })
  if (error) throwFeeRepositoryError(error)
  return (data || []).map(mapFeeRecord)
}

export async function getAllFeesLive(year?: number): Promise<FeeRow[]> {
  if (!requireFeeDatabase()) {
    return getAllSheetFeesLive(year)
  }

  let query = supabaseAdmin
    .from('fee_records')
    .select('id, skf_id, fee_type, month, year, amount, status, paid_date, receipt_id, payment_method, verified_by, verified_at, rejected_reason, notes, metadata, source_key, source_type, source_id, source_label, due_date, branch_snapshot')

  if (year) {
    query = query.eq('year', year)
  }

  const { data, error } = await query.order('year', { ascending: false })
  if (error) throwFeeRepositoryError(error)
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
    .select('id, skf_id, fee_type, month, year, amount, status, paid_date, receipt_id, payment_method, verified_by, verified_at, rejected_reason, notes, metadata, source_key, source_type, source_id, source_label, due_date, branch_snapshot')
    .eq('receipt_id', normalizedReceiptId)
    .maybeSingle()

  if (error) throwFeeRepositoryError(error)
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
    .eq('fee_type', 'monthly')
    .eq('year', year)

  if (existingError) throwFeeRepositoryError(existingError)

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
        fee_type: 'monthly',
        month,
        year,
        amount: Number(options.monthlyFee || 0),
        status: 'due',
        source_key: '',
        updated_at: now,
      })
      continue
    }

    if (options.overwriteAmount && existingAmount !== Number(options.monthlyFee || 0)) {
      rowsToUpdate.push(month)
    }
  }

  if (rowsToInsert.length) {
    const { error } = await supabaseAdmin
      .from('fee_records')
      .upsert(rowsToInsert, {
        onConflict: 'skf_id,fee_type,month,year,source_key',
        ignoreDuplicates: true,
      })
    if (error) throwFeeRepositoryError(error)
  }

  for (const month of rowsToUpdate) {
    const { error } = await supabaseAdmin
      .from('fee_records')
      .update({ amount: Number(options.monthlyFee || 0), updated_at: now })
      .eq('skf_id', normalizedSkfId)
      .eq('fee_type', 'monthly')
      .eq('month', month)
      .eq('year', year)
      .in('status', ['due', 'overdue', 'rejected'])

    if (error) throwFeeRepositoryError(error)
  }

  return { created: rowsToInsert.length, updated: rowsToUpdate.length }
}

export async function markFeeAsPaid(
  skfId: string,
  month: string,
  receiptId: string,
  paymentId: string,
  year?: number,
  feeType = 'monthly',
  reviewer?: string
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
      verified_by: reviewer || null,
      verified_at: new Date().toISOString(),
      rejected_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq('skf_id', normalizedSkfId)
    .eq('fee_type', feeType)
    .eq('month', month)
    .eq('year', targetYear)

  if (error) throwFeeRepositoryError(error)
  return true
}

export async function markFeeStatus(
  skfId: string,
  month: string,
  year: number,
  updates: Partial<Pick<FeeRow, 'status' | 'paidDate' | 'receiptId' | 'paymentMethod' | 'rejectedReason' | 'notes'>>,
  feeType = 'monthly'
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
      rejected_reason: updates.rejectedReason || null,
      notes: updates.notes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('skf_id', normalizedSkfId)
    .eq('fee_type', feeType)
    .eq('month', month)
    .eq('year', year)

  if (error) throwFeeRepositoryError(error)
  return true
}
