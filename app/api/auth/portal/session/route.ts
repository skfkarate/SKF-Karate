import { withRoute } from '@/src/server/lib/route'
import { isActiveBBCandidate } from '@/lib/server/repositories/blackbelt-live'

export const GET = withRoute(
  {
    auth: { type: 'portal', roles: ['student'] },
    rateLimit: { tier: 'portalSession' },
    cacheControl: 'private, no-store',
  },
  async ({ portalSession }) => {
    const session = portalSession!
    
    let isBlackBeltCandidate = false
    try {
      isBlackBeltCandidate = await isActiveBBCandidate(session.skfId)
    } catch {
      // Ignore error
    }

    return Response.json({
      skfId: session.skfId,
      name: session.name || null,
      branch: session.branch || null,
      belt: session.belt || null,
      role: session.role || 'student',
      isBlackBeltCandidate,
    })
  }
)
