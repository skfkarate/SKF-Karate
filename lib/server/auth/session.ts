import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from './options'

function normaliseAllowedRoles(allowedRoles, fallbackRoles) {
  if (!allowedRoles) {
    return fallbackRoles
  }

  return Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
}

export async function requireAdminSession(allowedRoles) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/admin/login')
  }

  const roles = normaliseAllowedRoles(allowedRoles, ['admin', 'instructor'])

  if (!roles.includes(session.user.role)) {
    redirect('/admin')
  }

  return session
}

export async function getAdminSession() {
  return getServerSession(authOptions)
}

export async function getAuthorizedApiSession(allowedRoles = 'admin') {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role) return null

  const roles = normaliseAllowedRoles(allowedRoles, ['admin'])
  return roles.includes(session.user.role) ? session : null
}

export function hasRole(session, role) {
  if (!session?.user) return false
  return session.user.role === role
}
