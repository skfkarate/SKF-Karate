import { NextResponse } from 'next/server'
import { createJWT, buildPortalCookie } from '@/lib/server/auth'
import { getAthleteByRegistrationNumber } from '@/lib/data/athletes'

/**
 * POST /api/auth/portal
 * 
 * Body: { skfId, dob }
 * - dob format: DD/MM/YYYY (from the frontend) → converted to YYYY-MM-DD for matching
 */
export async function POST(request) {
  try {
    const body = await request.json()
    const { skfId, dob } = body

    if (!skfId || typeof skfId !== 'string') {
      return NextResponse.json(
        { error: 'SKF ID is required.' },
        { status: 400 }
      )
    }

    if (!dob || typeof dob !== 'string') {
      return NextResponse.json(
        { error: 'Date of Birth is required.' },
        { status: 400 }
      )
    }

    const normalizedId = skfId.trim().toUpperCase()

    // Parse DD/MM/YYYY, DD-MM-YYYY, DD MM YYYY → YYYY-MM-DD
    const dobParts = dob.split(/[-/\s.]+/).filter(Boolean)
    if (dobParts.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid date format. Use DD/MM/YYYY or DD-MM-YYYY.' },
        { status: 400 }
      )
    }
    const [day, month, year] = dobParts
    const normalizedDob = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`

    // Look up athlete from the local JSON data store
    const athlete = getAthleteByRegistrationNumber(normalizedId)

    if (!athlete) {
      return NextResponse.json(
        { error: 'No athlete found with this SKF ID.' },
        { status: 404 }
      )
    }

    // Verify Date of Birth
    if (athlete.dateOfBirth !== normalizedDob) {
      return NextResponse.json(
        { error: 'Date of Birth does not match our records.' },
        { status: 401 }
      )
    }

    // Auth successful — create JWT
    const token = createJWT({
      skfId: normalizedId,
      role: 'student',
      branch: athlete.branchName || null,
      belt: athlete.currentBelt || null,
      name: athlete.firstName || null,
    })

    const response = NextResponse.json({ success: true })
    response.headers.set('Set-Cookie', buildPortalCookie(token))
    return response

  } catch (error) {
    console.error('[Portal Auth] Error:', error)
    return NextResponse.json(
      { error: 'Authentication failed. Please try again.' },
      { status: 500 }
    )
  }
}
