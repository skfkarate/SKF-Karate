import { google } from 'googleapis'
import { NextResponse } from 'next/server'

// Rate limiting — simple in-memory store
const submissions = new Map()
const RATE_LIMIT_MS = 60000 // 1 submission per minute per IP

// Retry helper with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 500) {
    let lastError
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn()
        } catch (err) {
            lastError = err
            if (attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt) // 500ms → 1s → 2s
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

        // 2. Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        const lastSubmission = submissions.get(ip)
        if (lastSubmission && Date.now() - lastSubmission < RATE_LIMIT_MS) {
            return NextResponse.json(
                { error: 'Please wait a minute before submitting again', retryable: false },
                { status: 429 }
            )
        }
        submissions.set(ip, Date.now())

        // 3. Timestamp
        const timestamp = new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short',
        })

        // 4. Write to Google Sheets with retry logic (primary lead capture)
        try {
            const auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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
        } catch (sheetError) {
            console.error('Google Sheets error (all retries failed):', sheetError?.message || sheetError)
            return NextResponse.json(
                { error: 'We\'re experiencing a temporary issue. Your request has been saved locally and will be sent automatically.', retryable: true },
                { status: 503 }
            )
        }

        // 5. Send Telegram notification (fire-and-forget — don't wait for it)
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

        fetch(
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
        ).catch(err => console.error('Telegram notification failed:', err))

        return NextResponse.json({ success: true, message: 'Message sent successfully!' })

    } catch (error) {
        console.error('Contact form error:', error?.message || error)
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.', retryable: true },
            { status: 500 }
        )
    }
}
