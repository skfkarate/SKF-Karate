import { getAthleteBySkfIdLive } from '@/lib/server/repositories/athletes-live'
import { getProtectedPortalVideosForAthlete } from '@/lib/server/repositories/portal-content-live'
import { NotFoundError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  {
    auth: { type: 'portal', roles: ['student'] },
    rateLimit: { tier: 'authed' },
    cacheControl: 'private, no-store',
  },
  async ({ portalSession }) => {
    const athlete = await getAthleteBySkfIdLive(portalSession!.skfId!)
    if (!athlete) {
      throw new NotFoundError('Athlete')
    }

    const videos = await getProtectedPortalVideosForAthlete({
      branchName: athlete.branchName || portalSession!.branch || '',
      batch: athlete.batch || portalSession!.batch || '',
      belt: athlete.currentBelt || portalSession!.belt || '',
    })

    return Response.json({ videos })
  }
)
