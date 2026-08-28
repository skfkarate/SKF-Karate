import { getPortalSession } from '@/lib/server/auth/portal'
import { PortalAuthService } from '@/src/server/services/portal-auth.service'
import { applyRateLimit } from '@/src/server/lib/rate-limit'
import { RateLimitError } from '@/src/server/lib/errors'
import { logger } from '@/src/server/lib/logger'

export async function GET(request: Request) {
  try {
    const rateLimitResult = await applyRateLimit(request, 'authed')
    if (!rateLimitResult.allowed) {
      throw new RateLimitError(rateLimitResult.headers)
    }

    const session = getPortalSession(request)
    if (!session || !session.skfId) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const siblings = await PortalAuthService.getSiblings(session.skfId, session.parentPhone || null)

    return Response.json({
      success: true,
      data: siblings,
    })
  } catch (error) {
    logger.warn('portal_siblings.unhandled_error', { error })
    return Response.json({ success: false, error: 'Failed to fetch siblings' }, { status: 500 })
  }
}
