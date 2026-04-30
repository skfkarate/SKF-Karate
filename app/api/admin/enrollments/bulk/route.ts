import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase'
import { enrollmentBulkUpdateSchema } from '@/src/server/api/validators/admin-certificates.validator'
import { logger } from '@/src/server/lib/logger'
import { withRoute } from '@/src/server/lib/route'

type EnrollmentBulkPayload = {
  status?: 'completed' | 'revoked'
  certificate_unlocked?: boolean
  completion_date?: string
  updated_at?: string
}

export const POST = withRoute(
  {
    auth: { type: 'admin', roles: ['admin'] },
    bodySchema: enrollmentBulkUpdateSchema,
    rateLimit: { tier: 'write' },
  },
  async ({ body, requestId }) => {
    const { enrollmentIds, action } = body
    let payload: EnrollmentBulkPayload = {}
    if (action === 'complete') {
      payload = { status: 'completed', certificate_unlocked: true, completion_date: new Date().toISOString().split('T')[0] }
    } else if (action === 'unlock') {
      payload = { certificate_unlocked: true }
    } else if (action === 'revoke') {
      payload = { status: 'revoked', certificate_unlocked: false }
    }

    payload.updated_at = new Date().toISOString()

    // Process in batches of 20 to avoid PostgREST limits on massive OR statements
    const BATCH_SIZE = 20
    const results = []
    
    for (let i = 0; i < enrollmentIds.length; i += BATCH_SIZE) {
      const batchIds = enrollmentIds.slice(i, i + BATCH_SIZE)
      
      const { data, error } = await supabaseAdmin
        .from('enrollments')
        .update(payload)
        .in('id', batchIds)
        .select('id')

      if (error) {
        logger.error('admin.enrollments.bulk_batch_failed', { requestId, batchOffset: i, error })
        throw error
      }
      
      if (data) results.push(...data)
    }

    return NextResponse.json({ 
      success: true, 
      count: results.length
    })
  }
)
