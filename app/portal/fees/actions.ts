'use server'

import { getPortalAthleteFromCookies } from '@/lib/server/auth/require-portal-athlete'
import { FeeLedgerService } from '@/src/server/services/fee-ledger.service'
import { FeeOperationsService } from '@/src/server/services/fee-operations.service'
import { revalidatePath } from 'next/cache'

const MAX_PROOF_BYTES = 5 * 1024 * 1024

// We require a screenshot now, so no fallback needed.
export async function submitManualFeePayment(formData: FormData) {
  const portal = await getPortalAthleteFromCookies()

  if (!portal?.session?.skfId) {
    throw new Error('Unauthorized')
  }

  const screenshot = formData.get('screenshot') as File | null
  if (!screenshot || screenshot.size === 0) {
    throw new Error('Payment screenshot is required.')
  }
  if (!String(screenshot.type || '').startsWith('image/')) {
    throw new Error('Please upload an image file.')
  }
  if (screenshot.size > MAX_PROOF_BYTES) {
    throw new Error('Payment screenshot must be 5 MB or smaller.')
  }

  const selectedFeeKeys = formData
    .getAll('feeKeys')
    .map((value) => String(value || '').trim())
    .filter(Boolean)
  const paymentReference = String(formData.get('paymentReference') || '').trim()

  if (selectedFeeKeys.length === 0) {
    throw new Error('Select at least one due fee record.')
  }

  const arrayBuffer = await screenshot.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const paymentProofBase64 = `data:${screenshot.type || 'image/jpeg'};base64,${buffer.toString('base64')}`
  const paymentProofName = screenshot.name || `Screenshot_${Date.now()}.png`

  const ledgerData = await FeeLedgerService.getPortalLedger(portal.session.skfId)
  const selectedKeySet = new Set(selectedFeeKeys)
  const dueRecords = ledgerData.entries.filter((fee) =>
    selectedKeySet.has(fee.key) &&
    (fee.status === 'due' || fee.status === 'overdue' || fee.status === 'rejected')
  )

  if (dueRecords.length !== selectedKeySet.size) {
    throw new Error('One or more selected fee records are no longer payable.')
  }

  for (const fee of dueRecords) {
    // We submit a portal payment proof which goes into the 'fee_payment_proofs' table
    // The status becomes 'pending_verification' automatically!
    await FeeOperationsService.submitPortalPaymentProof(portal.session.skfId, {
      feeRecordIds: fee.id ? [fee.id] : undefined,
      month: fee.month,
      year: fee.year,
      feeType: fee.feeType,
      amount: fee.amount,
      paymentReference,
      paymentProofBase64,
      paymentProofName
    })
  }

  revalidatePath('/portal/fees')
  return { success: true }
}
