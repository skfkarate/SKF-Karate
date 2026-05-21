'use server'

import { getPortalAthleteFromCookies } from '@/lib/server/auth/require-portal-athlete'
import { supabaseAdmin } from '@/lib/server/supabase'
import { sendTelegramMessage, sendTelegramPhoto } from '@/src/server/services/telegram.service'
import { revalidatePath } from 'next/cache'

const MAX_PROOF_BYTES = 5 * 1024 * 1024

export async function submitBBEnrollmentPayment(formData: FormData) {
  const portal = await getPortalAthleteFromCookies()

  if (!portal?.session?.skfId) {
    throw new Error('Unauthorized')
  }

  const skfId = portal.session.skfId

  // Get active program
  const { data: program, error: progErr } = await supabaseAdmin
    .from('bb_programs')
    .select('*')
    .eq('status', 'active')
    .limit(1)
    .maybeSingle()

  if (progErr || !program) {
    throw new Error('No active Black Belt program found.')
  }

  // Get candidate details
  const { data: candidate, error: candErr } = await supabaseAdmin
    .from('bb_candidates')
    .select('*')
    .eq('program_id', program.id)
    .eq('skf_id', skfId)
    .maybeSingle()

  if (candErr || !candidate) {
    throw new Error('Candidate not enrolled in this program.')
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

  const arrayBuffer = await screenshot.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Update status in supabase
  const { error: updateErr } = await supabaseAdmin
    .from('bb_candidates')
    .update({ enrollment_fee_status: 'verifying' })
    .eq('program_id', program.id)
    .eq('skf_id', skfId)

  if (updateErr) {
    throw new Error('Failed to update payment status in database.')
  }

  // Send Telegram Notification
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
    // If photo send fails, fallback to message
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
}
