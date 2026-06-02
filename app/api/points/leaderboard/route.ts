import { withRoute } from '@/src/server/lib/route'
import { getMonthlyPointsLeaderboard } from '@/src/server/services/portal-points.service'

export const GET = withRoute(
  {
    auth: { type: 'portal', roles: ['student'] },
    rateLimit: { tier: 'authed' },
    cacheControl: 'private, max-age=60',
  },
  async () => {
    return Response.json({ leaderboard: await getMonthlyPointsLeaderboard() })
  }
)
