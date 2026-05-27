import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'

import { env } from '@/src/server/config/env'
import { logger } from '@/src/server/lib/logger'
import { withRoute } from '@/src/server/lib/route'

const vitalsSchema = z.object({
  id: z.string().min(1).max(160),
  name: z.enum(['CLS', 'FCP', 'FID', 'INP', 'LCP', 'TTFB']),
  value: z.number().finite(),
  delta: z.number().finite(),
  rating: z.enum(['good', 'needs-improvement', 'poor']).optional(),
  navigationType: z.string().max(80).optional(),
  path: z.string().max(300).optional(),
})

type SentryMetricsApi = typeof Sentry & {
  metrics?: {
    distribution?: (
      name: string,
      value: number,
      options?: {
        unit?: string
        attributes?: Record<string, string | number | boolean>
      }
    ) => void
  }
}

function metricUnit(name: z.infer<typeof vitalsSchema>['name']) {
  return name === 'CLS' ? 'none' : 'millisecond'
}

export const POST = withRoute(
  {
    bodySchema: vitalsSchema,
    rateLimit: { tier: 'vitals' },
    maxBodyBytes: 4096,
  },
  async ({ body, requestId }) => {
    logger.info('web_vital.recorded', {
      requestId,
      metric: body.name,
      value: body.value,
      delta: body.delta,
      rating: body.rating,
      navigationType: body.navigationType,
      path: body.path,
    })

    if (env.SENTRY_DSN && env.NODE_ENV === 'production') {
      const metricsApi = Sentry as SentryMetricsApi
      metricsApi.metrics?.distribution?.(`web_vitals.${body.name.toLowerCase()}`, body.value, {
        unit: metricUnit(body.name),
        attributes: {
          rating: body.rating || 'unknown',
          navigationType: body.navigationType || 'unknown',
          path: body.path || 'unknown',
        },
      })
    }

    return Response.json({ ok: true })
  }
)
