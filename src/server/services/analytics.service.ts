import { recordSiteAnalyticsEvent } from '@/lib/server/site-analytics'
import type { AnalyticsTrackInput } from '@/src/server/api/validators/analytics.validator'

export class AnalyticsService {
  static async track(
    input: AnalyticsTrackInput,
    requestMeta: {
      userAgent: string | null
      ipAddress: string | null
    }
  ) {
    return recordSiteAnalyticsEvent({
      ...input,
      userAgent: requestMeta.userAgent,
      ipAddress: requestMeta.ipAddress,
    })
  }
}
