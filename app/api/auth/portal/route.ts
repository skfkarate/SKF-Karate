import { extractClientIp } from '@/lib/server/site-analytics'
import { portalAuthSchema } from '@/src/server/api/validators/portal.validator'
import { withRoute } from '@/src/server/lib/route'
import { PortalAuthService } from '@/src/server/services/portal-auth.service'

export const POST = withRoute(
  {
    bodySchema: portalAuthSchema,
    rateLimit: { tier: 'auth' },
  },
  async ({ request, body }) => {
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
