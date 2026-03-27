import { google } from 'googleapis'
import { NextResponse } from 'next/server'
import { ApiError, enforceRateLimit, readJsonBody } from '@/lib/server/api'
import { retryWithBackoff } from '@/lib/utils/retry'

function validateEnrollment(body) {
    const errors = []

    const isCurrentStudent = body.isCurrentStudent === 'yes'
    const skfId = (body.skfId || '').trim()
    const agreeToKit = body.agreeToKit === true
    const studentName = (body.studentName || '').trim()
    const age = (body.age || '').toString().trim()
    const parentName = (body.parentName || '').trim()
    const parentContact = (body.parentContact || '').trim()
    const sameAsEmergency = body.sameAsEmergency !== false
    const emergencyContact = sameAsEmergency ? parentContact : (body.emergencyContact || '').trim()
    const area = (body.area || '').trim()
    const school = (body.school || '').trim()
    const experience = (body.experience || '').trim()
    const schoolHasKarate = (body.schoolHasKarate || '').trim()

    if (!studentName || studentName.length < 2) errors.push('Student name is required')
    if (!age || isNaN(age) || +age < 3 || +age > 25) errors.push('Valid age (3-25) is required')
    if (!parentName || parentName.length < 2) errors.push('Parent/Guardian name is required')
    if (!parentContact || !/^[6-9]\d{9}$/.test(parentContact.replace(/\D/g, '').slice(-10))) errors.push('Valid 10-digit mobile number is required')
    if (!sameAsEmergency && (!emergencyContact || !/^[6-9]\d{9}$/.test(emergencyContact.replace(/\D/g, '').slice(-10)))) errors.push('Valid emergency contact is required')
    
    // Conditional requirements based on student type
    if (isCurrentStudent) {
        if (!skfId) errors.push('SKF ID is required for existing students')
        if (!school) errors.push('School name is required')
        if (!['yes', 'no', 'not_sure'].includes(schoolHasKarate)) errors.push('School karate class selection is required')
    } else {
        if (!area) errors.push('Area / Locality is required')
        if (!school) errors.push('School name is required')
        if (!['beginner', 'experienced'].includes(experience)) errors.push('Karate experience selection is required')
        if (!['yes', 'no', 'not_sure'].includes(schoolHasKarate)) errors.push('School karate class selection is required')
    }

    // Honeypot spam check
    if (body._gotcha) {
        return { isSpam: true }
    }

    if (errors.length > 0) {
        throw new ApiError(400, errors[0], { details: errors })
    }

    return {
        data: { isCurrentStudent, skfId, agreeToKit, studentName, age, parentName, parentContact, sameAsEmergency, emergencyContact, area, school, experience, schoolHasKarate },
        isSpam: false,
    }
}

