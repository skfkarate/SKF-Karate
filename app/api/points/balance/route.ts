import { withRoute } from '@/src/server/lib/route'
import { getPortalPointsBalance } from '@/src/server/services/portal-points.service'

export const GET = withRoute(
  {
    auth: { type: 'portal', roles: ['student'] },
    rateLimit: { tier: 'authed' },
    cacheControl: 'private, no-store',
  },
  async ({ portalSession }) => {
    return Response.json(await getPortalPointsBalance(portalSession!.skfId!))
  }
)
