import { NextResponse } from 'next/server'
import { resend, isEmailConfigured } from '@/lib/email/resend'
import { certificateReadyTemplate } from '@/lib/email/templates'
import { supabase, isSupabaseReady } from '@/lib/server/supabase'
import { getStudentBySkfId } from '@/lib/server/sheets'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth/options'

export async function POST(request) {
  try {
    // 1. Authenticate Admin
    const session = await getServerSession(authOptions)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { enrollmentIds } = body

    if (!enrollmentIds || !Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
      return NextResponse.json({ error: 'No enrollment IDs provided' }, { status: 400 })
    }

    if (!isEmailConfigured() || !isSupabaseReady()) {
      console.warn('[API] Resend or Supabase not configured. Mocking email dispatch success.')
      return NextResponse.json({ 
        success: true, 
        message: `Mocked email delivery to ${enrollmentIds.length} students` 
      })
    }

    // 2. Fetch enrollment and program details from Supabase
    const { data: enrollments, error } = await supabase
      .from('enrollments')
      .select(`
        id,
        skf_id,
        program_id,
        programs ( name )
      `)
      .in('id', enrollmentIds)

    if (error) throw error

    let emailsSent = 0
    let emailsFailed = 0

    // 3. Process each enrollment
    for (const enrollment of enrollments) {
      // Get student email from Google Sheets
      const student = await getStudentBySkfId(enrollment.skf_id)
      const targetEmail = student?.Email || student?.email
      
      if (!targetEmail) {
        emailsFailed++
        continue
      }

      // Generate the HTML template
      const programName = enrollment.programs?.name || 'Certificate Program'
      const studentName = student["First Name"] || student.firstName || 'Student'
      
      const { subject, html } = certificateReadyTemplate({
        studentName,
        programName,
        skfId: enrollment.skf_id,
        portalUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://skfkarate.com'}/portal/certificates`
      })

      // Dispatch via Resend
      const { data, error: sendError } = await resend.emails.send({
        from: 'SKF Karate <notifications@skfkarate.com>',
        to: [targetEmail],
        subject,
        html,
      })

      if (sendError) {
        console.error(`[API] Failed to email ${targetEmail}:`, sendError)
        emailsFailed++
      } else {
        emailsSent++
      }

      // Mark notification_sent as true in Supabase (don't await out of loop, unblocking speed)
      supabase.from('enrollments')
        .update({ notification_sent: true })
        .eq('id', enrollment.id)
        .then()
    }

    return NextResponse.json({ 
      success: true, 
      sent: emailsSent,
      failed: emailsFailed
    })

  } catch (error) {
    console.error('[API] Email dispatch error:', error)
    return NextResponse.json({ error: 'Failed to dispatch emails' }, { status: 500 })
  }
}
