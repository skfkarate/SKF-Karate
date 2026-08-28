import { getPortalSession } from '@/lib/server/auth/portal'
import { PortalAuthService } from '@/src/server/services/portal-auth.service'
import { extractClientIp } from '@/lib/server/site-analytics'
import { applyRateLimit } from '@/src/server/lib/rate-limit'
import { RateLimitError } from '@/src/server/lib/errors'
import { logger } from '@/src/server/lib/logger'

export async function POST(request: Request) {
  try {
    const rateLimitResult = await applyRateLimit(request, 'authed')
    if (!rateLimitResult.allowed) {
      throw new RateLimitError(rateLimitResult.headers)
    }

    const session = getPortalSession(request)
    if (!session || !session.skfId) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    let body: { targetSkfId?: unknown }
    try {
      body = await request.json()
    } catch {
      return Response.json({ success: false, error: 'Invalid JSON' }, { status: 400 })
    }

    if (!body.targetSkfId || typeof body.targetSkfId !== 'string') {
      return Response.json({ success: false, error: 'Missing targetSkfId' }, { status: 400 })
    }

    const result = await PortalAuthService.switchProfile(
      body.targetSkfId,
      session.skfId,
      session.parentPhone || null,
      {
        referrer: request.headers.get('referer'),
        userAgent: request.headers.get('user-agent'),
        ipAddress: extractClientIp(request.headers),
      }
    )

    const response = Response.json({
      success: true,
      data: { authenticated: true },
    })

    response.headers.set('Set-Cookie', result.cookie)
    return response
  } catch (error) {
    if (error instanceof RateLimitError) {
      return Response.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 })
    }
    logger.warn('portal_switch.unhandled_error', { error })
    return Response.json({ success: false, error: 'Failed to switch profile' }, { status: 500 })
  }
}
