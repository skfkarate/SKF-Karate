import { withRoute } from '@/src/server/lib/route'

export const GET = withRoute(
  {
    auth: { type: 'portal', roles: ['student'] },
    rateLimit: { tier: 'authed' },
    cacheControl: 'private, no-store',
  },
  async ({ portalSession }) => {
    const session = portalSession!
    return Response.json({
      skfId: session.skfId,
      name: session.name || null,
      branch: session.branch || null,
      belt: session.belt || null,
      role: session.role || 'student',
    })
  }
)
