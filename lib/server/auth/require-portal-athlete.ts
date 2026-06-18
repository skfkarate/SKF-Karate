import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { COOKIE_NAME, verifyJWT } from '@/lib/server/auth/portal'
import {
  buildCanonicalPortalSession,
  isEligiblePortalAthlete,
} from '@/lib/server/auth/portal-athlete'
import { resolveServerAthleteProfilePhoto } from '@/lib/server/profile-photos'
import { getAthleteBySkfIdLive } from '@/lib/server/repositories/athletes-live'

export const getPortalAthleteFromCookies = cache(async function getPortalAthleteFromCookies() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const session = token ? verifyJWT(token) : null

  if (!session?.skfId) {
    return null
  }

  const athlete = await getAthleteBySkfIdLive(session.skfId)
  if (!athlete || !isEligiblePortalAthlete(athlete)) {
    return null
  }

  return {
    session: buildCanonicalPortalSession(session, athlete),
    athlete: {
      ...athlete,
      photoUrl: resolveServerAthleteProfilePhoto(athlete),
    },
  }
})

export async function requirePortalAthlete(options: { redirectTo?: string } = {}) {
  const result = await getPortalAthleteFromCookies()
  if (!result) {
    redirect(options.redirectTo || '/portal/login')
  }
  return result
}
