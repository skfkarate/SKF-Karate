import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import { pingCache } from '@/src/server/lib/cache'

async function checkDatabase() {
  if (!isSupabaseReady()) {
    return 'degraded'
  }

  try {
    const { error } = await supabaseAdmin.from('programs').select('id').limit(1)
    return error ? 'unhealthy' : 'healthy'
  } catch {
    return 'unhealthy'
  }
}

export class HealthService {
  static async check() {
    const [database, cache] = await Promise.all([checkDatabase(), pingCache()])
    const isHealthy = database === 'healthy'

    return {
      status: isHealthy ? 'ok' : 'degraded',
      code: isHealthy ? 200 : 503,
      body: {
        status: isHealthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '0.0.0',
        environment: process.env.VERCEL_ENV || process.env.NODE_ENV || 'unknown',
        deployment: {
          commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || null,
          id: process.env.VERCEL_DEPLOYMENT_ID || null,
          region: process.env.VERCEL_REGION || null,
        },
        checks: {
          database,
          cache,
          sentry: process.env.SENTRY_DSN ? 'configured' : 'not_configured',
        },
      },
    }
  }
}
