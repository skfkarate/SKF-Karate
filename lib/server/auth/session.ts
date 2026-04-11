import type { Session } from 'next-auth'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from './options'

type AllowedRoles = string | string[] | undefined

function normaliseAllowedRoles(
  allowedRoles: AllowedRoles,
  fallbackRoles: string[]
): string[] {
  if (!allowedRoles) {
    return fallbackRoles
  }

  return Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
}

export async function requireAdminSession(
  allowedRoles?: AllowedRoles
): Promise<Session> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role) {
    redirect('/admin/login')
  }

  const roles = normaliseAllowedRoles(allowedRoles, ['admin', 'instructor'])

  if (!roles.includes(session.user.role)) {
    redirect('/admin')
  }

  return session
}

export async function getAdminSession(): Promise<Session | null> {
  return getServerSession(authOptions)
}

export async function getAuthorizedApiSession(
  allowedRoles: AllowedRoles = 'admin'
): Promise<Session | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role) return null

  const roles = normaliseAllowedRoles(allowedRoles, ['admin'])
  return roles.includes(session.user.role) ? session : null
}

export function hasRole(session: Session | null, role: string): boolean {
  if (!session?.user) return false
  return session.user.role === role
}
