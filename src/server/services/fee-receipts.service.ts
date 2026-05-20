import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import { normaliseSkfId } from '@/lib/utils/registration'
import { ExternalServiceError } from '@/src/server/lib/errors'

export const RECEIPT_THEMES = [
  {
    id: 'skf_classic',
    name: 'SKF Classic',
    description: 'Dark SKF header with gold accents for official fee receipts.',
  },
  {
    id: 'skf_minimal',
    name: 'SKF Minimal',
    description: 'Clean black-and-white receipt with restrained SKF branding.',
  },
  {
    id: 'skf_iconic',
    name: 'SKF Imperial Masterpiece',
    description: 'An elite, high-end martial arts certificate design with gold/crimson borders, dynamic watermarks, and bold paid seals.',
  },
] as const

export type ReceiptThemeId = (typeof RECEIPT_THEMES)[number]['id']

export type FeeReceiptDocumentData = {
  receiptId: string
  skfId: string
  athleteName: string
  branch: string
  feeType: string
  month: string
  year: number
  amount: number
  paidDate: string
  paymentMethod: string
  dojoAddress: string
  verifiedBy: string
  verifiedAt: string
  issuedAt: string
  themeId: ReceiptThemeId
  source: 'snapshot' | 'legacy'
}

type FeeRecordLike = {
  id: string
  skf_id: string
  fee_type: string
  month: string
  year: number
  amount: number
  status: string
  paid_date: string | null
  receipt_id: string | null
  payment_method: string | null
  verified_by: string | null
  verified_at: string | null
}

type ReceiptRow = {
  receipt_id: string
  fee_record_id: string | null
  skf_id: string
  student_name: string
  branch: string
  fee_type: string
  month: string
  year: number
  amount: number
  paid_date: string
  payment_method: string | null
  verified_by: string | null
  verified_at: string | null
  dojo_address: string | null
  theme_id: string
  issued_at: string
  voided_at: string | null
}

function requireFeeDatabase() {
  if (!isSupabaseReady()) {
    throw new ExternalServiceError('Fee receipt storage requires Supabase to be configured.')
  }
}

function throwReceiptError(error: unknown): never {
  const details = error && typeof error === 'object' ? error as Record<string, unknown> : {}
  const code = String(details.code || '')
  const message = String(details.message || '')
  const hint = String(details.hint || '')
  const combined = `${code} ${message} ${hint}`.toLowerCase()

  if (
    ['42p01', '42703', 'pgrst200', 'pgrst202', 'pgrst204', 'pgrst205'].includes(code.toLowerCase()) ||
    combined.includes('fee_receipts') ||
    combined.includes('fee_receipt_settings')
  ) {
    throw new ExternalServiceError(
      'Fee receipt schema is not ready. Run database/migrations/016_fee_receipts_and_atomic_operations.sql in Supabase, then reload the fee console.',
      { code, message, hint }
    )
  }

  throw new ExternalServiceError('Fee receipt request failed.', { code, message, hint })
}

function normalizeThemeId(input?: string | null): ReceiptThemeId {
  return RECEIPT_THEMES.some((theme) => theme.id === input)
    ? input as ReceiptThemeId
    : 'skf_classic'
}

function formatFeeType(input?: string | null) {
  return String(input || 'monthly')
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ')
}

export class FeeReceiptsService {
  static themes = RECEIPT_THEMES

  static async getSettings() {
    requireFeeDatabase()
    const { data, error } = await supabaseAdmin
      .from('fee_receipt_settings')
      .select('active_theme_id, updated_by, updated_at')
      .eq('id', true)
      .maybeSingle()
    if (error) throwReceiptError(error)

    return {
      themes: RECEIPT_THEMES,
      activeThemeId: normalizeThemeId(data?.active_theme_id),
      updatedBy: data?.updated_by || null,
      updatedAt: data?.updated_at || null,
    }
  }

