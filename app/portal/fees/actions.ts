'use server'

import { getPortalAthleteFromCookies } from '@/lib/server/auth/require-portal-athlete'
import { FeeLedgerService } from '@/src/server/services/fee-ledger.service'
import { FeeOperationsService } from '@/src/server/services/fee-operations.service'
import { AppError } from '@/src/server/lib/errors'
import { logger } from '@/src/server/lib/logger'
import { revalidatePath } from 'next/cache'

const MAX_PROOF_BYTES = 5 * 1024 * 1024
const ALLOWED_PROOF_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])

type ManualFeePaymentResult =
  | { ok: true; submittedFeeKeys: string[] }
  | { ok: false; message: string }

function firstValidationMessage(details: unknown) {
  if (!details || typeof details !== 'object') return null

  for (const value of Object.values(details as Record<string, unknown>)) {
    if (Array.isArray(value)) {
      const first = value.find((entry) => typeof entry === 'string' && entry.trim())
      if (first) return first
    }
    if (typeof value === 'string' && value.trim()) return value
  }

  return null
}

function friendlyPaymentError(error: unknown) {
  if (error instanceof AppError) {
    if (error.name === 'ValidationError') {
      return firstValidationMessage(error.details) || 'Please check the payment details and try again.'
    }
    if (error.statusCode === 401) return 'Please log in again before submitting payment proof.'
    if (error.expose && error.message) return error.message
  }

  if (error instanceof Error && error.message.includes('fetch failed')) {
    return 'Network issue while submitting the screenshot. Please try again.'
  }

  return 'We could not submit the payment proof right now. Please try again.'
}

// We require a screenshot now, so no fallback needed.
export async function submitManualFeePayment(formData: FormData): Promise<ManualFeePaymentResult> {
  try {
    const portal = await getPortalAthleteFromCookies()

    if (!portal?.session?.skfId) {
      return { ok: false, message: 'Please log in again before submitting payment proof.' }
    }

    const screenshotValue = formData.get('screenshot')
    const screenshot = screenshotValue instanceof File ? screenshotValue : null
    if (!screenshot || screenshot.size === 0) {
      return { ok: false, message: 'Please upload a payment screenshot.' }
    }
    if (!ALLOWED_PROOF_TYPES.has(String(screenshot.type || '').toLowerCase())) {
      return { ok: false, message: 'Please upload a PNG, JPG, or WebP screenshot.' }
    }
    if (screenshot.size > MAX_PROOF_BYTES) {
      return { ok: false, message: 'Payment screenshot must be 5 MB or smaller.' }
    }

    const selectedFeeKeys = formData
      .getAll('feeKeys')
      .map((value) => String(value || '').trim())
      .filter(Boolean)
    
    const applyCreditId = String(formData.get('applyCreditId') || '').trim()

    if (selectedFeeKeys.length === 0) {
      return { ok: false, message: 'Please select at least one fee record.' }
    }

    const arrayBuffer = await screenshot.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const paymentProofBase64 = `data:${screenshot.type || 'image/jpeg'};base64,${buffer.toString('base64')}`
    const paymentProofName = screenshot.name || `Screenshot_${Date.now()}.png`

    const ledgerData = await FeeLedgerService.getPortalLedger(portal.session.skfId)
    const selectedKeySet = new Set(selectedFeeKeys)
    const selectedRecords = ledgerData.entries.filter((fee) => selectedKeySet.has(fee.key))
    const dueRecords = selectedRecords.filter((fee) =>
      fee.status === 'due' || fee.status === 'overdue' || fee.status === 'rejected'
    )
    const alreadyPendingKeys = selectedRecords
      .filter((fee) => fee.status === 'pending_verification')
      .map((fee) => fee.key)

    if (selectedRecords.length !== selectedKeySet.size) {
      return { ok: false, message: 'Some selected fees changed. Please refresh and try again.' }
    }

    if (!dueRecords.length) {
      if (alreadyPendingKeys.length) {
        return { ok: true, submittedFeeKeys: alreadyPendingKeys }
      }
      return { ok: false, message: 'The selected fee is no longer payable.' }
    }

    const submittedFeeKeys: string[] = []
    let lastError: unknown = null
    let creditToApply = applyCreditId

    for (const fee of dueRecords) {
      try {
        if (creditToApply) {
          await FeeOperationsService.applyPortalCredit(portal.session.skfId, {
            creditId: creditToApply,
            month: fee.month,
            year: fee.year,
            feeType: fee.feeType,
          })
          creditToApply = '' // Only apply once!
        }

        await FeeOperationsService.submitPortalPaymentProof(portal.session.skfId, {
          feeRecordIds: fee.id ? [fee.id] : undefined,
          month: fee.month,
          year: fee.year,
          feeType: fee.feeType,
          amount: fee.amount,
          paymentProofBase64,
          paymentProofName,
        })
        submittedFeeKeys.push(fee.key)
      } catch (error) {
        lastError = error
        logger.warn('portal.fee_payment_submit_failed', {
          skfId: portal.session.skfId,
          feeKey: fee.key,
          error,
        })
      }
    }

    if (!submittedFeeKeys.length) {
      return { ok: false, message: friendlyPaymentError(lastError) }
    }

    revalidatePath('/portal/fees')
    return { ok: true, submittedFeeKeys: [...alreadyPendingKeys, ...submittedFeeKeys] }
  } catch (error) {
    logger.warn('portal.fee_payment_action_failed', { error })
    return { ok: false, message: friendlyPaymentError(error) }
  }
}

type ApplyCreditResult =
  | { ok: true; appliedAmount: number; remainingDue: number; creditId: string }
  | { ok: false; message: string }

export async function applyPortalCredit(input: {
  creditId: string
  feeKey: string
  month: string
  year: number
  feeType: string
}): Promise<ApplyCreditResult> {
  try {
    const portal = await getPortalAthleteFromCookies()
    if (!portal?.session?.skfId) {
      return { ok: false, message: 'Please log in again.' }
    }

    const skfId = portal.session.skfId

    // Validate: the fee must exist and be due
    const ledger = await FeeLedgerService.getPortalLedger(skfId)
    const targetFee = ledger.entries.find(
      (f) => f.key === input.feeKey && (f.status === 'due' || f.status === 'overdue' || f.status === 'rejected')
    )
    if (!targetFee) {
      return { ok: false, message: 'The selected fee is no longer payable.' }
    }

    // Apply via the existing FeeOperationsService action
    const result = await FeeOperationsService.applyPortalCredit(skfId, {
      creditId: input.creditId,
      month: input.month,
      year: input.year,
      feeType: input.feeType || 'monthly',
    })

    revalidatePath('/portal/fees')
    return {
      ok: true,
      appliedAmount: result.appliedAmount,
      remainingDue: result.remainingDue,
      creditId: input.creditId,
    }
  } catch (error) {
    logger.warn('portal.apply_credit_failed', { error })
    return {
      ok: false,
      message: error instanceof AppError && error.expose ? error.message : 'Could not apply credit. Please try again.',
    }
  }
}
