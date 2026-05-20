import type { JWTPayload } from '@/types'

type PortalAthleteLike = {
  skfId?: string | null
  status?: string | null
  branchName?: string | null
  batch?: string | null
  currentBelt?: string | null
  firstName?: string | null
  phone?: string | null
}

export function isEligiblePortalAthlete(athlete?: PortalAthleteLike | null) {
  if (!athlete) return false
  return String(athlete.status || 'active').trim().toLowerCase() === 'active'
}

export function buildCanonicalPortalSession(
  session: JWTPayload,
  athlete: PortalAthleteLike
): JWTPayload {
  return {
    ...session,
    skfId: athlete.skfId || session.skfId,
    branch: (athlete.branchName || session.branch || null) as JWTPayload['branch'],
    batch: athlete.batch || session.batch || null,
    belt: (athlete.currentBelt || session.belt || null) as JWTPayload['belt'],
    name: athlete.firstName || session.name || '',
    parentPhone: athlete.phone || session.parentPhone || null,
  }
}
