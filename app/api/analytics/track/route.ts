import { NextResponse } from 'next/server'
import { z } from 'zod'

import {
  extractClientIp,
  recordSiteAnalyticsEvent,
  SITE_ANALYTICS_EVENT_TYPES,
} from '@/lib/server/site-analytics'

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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const payload = trackAnalyticsSchema.parse(body)

    const result = await recordSiteAnalyticsEvent({
      ...payload,
      userAgent: request.headers.get('user-agent'),
      ipAddress: extractClientIp(request.headers),
    })

    return NextResponse.json({ success: true, recorded: result.ok })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid analytics payload.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('[analytics/track] Unexpected error:', error)
    return NextResponse.json({ success: true, recorded: false })
  }
}
