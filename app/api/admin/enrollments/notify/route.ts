import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase'
import { getStudentBySkfId } from '@/lib/server/sheets'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth/options'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions as any)
    if (!session || (session as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!resend) {
      return NextResponse.json({ error: 'Resend API key missing in environment' }, { status: 500 })
    }

    const { enrollmentIds } = await request.json()
    if (!enrollmentIds || !Array.isArray(enrollmentIds)) {
      return NextResponse.json({ error: 'Missing enrollment ids array' }, { status: 400 })
    }

    // Fetch enrollments with program names
    const { data: enrollments, error } = await supabaseAdmin
      .from('enrollments')
      .select('id, skf_id, programs(name)')
      .in('id', enrollmentIds)

    if (error || !enrollments) throw error

    let emailsSent = 0

    // Loop through enrollments sequentially or in small parallel batches protecting the rate limit
    for (const enrollment of enrollments) {
      try {
        const studentInfo = await getStudentBySkfId(enrollment.skf_id)
        if (!studentInfo || !studentInfo.Email) {
          console.warn(`No email found for SKF ID: ${enrollment.skf_id}`)
          continue
        }

        const programName = enrollment.programs?.name || 'Program'
        const emailContact = studentInfo.Email

        await resend.emails.send({
          from: 'SKF Karate <certificates@updates.skfkarate.com>',
          to: emailContact,
          subject: `${programName} - SKF Certificate Available`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #d62828;">Digital Certificate Unlocked!</h2>
              <p>Hello,</p>
              <p>Congratulations! Your digital certificate for <strong>${programName}</strong> is now available.</p>
              <p>You can instantly view, download (PDF/PNG), or share it seamlessly from your Student Portal.</p>
              
              <div style="padding: 20px; background: #f8f9fa; border-radius: 4px; margin: 20px 0;">
                <p style="margin:0 0 10px 0;"><strong>Access Instructions:</strong></p>
                <ol style="margin:0; padding-left: 20px;">
                  <li>Log into <a href="https://skfkarate.com/portal">skfkarate.com/portal</a></li>
                  <li>Click on the Certificates tab</li>
                  <li>Download or Save your verified seal!</li>
                </ol>
              </div>

              <p>Best Regards,</p>
              <p><strong>SKF Karate Administration</strong></p>
            </div>
          `
        })

        // Mark as sent
        await supabaseAdmin
          .from('enrollments')
          .update({ notification_sent: true })
          .eq('id', enrollment.id)

        emailsSent++
      } catch (err) {
        console.error(`Failed sending to ${enrollment.skf_id}`, err)
      }
    }

    return NextResponse.json({ success: true, count: emailsSent })

  } catch (error) {
    console.error('[API] Bulk notify error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
