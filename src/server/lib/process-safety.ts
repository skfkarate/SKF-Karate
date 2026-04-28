import { env } from '@/src/server/config/env'
import { logger } from '@/src/server/lib/logger'

declare global {
  var __skfProcessSafetyRegistered: boolean | undefined
}

export function registerProcessSafetyHandlers() {
  if (env.NODE_ENV !== 'production') {
    return
  }

  if (globalThis.__skfProcessSafetyRegistered) {
    return
  }

  process.on('unhandledRejection', (reason) => {
    logger.error('process.unhandled_rejection', { reason })
  })

  process.on('uncaughtException', (error) => {
    logger.error('process.uncaught_exception', { error })
    process.exit(1)
  })

  globalThis.__skfProcessSafetyRegistered = true
}
