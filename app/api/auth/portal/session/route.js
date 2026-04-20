import { NextResponse } from 'next/server'
import { getPortalSession } from '@/lib/server/auth_legacy'

/**
 * GET /api/auth/portal/session
 * Returns 200 + session payload if valid, 401 if not.
 * Used by the client-side usePortalAuth hook.
 */
export async function GET(request) {
  const session = getPortalSession(request)
  if (!session || !session.skfId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({
    skfId: session.skfId,
    name: session.name || null,
    branch: session.branch || null,
    belt: session.belt || null,
    role: session.role || 'student',
  })
}
