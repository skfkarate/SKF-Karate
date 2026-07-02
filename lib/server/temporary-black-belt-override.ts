/**
 * TEMPORARY — Black Belt Exam Installment Override
 * ==================================================
 * Applies ₹2000/month installment fee for 5 black belt candidates
 * (Jun–Oct 2026) in place of their regular monthly fee.
 *
 * SKF13BL000 is excepted — regular monthly fee + exam fee at end.
 *
 * DELETE THIS FILE after October 2026 (exam complete).
 */

export const BLACK_BELT_INSTALLMENT_SOURCE = 'black_belt_exam_installment_2026'
export const BLACK_BELT_INSTALLMENT_YEAR = 2026
export const BLACK_BELT_INSTALLMENT_AMOUNT = 2000
export const BLACK_BELT_INSTALLMENT_LABEL = 'Black Belt Exam Installment'
export const BLACK_BELT_INSTALLMENT_START_MONTH_INDEX = 5
export const BLACK_BELT_INSTALLMENT_END_MONTH_INDEX = 9

export const BLACK_BELT_INSTALLMENT_IDS = [
  'SKF20HE001',
  'SKF20HE002',
  'SKF20HE003',
  'SKF21HE001',
  'SKF21HE003',
] as const

const BLACK_BELT_INSTALLMENT_ID_SET = new Set<string>(BLACK_BELT_INSTALLMENT_IDS)

function normalizeInstallmentSkfId(skfId: string) {
  return String(skfId || '').trim().toUpperCase().replace(/\s+/g, '')
}

export function isBlackBeltInstallmentCandidate(skfId: string) {
  return BLACK_BELT_INSTALLMENT_ID_SET.has(normalizeInstallmentSkfId(skfId))
}

export function isBlackBeltInstallmentPeriod(month: number, year: number) {
  return (
    year === BLACK_BELT_INSTALLMENT_YEAR &&
    month >= BLACK_BELT_INSTALLMENT_START_MONTH_INDEX &&
    month <= BLACK_BELT_INSTALLMENT_END_MONTH_INDEX
  )
}

export function getBlackBeltOverride(skfId: string, month: number, year: number): {
  amount: number
  label: string
} | null {
  if (!isBlackBeltInstallmentCandidate(skfId)) return null
  if (!isBlackBeltInstallmentPeriod(month, year)) return null
  return { amount: BLACK_BELT_INSTALLMENT_AMOUNT, label: BLACK_BELT_INSTALLMENT_LABEL }
}
