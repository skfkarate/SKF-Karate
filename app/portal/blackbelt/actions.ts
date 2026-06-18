'use server'

import { getPortalAthleteFromCookies } from '@/lib/server/auth/require-portal-athlete'
import { supabaseAdmin } from '@/lib/server/supabase'
import { sendTelegramMessage, sendTelegramPhoto } from '@/src/server/services/telegram.service'
import { AppError } from '@/src/server/lib/errors'
import { logger } from '@/src/server/lib/logger'
import { revalidatePath } from 'next/cache'

type ActionResult = { success: true } | { success: false; message: string }

const MAX_PROOF_BYTES = 5 * 1024 * 1024

export async function submitBBEnrollmentPayment(formData: FormData): Promise<ActionResult> {
  try {
    const portal = await getPortalAthleteFromCookies()

    if (!portal?.session?.skfId) {
      return { success: false, message: 'Please log in again.' }
    }

    const skfId = portal.session.skfId

    const { data: program, error: progErr } = await supabaseAdmin
      .from('bb_programs')
      .select('*')
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()

    if (progErr || !program) {
      return { success: false, message: 'No active Black Belt program found.' }
    }

    const { data: candidate, error: candErr } = await supabaseAdmin
      .from('bb_candidates')
      .select('*')
      .eq('program_id', program.id)
      .eq('skf_id', skfId)
      .maybeSingle()

    if (candErr || !candidate) {
      return { success: false, message: 'Candidate not enrolled in this program.' }
    }

    const screenshot = formData.get('screenshot') as File | null
    if (!screenshot || screenshot.size === 0) {
      return { success: false, message: 'Payment screenshot is required.' }
    }
    if (!String(screenshot.type || '').startsWith('image/')) {
      return { success: false, message: 'Please upload an image file.' }
    }
    if (screenshot.size > MAX_PROOF_BYTES) {
      return { success: false, message: 'Payment screenshot must be 5 MB or smaller.' }
    }

    const arrayBuffer = await screenshot.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { error: updateErr } = await supabaseAdmin
      .from('bb_candidates')
      .update({ enrollment_fee_status: 'verifying' })
      .eq('program_id', program.id)
      .eq('skf_id', skfId)

    if (updateErr) {
      return { success: false, message: 'Failed to update payment status in database.' }
    }

    const text = [
      '📋 *Black Belt Program Deposit Submitted*',
      '',
      `*Student:* ${candidate.display_name || portal.session.name} (${skfId})`,
      `*Amount:* ₹2,000`,
      `*Submitted:* ${new Date().toLocaleString('en-IN')}`,
    ].filter(Boolean).join('\n')

    try {
      const blob = new Blob([new Uint8Array(buffer)], { type: screenshot.type || 'image/png' })
      await sendTelegramPhoto({
        channel: 'fees',
        photo: blob,
        filename: screenshot.name || 'proof.png',
        caption: text,
        parseMode: 'Markdown',
        timeoutMs: 5000,
      })
    } catch {
      try {
        await sendTelegramMessage({
          channel: 'fees',
          text: text + '\n⚠️ (Image upload failed, screenshot not attached)',
          parseMode: 'Markdown',
          timeoutMs: 5000,
        })
      } catch {
        // Ignore notification failures to avoid blocking user flow
      }
    }

    revalidatePath('/portal/blackbelt')
    return { success: true }
  } catch (error) {
    logger.warn('portal.bb_payment_failed', { error })
    return {
      success: false,
      message: error instanceof AppError && error.expose ? error.message : 'Could not submit payment proof. Please try again.',
    }
  }
}
