import { requireRole } from '@/lib/server/requireRole'
import { supabaseAdmin } from '@/lib/server/supabase'
import { awardPoints } from '@/lib/points/pointsService'

export async function POST(request: Request) {
  try {
    const jwt = await requireRole(['student'])
    const { videoId, watchedPercent } = await request.json()
    
    // Check previous record for gamification
    const { data: previousRecord } = await supabaseAdmin
      .from('video_progress')
      .select('completed')
      .eq('skf_id', jwt.skfId!)
      .eq('video_id', videoId)
      .single()

    // We already have a unique constraint on skf_id & video_id.
    const { error } = await supabaseAdmin.from('video_progress').upsert({
      skf_id: jwt.skfId!,
      video_id: videoId,
      watched_percent: watchedPercent,
      completed: watchedPercent >= 90,
      last_watched: new Date().toISOString()
    }, { onConflict: 'skf_id,video_id' })
    
    if (error) {
      console.error('Supabase video_progress upsert error:', error)
      return Response.json({ error: 'Failed to update progress' }, { status: 500 })
    }
    
    if (!previousRecord?.completed && watchedPercent >= 90) {
      try {
        await awardPoints(jwt.skfId!, 'WATCH_VIDEO', { videoId })
      } catch (e) {
        console.error('Gamification hook for video failed:', e)
      }
    }
    
    return Response.json({ success: true })
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') return Response.json({ error: 'Unauthorized' }, { status: 401 })
    console.error('Progress tracking error:', error)
    return Response.json({ error: 'Failed to record progress' }, { status: 500 })
  }
}
