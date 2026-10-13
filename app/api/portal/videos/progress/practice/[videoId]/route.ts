import { ValidationError } from '@/src/server/lib/errors'
import { ok } from '@/src/server/lib/response'
import { withRoute } from '@/src/server/lib/route'
import { PortalVideoProgressService } from '@/src/server/services/portal-video-progress.service'

const VIDEO_ID_MAX_LENGTH = 120

export const POST = withRoute(
  {
    auth: { type: 'portal', roles: ['student'] },
    rateLimit: { tier: 'write' },
    cacheControl: 'private, no-store',
  },
  async ({ portalSession, params }) => {
    // Mirror the body validator's bound so an oversized/blank path segment can
    // never be persisted as a junk progress key.
    const videoId = String(params?.videoId || '').trim()
    if (!videoId || videoId.length > VIDEO_ID_MAX_LENGTH) {
      throw new ValidationError({ videoId: ['A valid video ID is required.'] })
    }
    const result = await PortalVideoProgressService.recordPracticed(portalSession!.skfId!, videoId)
    return ok(result)
  }
)