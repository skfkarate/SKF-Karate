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
    await supabaseAdmin
      .from('certificate_events')
      .insert([{
        enrollment_id: enrollmentId,
        skf_id: skfId,
        event_type: eventType,
        ip_address: ip
      }])
      .then(() => {})
      .catch(() => {}) // Silent — events table may not exist

    // Also track in certificate_views for analytics dashboard
    if (eventType === 'viewed') {
      await supabaseAdmin
        .from('certificate_views')
        .insert([{
          skf_id: skfId,
          enrollment_id: enrollmentId,
          viewed_at: new Date().toISOString()
        }])
        .then(() => {})
        .catch(() => {}) // Silent — table may not exist yet
    } else if (eventType === 'downloaded_pdf' || eventType === 'downloaded_png') {
      // Update the most recent view record with download info
      const format = eventType === 'downloaded_pdf' ? 'pdf' : 'png'
      await supabaseAdmin
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
        .then(() => {})
        .catch(() => {}) // Silent
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Failed to log certificate event:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
