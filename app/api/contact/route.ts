
import { NextResponse } from 'next/server'
import { ApiError, enforceRateLimit, readJsonBody } from '@/lib/server/api'
import { validateContactPayload } from '@/lib/server/validation'
import { retryWithBackoff } from '@/lib/utils/retry'



export async function POST(request) {
    try {
        enforceRateLimit(request, {
            name: 'contact-form',
            limit: 5,
            windowMs: 15 * 60 * 1000,
        })

        const body = await readJsonBody(request)
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
        let sheetError = null
        let telegramError = null

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
        } catch (err: any) {
            sheetError = err
            console.error('Google Sheets error:', err?.message || err)
        }

        // --- Telegram (with retry) ---
        const escapeTelegramMarkdown = (value) =>
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
            console.error('Telegram error:', err?.message || err)
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
        console.error('BOTH channels failed. Sheet:', sheetError?.message, 'Telegram:', telegramError?.message)
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

        console.error('Contact form error:', error?.message || error)
        return NextResponse.json(
            { error: 'Something went wrong. Please try again shortly.', retryable: true },
            { status: 500 }
        )
    }
}
