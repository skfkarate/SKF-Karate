import { withRoute } from '@/src/server/lib/route'
import { getActiveBBProgram, getBBCandidateBySkfId } from '@/lib/server/repositories/blackbelt-live'

export const GET = withRoute(
  {
    auth: { type: 'portal', roles: ['student'] },
    rateLimit: { tier: 'authed' },
    cacheControl: 'private, no-store',
  },
  async ({ portalSession }) => {
    const session = portalSession!
    
    let isBlackBeltCandidate = false
    try {
      const activeProgram = await getActiveBBProgram()
      if (activeProgram && session.skfId) {
        const candidate = await getBBCandidateBySkfId(activeProgram.id, session.skfId)
        if (candidate) {
          isBlackBeltCandidate = true
        }
      }
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
