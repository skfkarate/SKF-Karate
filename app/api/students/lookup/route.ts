import { NextResponse } from 'next/server'

import { getAuthorizedApiSession } from '@/lib/server/auth/session'
import { getPortalSession } from '@/lib/server/auth/portal'
import { getAthleteBySkfIdLive } from '@/lib/server/repositories/athletes-live'
import { skfIdQuerySchema } from '@/src/server/api/validators/admin-general.validator'
import { AuthorizationError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  {
    querySchema: skfIdQuerySchema,
    rateLimit: { tier: 'lookup' },
  },
  async ({ request, query }) => {
  const adminSession = await getAuthorizedApiSession('admin')
  const portalSession = getPortalSession(request)

  if (!adminSession && !portalSession?.skfId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const skfId = query.skfId.trim().toUpperCase()

  if (!adminSession && portalSession?.skfId?.toUpperCase() !== skfId) {
    throw new AuthorizationError()
  }

  const athlete = await getAthleteBySkfIdLive(skfId)
  return NextResponse.json({ success: true, exists: Boolean(athlete) })
  }
)
