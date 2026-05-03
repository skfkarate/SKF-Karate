import { awardPoints } from '@/lib/points/pointsService'
import { getAthleteBySkfIdLive } from '@/lib/server/repositories/athletes-live'
import { awardPointsBodySchema } from '@/src/server/api/validators/points.validator'
import { NotFoundError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: ['admin'] },
    bodySchema: awardPointsBodySchema,
    rateLimit: { tier: 'write' },
    cacheControl: 'private, no-store',
  },
  async ({ body }) => {
    const athlete = await getAthleteBySkfIdLive(body.skfId.toUpperCase())
    if (!athlete || String(athlete.status || '').toLowerCase() !== 'active') {
      throw new NotFoundError('Athlete')
    }

    const { newBalance, pointsAwarded } = await awardPoints(
      athlete.skfId,
      body.reason,
      { manual: true, note: body.note || null }
    )

    return Response.json({ success: true, newBalance, pointsAwarded })
  }
)
