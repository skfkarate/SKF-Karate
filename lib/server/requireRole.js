import { NextResponse } from 'next/server'
import { getPortalSession } from './auth'

/**
 * Enforce role-based access on an API route.
 *
 * Usage in an API route:
 *   const session = requireRole(request, ['branch_admin', 'super_admin'])
 *   // session contains { skfId, role, branch, ... }
 *
 * Role hierarchy:
 *   - super_admin:  all branches, all data, read+write everything
 *   - branch_admin: own branch only, read+write students/fees/videos/timetables
 *   - sensei:       own batch only, read students, write attendance + videos
 *   - student:      own skfId only, read own data, write certificate_events
 *
 * @param {Request} request
 * @param {string[]} allowedRoles — roles that can access this route
 * @returns {object} decoded JWT session
 * @throws {NextResponse} 401 or 403
 */
export function requireRole(request, allowedRoles) {
  const session = getPortalSession(request)

  if (!session) {
    throw NextResponse.json(
      { error: 'Authentication required. Please log in.' },
      { status: 401 }
    )
  }

  if (!allowedRoles.includes(session.role)) {
    throw NextResponse.json(
      { error: 'You do not have permission to access this resource.' },
      { status: 403 }
    )
  }

  return session
}

/**
 * Enforce that the request is from the student who owns the data.
 * @param {Request} request
 * @param {string} targetSkfId — the SKF ID of the data being accessed
 * @returns {object} decoded JWT session
 * @throws {NextResponse} 401 or 403
 */
export function requireOwnerOrAdmin(request, targetSkfId) {
  const session = getPortalSession(request)

  if (!session) {
    throw NextResponse.json(
      { error: 'Authentication required. Please log in.' },
      { status: 401 }
    )
  }

  const isAdmin = ['super_admin', 'branch_admin'].includes(session.role)
  const isOwner = session.skfId === targetSkfId

  if (!isAdmin && !isOwner) {
    throw NextResponse.json(
      { error: 'You can only access your own data.' },
      { status: 403 }
    )
  }

  return session
}

/**
 * Enforce branch isolation — admin can only access their own branch's data.
 * super_admin bypasses this check.
 * @param {object} session — decoded JWT
 * @param {string} targetBranch — the branch being accessed
 * @returns {boolean} true if allowed
 * @throws {NextResponse} 403
 */
export function requireBranchAccess(session, targetBranch) {
  if (session.role === 'super_admin') return true

  if (session.branch?.toLowerCase() !== targetBranch?.toLowerCase()) {
    throw NextResponse.json(
      { error: 'You can only access data from your own branch.' },
      { status: 403 }
    )
  }

  return true
}
