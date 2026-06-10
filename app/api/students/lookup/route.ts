import { NextResponse } from 'next/server'

import { getPortalSession } from '@/lib/server/auth/portal'
import { getAthleteBySkfIdLive } from '@/lib/server/repositories/athletes-live'
import { skfIdQuerySchema } from '@/src/server/api/validators/public-lookup.validator'
import { AuthorizationError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  {
    querySchema: skfIdQuerySchema,
    rateLimit: { tier: 'lookup' },
  },
  async ({ request, query }) => {
  const portalSession = getPortalSession(request)

  if (!portalSession?.skfId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const skfId = query.skfId.trim().toUpperCase()

  if (portalSession.skfId.toUpperCase() !== skfId) {
    throw new AuthorizationError()
  }

  const athlete = await getAthleteBySkfIdLive(skfId)
  return NextResponse.json({ success: true, exists: Boolean(athlete) })
  }
)
