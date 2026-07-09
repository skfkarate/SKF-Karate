import { NextResponse } from 'next/server'
import { z } from 'zod'

import {
  extractClientIp,
  recordSiteAnalyticsEvent,
  SITE_ANALYTICS_EVENT_TYPES,
} from '@/lib/server/site-analytics'
import { getPortalSession } from '@/lib/server/auth/portal'
import { logger } from '@/src/server/lib/logger'
import { withRoute } from '@/src/server/lib/route'

const trackAnalyticsSchema = z.object({
  eventType: z.enum(SITE_ANALYTICS_EVENT_TYPES),
  path: z.string().max(280).optional(),
  pageTitle: z.string().max(200).optional(),
  referrer: z.string().max(400).optional(),
  visitorId: z.string().max(120).optional(),
  sessionId: z.string().max(120).optional(),
  skfId: z.string().max(80).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export const POST = withRoute(
  {
    bodySchema: trackAnalyticsSchema,
    rateLimit: { tier: 'public' },
  },
  async ({ request, body: payload, requestId }) => {
  try {
    let skfId = payload.skfId

    if (!skfId) {
      const session = getPortalSession(request)
      if (session?.skfId) {
        skfId = session.skfId
      }
    }

    const result = await recordSiteAnalyticsEvent({
      ...payload,
      skfId: skfId || undefined,
      userAgent: request.headers.get('user-agent'),
      ipAddress: extractClientIp(request.headers),
    })

    return NextResponse.json({ success: true, recorded: result.ok })
  } catch (error) {
    logger.error('analytics.track.failed', { requestId, error })
    return NextResponse.json({ success: true, recorded: false })
  }
  }
)
