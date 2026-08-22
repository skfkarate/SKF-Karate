import { getAthleteBySkfIdLive } from '@/lib/server/repositories/athletes-live'
import { getPracticeLibraryForAthlete } from '@/lib/server/repositories/portal-content-live'
import { NotFoundError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'
import { PortalVideoProgressService } from '@/src/server/services/portal-video-progress.service'

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

    // Keep the athlete landing experience to one authenticated request. The
    // library and history queries are independent once the athlete is known.
    const [library, progress] = await Promise.all([
      getPracticeLibraryForAthlete({
        branchName: athlete.branchName || portalSession!.branch || '',
        batch: athlete.batch || portalSession!.batch || '',
        belt: athlete.currentBelt || portalSession!.belt || '',
      }),
      PortalVideoProgressService.list(portalSession!.skfId!),
    ])

    return Response.json({
      ...library,
      audience: {
        belt: athlete.currentBelt || portalSession!.belt || '',
      },
      progressData: progress.progressData,
      recentlyAddedCutoff: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
  }
)