  static async updateSettings(input: { activeThemeId: string; updatedBy?: string | null }) {
    requireFeeDatabase()
    const activeThemeId = normalizeThemeId(input.activeThemeId)
    const { data, error } = await supabaseAdmin
      .from('fee_receipt_settings')
      .upsert(
        {
          id: true,
          active_theme_id: activeThemeId,
          updated_by: input.updatedBy || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )
      .select('active_theme_id, updated_by, updated_at')
      .single()
    if (error) throwReceiptError(error)

    return {
      themes: RECEIPT_THEMES,
      activeThemeId: normalizeThemeId(data.active_theme_id),
      updatedBy: data.updated_by || null,
      updatedAt: data.updated_at || null,
    }
  }

  static async getActiveThemeId() {
    const settings = await this.getSettings()
    return settings.activeThemeId
  }

  static async ensureReceipt(input: {
    feeRecord: FeeRecordLike
    receiptId: string
    studentName: string
    branch: string
    dojoAddress: string
    issuedAt?: string
  }) {
    requireFeeDatabase()
    const row = input.feeRecord
    if (row.status !== 'paid' || row.fee_type === 'credit_adjustment') return null

    const receiptId = String(input.receiptId || row.receipt_id || '').trim()
    if (!receiptId) return null

    const existing = await this.getReceiptById(receiptId)
    if (existing) return existing

    const themeId = await this.getActiveThemeId()
    const issuedAt = input.issuedAt || row.verified_at || row.paid_date || new Date().toISOString()
    const paidDate = row.paid_date || issuedAt
    const verifiedAt = row.verified_at || paidDate
    const snapshot = {
      receiptId,
      feeRecordId: row.id,
      skfId: normaliseSkfId(row.skf_id),
      studentName: input.studentName,
      branch: input.branch,
      feeType: formatFeeType(row.fee_type),
      month: row.month,
      year: row.year,
      amount: row.amount,
      paidDate,
      paymentMethod: row.payment_method || 'Manual Entry',
      verifiedBy: row.verified_by || '',
      verifiedAt,
      dojoAddress: input.dojoAddress,
      themeId,
      issuedAt,
    }

    const { data, error } = await supabaseAdmin
      .from('fee_receipts')
      .insert({
        receipt_id: receiptId,
        fee_record_id: row.id,
        skf_id: normaliseSkfId(row.skf_id),
        student_name: input.studentName,
        branch: input.branch,
        fee_type: formatFeeType(row.fee_type),
        month: row.month,
        year: row.year,
        amount: row.amount,
        paid_date: paidDate,
        payment_method: row.payment_method || 'Manual Entry',
        verified_by: row.verified_by || '',
        verified_at: verifiedAt,
        dojo_address: input.dojoAddress,
        theme_id: themeId,
        snapshot,
        issued_at: issuedAt,
      })
      .select('*')
      .single()

    if (error) {
      const details = error as unknown as Record<string, unknown>
      if (String(details.code || '').toLowerCase() === '23505') {
        return this.getReceiptById(receiptId)
      }
      throwReceiptError(error)
    }

    return this.mapReceiptRow(data as ReceiptRow)
  }

  static async voidReceipt(receiptId: string, reason: string) {
    requireFeeDatabase()
    const normalizedReceiptId = String(receiptId || '').trim()
    if (!normalizedReceiptId) return null

    const { data, error } = await supabaseAdmin
      .from('fee_receipts')
      .update({
        voided_at: new Date().toISOString(),
        void_reason: reason,
      })
      .eq('receipt_id', normalizedReceiptId)
      .is('voided_at', null)
      .select('*')
      .maybeSingle()
    if (error) throwReceiptError(error)
    return data ? this.mapReceiptRow(data as ReceiptRow) : null
  }

  static async getReceiptById(receiptId: string) {
    requireFeeDatabase()
    const normalizedReceiptId = String(receiptId || '').trim()
    if (!normalizedReceiptId) return null

    const { data, error } = await supabaseAdmin
      .from('fee_receipts')
      .select('*')
      .eq('receipt_id', normalizedReceiptId)
      .maybeSingle()
    if (error) throwReceiptError(error)
    return data ? this.mapReceiptRow(data as ReceiptRow) : null
  }

  static async getReceiptForStudent(skfId: string, receiptId: string) {
    const receipt = await this.getReceiptById(receiptId)
    if (!receipt) return null
    if (normaliseSkfId(receipt.skfId) !== normaliseSkfId(skfId)) return null
    if (receipt.voidedAt) return null
    return receipt
  }

  private static mapReceiptRow(row: ReceiptRow): FeeReceiptDocumentData & { voidedAt: string | null } {
    return {
      receiptId: row.receipt_id,
      skfId: normaliseSkfId(row.skf_id),
      athleteName: row.student_name,
      branch: row.branch,
      feeType: row.fee_type,
      month: row.month,
      year: Number(row.year),
      amount: Number(row.amount || 0),
      paidDate: row.paid_date,
      paymentMethod: row.payment_method || 'Manual Entry',
      dojoAddress: row.dojo_address || `SKF Karate, ${row.branch}`,
      verifiedBy: row.verified_by || '',
      verifiedAt: row.verified_at || row.paid_date,
      issuedAt: row.issued_at,
      themeId: normalizeThemeId(row.theme_id),
      source: 'snapshot',
      voidedAt: row.voided_at,
    }
  }
}
