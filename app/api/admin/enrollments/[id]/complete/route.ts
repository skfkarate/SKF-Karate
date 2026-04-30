import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase'
import { awardPoints } from '@/lib/points/pointsService'
import { enrollmentCompleteSchema } from '@/src/server/api/validators/admin-certificates.validator'
import { logger } from '@/src/server/lib/logger'
import { withRoute } from '@/src/server/lib/route'

export const PATCH = withRoute(
  {
    auth: { type: 'admin', roles: ['admin'] },
    bodySchema: enrollmentCompleteSchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body, params, requestId }) => {
    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .update({
        status: 'completed',
        certificate_unlocked: true,
        completion_date: body.completionDate || new Date().toISOString().split('T')[0],
        issuer_name: body.issuerName || 'Chief Administrative Head',
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // GRADING_PASS Gamification Hook
    try {
      if (data?.skf_id) {
        await awardPoints(data.skf_id, 'GRADING_PASS', { enrollmentId: params.id })
      }
    } catch (error) {
      logger.error('admin.enrollment.complete_points_failed', { requestId, enrollmentId: params.id, error })
    }

    return NextResponse.json({ success: true, enrollment: data })
  }
)
