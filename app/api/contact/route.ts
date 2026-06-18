
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ApiError } from '@/lib/server/api'
import { validateContactPayload } from '@/lib/server/validation'
import { retryWithBackoff } from '@/lib/utils/retry'
import { logger } from '@/src/server/lib/logger'
import { withRoute } from '@/src/server/lib/route'
import { sendFeeTrackPushNotification } from '@/src/server/services/feetrack-push.service'
import { sendTelegramMessage } from '@/src/server/services/telegram.service'

const contactBodySchema = z.object({
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().max(160).optional(),
    phone: z.string().trim().min(6).max(30),
    preferredTime: z.string().trim().max(80).optional(),
    interest: z.string().trim().max(120).optional(),
    message: z.string().trim().max(1000).optional(),
    website: z.string().trim().max(120).optional(),
})

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : String(error)
}

export const POST = withRoute(
  {
    bodySchema: contactBodySchema,
    rateLimit: { tier: 'contact' },
  },
  async ({ body, requestId }) => {
    try {
        const { data, isSpam } = validateContactPayload(body)

        if (isSpam) {
            return NextResponse.json(
                { success: true, message: 'Message received.' },
                { status: 202 }
            )
        }

        const { name, email, phone, preferredTime, interest, message } = data

        // 2. Timestamp
        const timestamp = new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short',
        })

        // 3. Try BOTH Google Sheets and Telegram independently
        //    Success = at least one of them worked
        let sheetOk = false
        let telegramOk = false
        let sheetError: unknown = null
        let telegramError: unknown = null

        // --- Google Sheets (with retry) ---
        try {
            await retryWithBackoff(async () => {
                const { submitContactForm } = await import('@/lib/server/sheets')
                const ok = await submitContactForm([
                    timestamp,
                    name.trim(),
                    phone.trim(),
                    email?.trim() || '—',
                    preferredTime || 'Anytime',
                    interest || 'General Inquiry',
                    message?.trim() || '—',
                ])
                if (!ok) throw new Error('Sheets DAO returned false')
            })
            sheetOk = true
        } catch (err: unknown) {
            sheetError = err
            logger.error('contact.sheets_failed', { requestId, error: err })
        }

        // --- Telegram (with retry) ---
        const escapeTelegramMarkdown = (value: unknown) =>
            String(value).replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1')

        const telegramMessage = [
            `🔔 *New Callback Request in FeeTrack*`,
            ``,
            `*Name:* ${escapeTelegramMarkdown(name.trim())}`,
            `*Phone:* ${escapeTelegramMarkdown(phone.trim())}`,
            `*Interest:* ${escapeTelegramMarkdown(interest || 'General Inquiry')}`,
            ``,
            `Open FeeTrack to review`,
        ].filter(Boolean).join('\n')

        try {
            await retryWithBackoff(async () => {
                const result = await sendTelegramMessage({
                    channel: 'leads',
                    text: telegramMessage,
                    parseMode: 'Markdown',
                })
                if (!result.ok) throw new Error(result.error || 'Telegram leads alert failed')
            }, 2, 800)
            telegramOk = true
        } catch (err) {
            telegramError = err
            logger.error('contact.telegram_failed', { requestId, error: err })
        }

        // --- Channel 3: Supabase DB ---
        let dbOk = false
        try {
      const { supabaseAdmin } = await import('@/lib/server/supabase')
            const noteParts = [
                body.preferredTime ? `Preferred Time: ${body.preferredTime}` : '',
                body.interest ? `Interest: ${body.interest}` : '',
                body.message ? `Message: ${body.message.slice(0, 200)}` : '',
            ].filter(Boolean).join(', ')

            const { error: dbError } = await supabaseAdmin.from('leads').insert({
                name: body.name,
                phone: body.phone,
                email: body.email,
                branch: 'website-contact',
                source: 'website',
                status: 'new',
                notes: noteParts || null,
            })
            if (dbError) throw dbError
            dbOk = true
        } catch (err) {
            logger.error('contact.db_failed', { error: err })
        }

        // 4. Return success if at least one channel captured the data
        if (sheetOk || telegramOk || dbOk) {
            await sendFeeTrackPushNotification({
                title: 'New Callback Request',
                body: `${name.trim()} • ${phone.trim()} • ${preferredTime || 'Anytime'}`,
                url: '/dashboard',
                tag: `callback-${Date.now()}`,
            })

            return NextResponse.json({
                success: true,
                message: 'Message sent successfully!',
                channels: { sheet: sheetOk, telegram: telegramOk, database: dbOk },
            })
        }

        // 5. Both failed — tell client to queue locally
        logger.error('contact.delivery_failed', {
            requestId,
            sheetError: getErrorMessage(sheetError),
            telegramError: getErrorMessage(telegramError),
        })
        return NextResponse.json(
            {
                error: 'Could not send your message. Please try again or call us directly.',
                retryable: true,
            },
            { status: 503 }
        )

    } catch (error) {
        if (error instanceof ApiError) {
            return NextResponse.json(
                {
                    error: error.message,
                    retryable: error.status >= 429,
                },
                {
                    status: error.status,
                    headers: error.headers,
                }
            )
        }

        logger.error('contact.failed', { requestId, error })
        return NextResponse.json(
            { error: 'Something went wrong. Please try again shortly.', retryable: true },
            { status: 500 }
        )
    }
  }
)
