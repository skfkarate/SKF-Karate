import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }

  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
    const { registerProcessSafetyHandlers } = await import('@/src/server/lib/process-safety')
    registerProcessSafetyHandlers()
  }
}

export const onRequestError = Sentry.captureRequestError
