import { z } from 'zod'

import { SITE_ANALYTICS_EVENT_TYPES } from '@/lib/server/site-analytics'

export const analyticsTrackSchema = z.object({
  eventType: z.enum(SITE_ANALYTICS_EVENT_TYPES),
  path: z.string().trim().max(280).optional(),
  pageTitle: z.string().trim().max(200).optional(),
  referrer: z.string().trim().max(400).optional(),
  visitorId: z.string().trim().max(120).optional(),
  sessionId: z.string().trim().max(120).optional(),
  skfId: z.string().trim().max(80).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

export type AnalyticsTrackInput = z.infer<typeof analyticsTrackSchema>
