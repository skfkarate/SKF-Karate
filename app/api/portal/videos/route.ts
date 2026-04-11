import { requireRole } from '@/lib/server/requireRole'
import { getVideosByBranchAndBatch } from '@/lib/server/sheets'
import { supabaseAdmin } from '@/lib/server/supabase'

export async function GET() {
  try {
    const jwt = await requireRole(['student'])
    const videos = await getVideosByBranchAndBatch(jwt.branch!, jwt.batch!)
    
    // Get progress from Supabase
    const { data: progress, error } = await supabaseAdmin
      .from('video_progress')
      .select('video_id, watched_percent, completed')
      .eq('skf_id', jwt.skfId!)
    
    if (error) {
      console.error('Video progress fetch error:', error)
    }

    // Merge progress into video list
    const videosWithProgress = videos.map(v => ({
      ...v,
      progressPercent: progress?.find(p => p.video_id === v.videoId)?.watched_percent ?? 0,
      completed: progress?.find(p => p.video_id === v.videoId)?.completed ?? false
    }))
    
    // NEVER return YouTube_URL - already stripped by sheets.ts
    return Response.json({ videos: videosWithProgress })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return Response.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('GET /api/portal/videos error:', error)
    return Response.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}
