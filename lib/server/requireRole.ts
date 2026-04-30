import { cookies } from 'next/headers'
import type { UserRole, JWTPayload } from '@/types'
import { COOKIE_NAME, verifyJWT } from '@/lib/server/auth/portal'
import { getAthleteByRegistrationNumberLive } from './repositories/athletes-live'

export async function requireRole(
  allowedRoles: UserRole[]
): Promise<JWTPayload> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) throw new Error('UNAUTHORIZED')
  const payload = verifyJWT(token)
  if (!payload) throw new Error('UNAUTHORIZED')
  if (!allowedRoles.includes(payload.role)) throw new Error('FORBIDDEN')
  
  if (payload.role === 'student' && payload.skfId) {
    const athlete = await getAthleteByRegistrationNumberLive(payload.skfId)
    if (!athlete || String(athlete.status || '').toLowerCase() === 'inactive') {
      throw new Error('UNAUTHORIZED')
    }
  }
  
  return payload
}

// Helper for API routes:
export function authError(message: string, status: 401 | 403) {
  return Response.json({ error: message }, { status })
}
