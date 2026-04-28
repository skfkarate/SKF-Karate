import { videoProgressSchema } from '@/src/server/api/validators/portal.validator'
import { ok } from '@/src/server/lib/response'
import { withRoute } from '@/src/server/lib/route'
import { PortalVideoProgressService } from '@/src/server/services/portal-video-progress.service'

export const POST = withRoute(
  {
    bodySchema: videoProgressSchema,
    auth: { type: 'portal', roles: ['student'] },
    rateLimit: { tier: 'write' },
  },
  async ({ portalSession, body }) => {
    const result = await PortalVideoProgressService.save(portalSession!.skfId!, body)
    return ok(result)
  }
)

export const GET = withRoute(
  {
    auth: { type: 'portal', roles: ['student'] },
    rateLimit: { tier: 'authed' },
  },
  async ({ portalSession }) => {
    const result = await PortalVideoProgressService.list(portalSession!.skfId!)
    return ok(result)
  }
)
