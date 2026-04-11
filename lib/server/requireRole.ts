import { cookies } from 'next/headers'
import { verifyStudentJWT } from './auth'
import type { UserRole, JWTPayload } from '@/types'
import { getStudentBySkfId } from './sheets'

export async function requireRole(
  allowedRoles: UserRole[]
): Promise<JWTPayload> {
  const cookieStore = cookies()
  const token = cookieStore.get('skf_student_token')?.value
  if (!token) throw new Error('UNAUTHORIZED')
  const payload = verifyStudentJWT(token)
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
