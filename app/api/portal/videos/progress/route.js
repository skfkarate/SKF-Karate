import { NextResponse } from 'next/server'
import { supabase, isSupabaseReady } from '@/lib/server/supabase'
import { getPortalSession } from '@/lib/server/auth'

export async function POST(request) {
  try {
    // 1. Authenticate Student Session
    const session = getPortalSession(request)
    if (!session || !session.skfId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { videoId, progressPercent } = body

    if (!videoId || typeof progressPercent !== 'number') {
      return NextResponse.json({ error: 'Missing videoId or progressPercent' }, { status: 400 })
    }

    if (!isSupabaseReady()) {
      return NextResponse.json({ success: true, mock: true })
    }

    // 2. Upsert progress into Supabase
    const { error } = await supabase
      .from('video_progress')
      .upsert(
        {
          skf_id: session.skfId,
          video_id: videoId,
          progress_percent: progressPercent,
          last_watched_at: new Date().toISOString()
        },
        { onConflict: 'skf_id,video_id' }
      )

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Video progress save error:', error)
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const session = getPortalSession(request)
    if (!session || !session.skfId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isSupabaseReady()) {
      return NextResponse.json({ progressData: [] })
    }

    const { data, error } = await supabase
      .from('video_progress')
      .select('video_id, progress_percent, last_watched_at')
      .eq('skf_id', session.skfId)

    if (error) throw error

    return NextResponse.json({ progressData: data })
  } catch (error) {
    console.error('[API] Video progress fetch error:', error)
    return NextResponse.json({ error: 'Failed to select progress' }, { status: 500 })
  }
}
