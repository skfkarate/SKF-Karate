import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import type { VideoProgressInput } from '@/src/server/api/validators/portal.validator'

export class PortalVideoProgressService {
  static async save(skfId: string, input: VideoProgressInput) {
    if (!isSupabaseReady()) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Database not configured for portal video progress.')
      }
      return { success: true, mock: true }
    }

    const { error } = await supabaseAdmin.from('video_progress').upsert(
      {
        skf_id: skfId,
        video_id: input.videoId,
        watched_percent: input.progressPercent,
        completed: input.progressPercent >= 100,
        last_watched: new Date().toISOString(),
      },
      { onConflict: 'skf_id,video_id' }
    )

    if (error) {
      throw error
    }

    return { success: true }
  }

  static async list(skfId: string) {
    if (!isSupabaseReady()) {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Database not configured for portal video progress.')
      }
      return { progressData: [] }
    }

    const { data, error } = await supabaseAdmin
      .from('video_progress')
      .select('video_id, watched_percent, completed, last_watched')
      .eq('skf_id', skfId)
      .order('last_watched', { ascending: false })

    if (error) {
      throw error
    }

    return {
      progressData: (data || []).map((entry) => ({
        videoId: entry.video_id,
        progressPercent: entry.watched_percent,
        completed: entry.completed,
        lastWatchedAt: entry.last_watched,
      })),
    }
  }
}
