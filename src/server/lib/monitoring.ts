import * as Sentry from '@sentry/nextjs'

import { env } from '@/src/server/config/env'
import { logger } from '@/src/server/lib/logger'

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (env.SENTRY_DSN && env.NODE_ENV === 'production') {
    Sentry.captureException(error, { extra: context })
    return
  }

  logger.error('monitoring.capture_error', {
    error,
    context,
  })
}
