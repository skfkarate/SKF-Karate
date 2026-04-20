import { NextResponse } from 'next/server'
import { supabaseAdmin, isSupabaseReady } from '@/lib/server/supabase'
import { hashPin, createJWT, buildPortalCookie } from '@/lib/server/auth_legacy'
import { createErrorResponse, readJsonBody, enforceRateLimit } from '@/lib/server/api'
import { getStudentBySkfId } from '@/lib/server/sheets'

/**
 * POST /api/auth/portal/set-pin
 * First-time PIN setup for a student.
 * 
 * Body: { skfId, pin }
 */
export async function POST(request) {
  try {
    enforceRateLimit(request, {
      name: 'portal-set-pin',
      limit: 5,
      windowMs: 60 * 1000,
    })

    const body = await readJsonBody(request)
    const { skfId, pin } = body

    if (!skfId || typeof skfId !== 'string') {
      return NextResponse.json(
        { error: 'SKF ID is required.' },
        { status: 400 }
      )
    }

    if (!pin || typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits.' },
        { status: 400 }
      )
    }

    const normalizedId = skfId.trim().toUpperCase()

    if (!isSupabaseReady()) {
      return NextResponse.json(
        { error: 'Authentication service is not configured yet. Please contact admin.' },
        { status: 503 }
      )
    }

    // Validate that skfId exists in Google Sheets
    const studentData = await getStudentBySkfId(normalizedId)
    
    if (!studentData) {
      return NextResponse.json(
        { error: 'Invalid SKF ID. You must be registered in the dojo first.' },
        { status: 403 }
      )
    }

    // Hash PIN
    const pinHash = await hashPin(pin)

    // Upsert into auth_sessions
    const { error: upsertError } = await supabaseAdmin
      .from('auth_sessions')
      .upsert(
        {
          skf_id: normalizedId,
          pin_hash: pinHash,
          failed_attempts: 0,
          locked_until: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'skf_id' }
      )

    if (upsertError) {
      console.error('[set-pin] Supabase upsert error:', upsertError)
      return NextResponse.json(
        { error: 'Failed to save PIN. Please try again.' },
        { status: 500 }
      )
    }

    // Issue JWT + cookie, storing the Google Sheets derived data
    const token = createJWT({
      skfId: normalizedId,
      role: 'student',
      branch: studentData.Branch || studentData.branch || null,
      batch: studentData.Batch || studentData.batch || null,
      belt: studentData.Belt || studentData.belt || null,
      name: studentData["First Name"] || studentData.firstName || null,
    })

    const response = NextResponse.json({ success: true })
    response.headers.set('Set-Cookie', buildPortalCookie(token))
    return response

  } catch (error) {
    if (error instanceof NextResponse) return error
    return createErrorResponse(error, 'Failed to set PIN. Please try again.')
  }
}
