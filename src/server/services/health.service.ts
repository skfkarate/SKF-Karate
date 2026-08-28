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

async function checkAdmissions() {
  if (!isSupabaseReady()) {
    return 'degraded'
  }

  try {
    const [settings, applications] = await Promise.all([
      supabaseAdmin.from('admission_branch_settings').select('branch_slug').limit(1),
      supabaseAdmin.from('admission_applications').select('id, parent_photo_drive_url').limit(1),
    ])

    return settings.error || applications.error ? 'unhealthy' : 'healthy'
  } catch {
    return 'unhealthy'
  }
}

async function checkAdmissionPhotoStorage() {
  if (!isSupabaseReady()) {
    return 'degraded'
  }

  try {
    const { data, error } = await supabaseAdmin.storage.getBucket('admission-photos')
    return error || data?.public ? 'unhealthy' : 'healthy'
  } catch {
    return 'unhealthy'
  }
}

export class HealthService {
  static async check() {
    const [database, cache, admissions, admissionPhotoStorage] = await Promise.all([
      checkDatabase(),
      pingCache(),
      checkAdmissions(),
      checkAdmissionPhotoStorage(),
    ])
    const isHealthy = database === 'healthy' && admissions === 'healthy' && admissionPhotoStorage === 'healthy'

    return {
      status: isHealthy ? 'ok' : 'degraded',
      code: isHealthy ? 200 : 503,
      body: {
        status: isHealthy ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        checks: {
          database,
          admissions,
          cache,
          admissionPhotoStorage,
        },
      },
    }
  }
}
