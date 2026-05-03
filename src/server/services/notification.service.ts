import { certificateReadyTemplate } from '@/lib/email/templates'
import { resend } from '@/lib/email/resend'
import { getAthleteBySkfIdLive } from '@/lib/server/repositories/athletes-live'
import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import { ExternalServiceError } from '@/src/server/lib/errors'
import { logger } from '@/src/server/lib/logger'

type EnrollmentProgram = {
  name?: string | null
}

type EnrollmentNotificationRow = {
  id: string
  skf_id: string
  programs: EnrollmentProgram | EnrollmentProgram[] | null
}

type SendCertificateReadyNotificationsInput = {
  enrollmentIds: string[]
  requestId: string
}

type SendCertificateReadyNotificationsResult = {
  sent: number
  failed: number
}

function resolveProgramName(programs: EnrollmentNotificationRow['programs']) {
  const program = Array.isArray(programs) ? programs[0] : programs
  return program?.name || 'Certificate Program'
}

function resolveStudentName(athlete: Awaited<ReturnType<typeof getAthleteBySkfIdLive>>) {
  return [athlete?.firstName, athlete?.lastName].filter(Boolean).join(' ').trim() || 'Athlete'
}

export class NotificationService {
  static async sendCertificateReadyNotifications({
    enrollmentIds,
    requestId,
  }: SendCertificateReadyNotificationsInput): Promise<SendCertificateReadyNotificationsResult> {
    if (!resend || !isSupabaseReady()) {
      throw new ExternalServiceError('Notification service unavailable')
    }

    const { data: enrollments, error } = await supabaseAdmin
      .from('enrollments')
      .select('id, skf_id, programs(name)')
      .in('id', enrollmentIds)

    if (error) throw error

    let sent = 0
    let failed = 0

    for (const enrollment of (enrollments || []) as EnrollmentNotificationRow[]) {
      const athlete = await getAthleteBySkfIdLive(enrollment.skf_id)
      const targetEmail = athlete?.email || ''

      if (!targetEmail) {
        logger.warn('notifications.certificate_ready.no_email', {
          requestId,
          enrollmentId: enrollment.id,
          skfId: enrollment.skf_id,
        })
        failed += 1
        continue
      }

      const { subject, html } = certificateReadyTemplate({
        parentName: athlete?.parentName || 'Parent',
        studentName: resolveStudentName(athlete),
        programName: resolveProgramName(enrollment.programs),
        skfId: enrollment.skf_id,
      })

      const { error: sendError } = await resend.emails.send({
        from: 'SKF Karate <notifications@skfkarate.com>',
        to: [targetEmail],
        subject,
        html,
      })

      if (sendError) {
        logger.error('notifications.certificate_ready.email_failed', {
          requestId,
          enrollmentId: enrollment.id,
          error: sendError,
        })
        failed += 1
        continue
      }

      const { error: updateError } = await supabaseAdmin
        .from('enrollments')
        .update({ notification_sent: true })
        .eq('id', enrollment.id)

      if (updateError) {
        logger.error('notifications.certificate_ready.mark_sent_failed', {
          requestId,
          enrollmentId: enrollment.id,
          error: updateError,
        })
        failed += 1
        continue
      }

      sent += 1
    }

    return { sent, failed }
  }
}
