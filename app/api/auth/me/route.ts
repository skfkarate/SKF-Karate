import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAthleteByRegistrationNumber } from '@/lib/server/repositories/athletes'

// Use the same JWT verification as the portal login sets
// auth_legacy uses: cookie name 'skf_portal_token', and JWT_SECRET || NEXTAUTH_SECRET
const jwt = require('jsonwebtoken')

function verifyToken(token: string): any {
    const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
    if (!secret) return null
    try {
        return jwt.verify(token, secret)
    } catch {
        return null
    }
}

export async function GET() {
    try {
        const cookieStore = await cookies()
        // The portal login sets 'skf_portal_token', NOT 'skf_student_token'
        const token = cookieStore.get('skf_portal_token')?.value

        if (!token) {
            return NextResponse.json({ authenticated: false }, { status: 200 })
        }

        const session = verifyToken(token)
        if (!session || !session.skfId) {
            return NextResponse.json({ authenticated: false }, { status: 200 })
        }

        const athlete = getAthleteByRegistrationNumber(session.skfId)

        if (!athlete) {
            return NextResponse.json({ authenticated: false }, { status: 200 })
        }

        return NextResponse.json({
            authenticated: true,
            user: {
                skfId: session.skfId,
                name: athlete.firstName + (athlete.lastName ? ` ${athlete.lastName}` : ''),
                phone: athlete.mobileNumber || '+91',
                branch: athlete.branchName || 'SKF HQ',
                belt: athlete.currentBelt || 'White'
            }
        })

    } catch (e: any) {
        console.error('[Auth/Me] Failed to pull session:', e)
        return NextResponse.json({ authenticated: false }, { status: 200 })
    }
}
