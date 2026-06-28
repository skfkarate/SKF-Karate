import { supabaseAdmin } from '@/lib/server/supabase'
import { disabledResponse, isCertificatesEnabled } from '@/lib/server/feature-flags'
import { AuthorizationError } from '@/src/server/lib/errors'
import { logger } from '@/src/server/lib/logger'
import { ok } from '@/src/server/lib/response'
import { withRoute } from '@/src/server/lib/route'
import { z } from 'zod'

const certificateEventSchema = z.object({
  enrollmentId: z.string().trim().min(1).max(120),
  skfId: z.string().trim().min(1).max(80),
  eventType: z.enum(['viewed', 'downloaded_pdf', 'downloaded_png']),
})

export const POST = withRoute(
  {
    auth: { type: 'portal', roles: ['student'] },
    bodySchema: certificateEventSchema,
    rateLimit: { tier: 'write' },
    cacheControl: 'private, no-store',
  },
  async ({ request, body, portalSession, requestId }) => {
    if (!isCertificatesEnabled()) {
      return disabledResponse('Certificates', 503)
    }

    const { enrollmentId, skfId, eventType } = body
    if (portalSession!.skfId!.toUpperCase() !== skfId.toUpperCase()) {
      throw new AuthorizationError()
    }

    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      '127.0.0.1'
    const now = new Date().toISOString()

    if (eventType === 'viewed') {
      const { error: certificateViewError } = await supabaseAdmin
        .from('certificate_views')
        .upsert({
          skf_id: skfId,
          enrollment_id: enrollmentId,
          viewed_at: now,
        }, { onConflict: 'skf_id,enrollment_id' })

      if (certificateViewError) {
        logger.error('cert.view.failed', {
          requestId,
          error: certificateViewError,
          enrollmentId,
          skfId,
        })
        throw certificateViewError
      }
    } else {
      const format = eventType === 'downloaded_pdf' ? 'pdf' : 'png'
      const { error: certificateEventError } = await supabaseAdmin
        .from('certificate_events')
        .insert([{
          enrollment_id: enrollmentId,
          skf_id: skfId,
          event_type: eventType,
          ip_address: ip,
        }])

      if (certificateEventError) {
        logger.error('cert.event.failed', {
          requestId,
          error: certificateEventError,
          enrollmentId,
          skfId,
          eventType,
        })
        throw certificateEventError
      }

      const { error: certificateDownloadError } = await supabaseAdmin
        .from('certificate_views')
        .upsert({
          skf_id: skfId,
          enrollment_id: enrollmentId,
          viewed_at: now,
          downloaded_at: now,
          download_format: format,
        }, { onConflict: 'skf_id,enrollment_id' })

      if (certificateDownloadError) {
        logger.error('cert.download.failed', {
          requestId,
          error: certificateDownloadError,
          enrollmentId,
          skfId,
          format,
        })
        throw certificateDownloadError
      }
    }

    return ok({ recorded: true })
  }
)
