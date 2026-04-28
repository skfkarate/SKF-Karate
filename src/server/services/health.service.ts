import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import { pingCache } from '@/src/server/lib/cache'

async function checkDatabase() {
  if (!isSupabaseReady()) {
    return 'degraded'
  }

  try {
    await supabaseAdmin.from('programs').select('id').limit(1)
    return 'healthy'
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
        checks: {
          database,
          cache,
        },
      },
    }
  }
}
