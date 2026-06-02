import { pointHistoryQuerySchema } from '@/src/server/api/validators/points.validator'
import { withRoute } from '@/src/server/lib/route'
import { getPortalPointsHistory } from '@/src/server/services/portal-points.service'

export const GET = withRoute(
  {
    auth: { type: 'portal', roles: ['student'] },
    querySchema: pointHistoryQuerySchema,
    rateLimit: { tier: 'authed' },
    cacheControl: 'private, no-store',
  },
  async ({ portalSession, query }) => {
    return Response.json(await getPortalPointsHistory(
      portalSession!.skfId!,
      query.page,
      query.limit
    ))
  }
)
