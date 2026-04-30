import { buildPortalCookieClear } from '@/lib/server/auth/portal'
import { withRoute } from '@/src/server/lib/route'

export const POST = withRoute(
  {
    rateLimit: { tier: 'public' },
    cacheControl: 'private, no-store',
  },
  async () => {
    const response = Response.json({ success: true })
    response.headers.set('Set-Cookie', buildPortalCookieClear())
    return response
  }
)
