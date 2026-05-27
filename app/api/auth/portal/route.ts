import { createHash } from 'node:crypto'

import { extractClientIp } from '@/lib/server/site-analytics'
import { portalAuthSchema } from '@/src/server/api/validators/portal.validator'
import { RateLimitError } from '@/src/server/lib/errors'
import { applyRateLimit, applyRateLimitForKey } from '@/src/server/lib/rate-limit'
import { withRoute } from '@/src/server/lib/route'
import { PortalAuthService } from '@/src/server/services/portal-auth.service'

function rateLimitHash(value: string) {
  return createHash('sha256').update(value).digest('hex').slice(0, 16)
}

async function enforcePortalAuthRateLimits(request: Request, skfId: string) {
  const networkLimit = await applyRateLimit(request, 'portalAuthIp', 'portal-login')

  if (!networkLimit.allowed) {
    throw new RateLimitError(
      networkLimit.headers,
      'Too many login attempts from this network. Please wait briefly and try again.'
    )
  }

  const studentLimit = await applyRateLimitForKey(
    'portalAuthStudent',
    `student:${rateLimitHash(skfId.trim().toUpperCase())}`
  )

  if (!studentLimit.allowed) {
    throw new RateLimitError(
      studentLimit.headers,
      'Too many login attempts for this SKF ID. Please wait briefly and try again.'
    )
  }
}

export const POST = withRoute(
  {
    bodySchema: portalAuthSchema,
    maxBodyBytes: 1024,
  },
  async ({ request, body }) => {
    await enforcePortalAuthRateLimits(request, body.skfId)

    const result = await PortalAuthService.authenticate(body, {
      referrer: request.headers.get('referer'),
      userAgent: request.headers.get('user-agent'),
      ipAddress: extractClientIp(request.headers),
    })

    const response = Response.json({
      success: true,
      data: { authenticated: true },
      authenticated: true,
    })
    response.headers.set('Set-Cookie', result.cookie)
    return response
  }
)
