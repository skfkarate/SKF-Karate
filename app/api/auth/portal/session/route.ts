import { withRoute } from '@/src/server/lib/route'
import { logger } from '@/src/server/lib/logger'
import { isBBCandidate } from '@/lib/server/repositories/blackbelt-live'

export const GET = withRoute(
  {
    auth: { type: 'portal', roles: ['student'] },
    rateLimit: { tier: 'portalSession' },
    cacheControl: 'private, no-store',
  },
  async ({ portalSession }) => {
    const session = portalSession

    if (!session) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let isBlackBeltCandidate = false
    try {
      isBlackBeltCandidate = await isBBCandidate(session.skfId)
    } catch (error) {
      logger.error('session.black_belt_check_failed', { skfId: session.skfId, error })
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
