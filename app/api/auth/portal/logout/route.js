import { NextResponse } from 'next/server'
import { buildPortalCookieClear } from '@/lib/server/auth'

/**
 * POST /api/auth/portal/logout
 * Clears the portal JWT cookie.
 */
export async function POST() {
  const response = NextResponse.json({ success: true })
  response.headers.set('Set-Cookie', buildPortalCookieClear())
  return response
}
