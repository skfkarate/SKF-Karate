
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { ApiError } from '@/lib/server/api'
import { validateContactPayload } from '@/lib/server/validation'
import { retryWithBackoff } from '@/lib/utils/retry'
import { logger } from '@/src/server/lib/logger'
import { withRoute } from '@/src/server/lib/route'

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
            `🥋 *New Callback Request*`,
            ``,
            `👤 *Name:* ${escapeTelegramMarkdown(name.trim())}`,
            `📞 *Phone:* ${escapeTelegramMarkdown(phone.trim())}`,
            `⏰ *Call Time:* ${escapeTelegramMarkdown(preferredTime || 'Anytime')}`,
            email?.trim() ? `📧 *Email:* ${escapeTelegramMarkdown(email.trim())}` : '',
            `🎯 *Interest:* ${escapeTelegramMarkdown(interest || 'General Inquiry')}`,
            message?.trim() ? `💬 *Message:* ${escapeTelegramMarkdown(message.trim())}` : '',
            ``,
            `🕐 ${escapeTelegramMarkdown(timestamp)}`,
        ].filter(Boolean).join('\n')

        try {
            if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
                throw new Error('Missing Telegram credentials: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set')
            }

            await retryWithBackoff(async () => {
                const res = await fetch(
                    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: process.env.TELEGRAM_CHAT_ID,
                            text: telegramMessage,
                            parse_mode: 'Markdown',
                        }),
                    }
                )
                if (!res.ok) {
                    const errorBody = await res.text()
                    throw new Error(`Telegram HTTP ${res.status}: ${errorBody}`)
                }
            }, 2, 800)
            telegramOk = true
        } catch (err) {
            telegramError = err
            logger.error('contact.telegram_failed', { requestId, error: err })
        }

        // 4. Return success if at least one channel captured the data
        if (sheetOk || telegramOk) {
            return NextResponse.json({
                success: true,
                message: 'Message sent successfully!',
                channels: { sheet: sheetOk, telegram: telegramOk },
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
