import { google } from 'googleapis'
import { NextResponse } from 'next/server'

// Rate limiting — simple in-memory store
const submissions = new Map()
const RATE_LIMIT_MS = 60000 // 1 submission per minute per IP

export async function POST(request) {
    try {
        // 1. Parse & validate
        const body = await request.json()
        const { name, email, phone, preferredTime, interest, message } = body

        if (!name?.trim() || !phone?.trim()) {
            return NextResponse.json(
                { error: 'Name and phone are required' },
                { status: 400 }
            )
        }

        // 2. Rate limiting
        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        const lastSubmission = submissions.get(ip)
        if (lastSubmission && Date.now() - lastSubmission < RATE_LIMIT_MS) {
            return NextResponse.json(
                { error: 'Please wait a minute before submitting again' },
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

        // 4. Write to Google Sheets
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        })

        const sheets = google.sheets({ version: 'v4', auth })

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

        // 5. Send Telegram notification
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

        await fetch(
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

        return NextResponse.json({ success: true, message: 'Message sent successfully!' })

    } catch (error) {
        console.error('Contact form error:', error)
        return NextResponse.json(
            { error: 'Something went wrong. Please try again.' },
            { status: 500 }
        )
    }
}
