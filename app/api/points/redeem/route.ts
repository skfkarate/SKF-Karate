import { redeemPoints } from '@/lib/points/pointsService'
import { redeemPointsBodySchema } from '@/src/server/api/validators/points.validator'
import { ConflictError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'

export const POST = withRoute(
  {
    auth: { type: 'portal', roles: ['student'] },
    bodySchema: redeemPointsBodySchema,
    rateLimit: { tier: 'write' },
    cacheControl: 'private, no-store',
  },
  async ({ portalSession, body }) => {
    const result = await redeemPoints(portalSession!.skfId!, body.points, body.reason, {
      orderId: body.orderId || null,
    })

    if ('error' in result) {
      throw new ConflictError(result.error)
    }

    return Response.json({ success: true, newBalance: result.newBalance })
  }
)