export async function POST(request) {
    try {
        enforceRateLimit(request, {
            name: 'summer-camp-enroll',
            limit: 5,
            windowMs: 15 * 60 * 1000,
        })

        const body = await readJsonBody(request)
        const { data, isSpam } = validateEnrollment(body)

        if (isSpam) {
            return NextResponse.json(
                { success: true, message: 'Registration received.' },
                { status: 202 }
            )
        }

        const { isCurrentStudent, skfId, agreeToKit, studentName, age, parentName, parentContact, sameAsEmergency, emergencyContact, area, school, experience, schoolHasKarate } = data

        const timestamp = new Date().toLocaleString('en-IN', {
            timeZone: 'Asia/Kolkata',
            dateStyle: 'medium',
            timeStyle: 'short',
        })

        let sheetOk = false
        let telegramOk = false
        let sheetError = null
        let telegramError = null

        // --- Google Sheets ---
        try {
            let privateKey = process.env.GOOGLE_PRIVATE_KEY || ''
            privateKey = privateKey.replace(/\\n/g, '\n')

            if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !privateKey) {
                throw new Error('Missing Google credentials')
            }
            if (!process.env.GOOGLE_SHEET_ID_SUMMER_CAMP) {
                throw new Error('Missing GOOGLE_SHEET_ID_SUMMER_CAMP')
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
                    spreadsheetId: process.env.GOOGLE_SHEET_ID_SUMMER_CAMP,
                    range: 'Summer Camp Enrollments!A:K',
                    valueInputOption: 'USER_ENTERED',
                    requestBody: {
                        values: [[
                            timestamp,
                            isCurrentStudent ? `[${skfId}] ${studentName}` : studentName,
                            age,
                            parentName,
                            parentContact,
                            sameAsEmergency ? 'Same as parent' : emergencyContact,
                            isCurrentStudent ? 'Existing SKF Student' : area,
                            school,
                            isCurrentStudent ? 'Active SKF Member' : (experience === 'beginner' ? 'Beginner' : 'Done Before'),
                            schoolHasKarate === 'yes' ? 'Yes' : schoolHasKarate === 'no' ? 'No' : 'Not Sure',
                            isCurrentStudent ? '100% Free (Existing VIP)' : (agreeToKit ? 'Free Month 1 + ₹300 Kit Reserved' : 'Free Month 1 (No Kit)'),
                        ]],
                    },
                })
            })
            sheetOk = true
        } catch (err) {
            sheetError = err
            console.error('Google Sheets error:', err?.message || err)
        }

        // --- Telegram ---
        const escapeTg = (v) => String(v).replace(/([_*\[\]()~`>#+=|{}.!\\-])/g, '\\$1')

        const telegramMessage = [
            `🥋 *NEW Summer Camp Enrollment*`,
            ``,
            isCurrentStudent ? `🏆 *Existing SKF Member:* ${escapeTg(skfId)}` : `🆕 *New Student Registration*`,
            `👤 *Student:* ${escapeTg(studentName)}, Age ${escapeTg(age)}`,
            `👨‍👩‍👧 *Guardian:* ${escapeTg(parentName)}`,
            `📞 *Contact:* ${escapeTg(parentContact)}`,
            `🆘 *Emergency:* ${sameAsEmergency ? 'Same' : escapeTg(emergencyContact)}`,
            `📍 *Area:* ${isCurrentStudent ? escapeTg('(Existing Student)') : escapeTg(area)}`,
            `🏫 *School:* ${escapeTg(school)}`,
            `🥋 *Experience:* ${isCurrentStudent ? escapeTg('Active SKF Member') : escapeTg(experience === 'beginner' ? 'Beginner' : 'Done Before')}`,
            `🏫 *School Karate:* ${escapeTg(schoolHasKarate === 'yes' ? 'Yes' : schoolHasKarate === 'no' ? 'No' : 'Not Sure')}`,
            ``,
            `🎟️ *Plan:* ${isCurrentStudent ? escapeTg('100% Free (VIP)') : escapeTg(agreeToKit ? 'Free Month 1 + ₹300 Kit Reserved' : 'Free Month 1 (No Kit)')}`,
            `🕐 ${escapeTg(timestamp)}`,
        ].join('\n')

        try {
            if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
                throw new Error('Missing Telegram credentials')
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
                            parse_mode: 'MarkdownV2',
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

        if (sheetOk || telegramOk) {
            return NextResponse.json({
                success: true,
                message: 'Registration successful!',
                channels: { sheet: sheetOk, telegram: telegramOk },
            })
        }

        console.error('BOTH channels failed. Sheet:', sheetError?.message, 'Telegram:', telegramError?.message)
        return NextResponse.json(
            { error: 'Could not complete registration. Please try again or contact us directly.', retryable: true },
            { status: 503 }
        )

    } catch (error) {
        if (error instanceof ApiError) {
            return NextResponse.json(
                { error: error.message, ...(error.details ? { details: error.details } : {}), retryable: error.status >= 429 },
                { status: error.status, headers: error.headers }
            )
        }

        console.error('Enrollment form error:', error?.message || error)
        return NextResponse.json(
            { error: 'Something went wrong. Please try again shortly.', retryable: true },
            { status: 500 }
        )
    }
}
