import { google } from 'googleapis'
import { NextResponse } from 'next/server'

// Retry helper with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 500) {
    let lastError
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn()
        } catch (err) {
            lastError = err
            if (attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt)
                await new Promise(resolve => setTimeout(resolve, delay))
            }
        }
    }
    throw lastError
}

export async function POST(request) {
    try {
        // 1. Parse & validate
        let body
        try {
            body = await request.json()
        } catch {
            return NextResponse.json(
                { error: 'Invalid request format', retryable: false },
                { status: 400 }
            )
        }

        const { name, email, phone, preferredTime, interest, message } = body

        if (!name?.trim() || !phone?.trim()) {
            return NextResponse.json(
                { error: 'Name and phone are required', retryable: false },
                { status: 400 }
            )
        }

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
            // Handle all possible newline formats from different hosting providers
            let privateKey = process.env.GOOGLE_PRIVATE_KEY || ''
            privateKey = privateKey.replace(/\\n/g, '\n')

            if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !privateKey) {
                throw new Error('Missing Google credentials: GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY not set')
            }
            if (!process.env.GOOGLE_SHEET_ID) {
                throw new Error('Missing GOOGLE_SHEET_ID environment variable')
            }

            const auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                    private_key: privateKey,
                },
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            })

            const sheets = google.sheets({ version: 'v4', auth })

            await retryWithBackoff(async () => {
                await sheets.spreadsheets.values.append({
                    spreadsheetId: process.env.GOOGLE_SHEET_ID,
                    range: 'A:G',
                    valueInputOption: 'USER_ENTERED',
                    requestBody: {
                        values: [[
                            timestamp,
                            name.trim(),
                            phone.trim(),
                            email?.trim() || '—',
                            preferredTime || 'Anytime',
                            interest || 'General Inquiry',
                            message?.trim() || '—',
                        ]],
                    },
                })
            })
            sheetOk = true
        } catch (err) {
            sheetError = err
            console.error('Google Sheets error:', err?.message || err)
        }

        // --- Telegram (with retry) ---
        const telegramMessage = [
            `🥋 *New Callback Request*`,
            ``,
            `👤 *Name:* ${name.trim()}`,
            `📞 *Phone:* ${phone.trim()}`,
            `⏰ *Call Time:* ${preferredTime || 'Anytime'}`,
            email?.trim() ? `📧 *Email:* ${email.trim()}` : '',
            `🎯 *Interest:* ${interest || 'General Inquiry'}`,
            message?.trim() ? `💬 *Message:* ${message.trim()}` : '',
            ``,
            `🕐 ${timestamp}`,
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
                details: {
                    sheet: sheetError?.message || 'unknown',
                    telegram: telegramError?.message || 'unknown',
                },
                retryable: true,
            },
            { status: 503 }
        )

    } catch (error) {
        console.error('Contact form error:', error?.message || error)
        return NextResponse.json(
            { error: 'Something went wrong. Your request has been saved locally.', retryable: true },
            { status: 500 }
        )
    }
}
