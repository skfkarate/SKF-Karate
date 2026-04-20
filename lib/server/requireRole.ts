import { cookies } from 'next/headers'
import type { UserRole, JWTPayload } from '@/types'
import { getStudentBySkfId } from './sheets'

const jwt = require('jsonwebtoken')

function verifyPortalToken(token: string): JWTPayload | null {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET
  if (!secret) return null
  try {
    return jwt.verify(token, secret) as JWTPayload
  } catch {
    return null
  }
}

export async function requireRole(
  allowedRoles: UserRole[]
): Promise<JWTPayload> {
  const cookieStore = await cookies()
  // The portal login sets 'skf_portal_token'
  const token = cookieStore.get('skf_portal_token')?.value
  if (!token) throw new Error('UNAUTHORIZED')
  const payload = verifyPortalToken(token)
  if (!payload) throw new Error('UNAUTHORIZED')
  if (!allowedRoles.includes(payload.role)) throw new Error('FORBIDDEN')
  
  if (payload.role === 'student' && payload.skfId) {
    const student = await getStudentBySkfId(payload.skfId)
    if (student?.status === 'Inactive') {
      throw new Error('UNAUTHORIZED')
    }
  }
  
  return payload
}

// Helper for API routes:
export function authError(message: string, status: 401 | 403) {
  return Response.json({ error: message }, { status })
}
