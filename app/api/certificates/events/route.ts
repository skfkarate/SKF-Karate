import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase'
import { headers } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { enrollmentId, skfId, eventType } = await request.json()

    if (!enrollmentId || !skfId || !eventType) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || '127.0.0.1'

    // Log to certificate_events (existing table)
    const { error: certificateEventError } = await supabaseAdmin
      .from('certificate_events')
      .insert([{
        enrollment_id: enrollmentId,
        skf_id: skfId,
        event_type: eventType,
        ip_address: ip
      }])
    void certificateEventError

    // Also track in certificate_views for analytics dashboard
    if (eventType === 'viewed') {
      const { error: certificateViewError } = await supabaseAdmin
        .from('certificate_views')
        .insert([{
          skf_id: skfId,
          enrollment_id: enrollmentId,
          viewed_at: new Date().toISOString()
        }])
      void certificateViewError
    } else if (eventType === 'downloaded_pdf' || eventType === 'downloaded_png') {
      // Update the most recent view record with download info
      const format = eventType === 'downloaded_pdf' ? 'pdf' : 'png'
      const { error: certificateDownloadError } = await supabaseAdmin
        .from('certificate_views')
        .update({
          downloaded_at: new Date().toISOString(),
          download_format: format
        })
        .eq('skf_id', skfId)
        .eq('enrollment_id', enrollmentId)
        .is('downloaded_at', null)
        .order('viewed_at', { ascending: false })
        .limit(1)
      void certificateDownloadError
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Failed to log certificate event:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
