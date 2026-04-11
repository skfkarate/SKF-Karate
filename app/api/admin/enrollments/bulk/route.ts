import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth/options'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions as any)
    if (!session || (session as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { enrollmentIds, action } = await request.json()

    if (!enrollmentIds || !Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
      return NextResponse.json({ error: 'No enrollment IDs provided' }, { status: 400 })
    }

    if (!['complete', 'unlock', 'revoke'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 })
    }

    let payload: any = {}
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
        console.error(`Batch ${i} failed:`, error)
        throw error
      }
      
      if (data) results.push(...data)
    }

    return NextResponse.json({ 
      success: true, 
      count: results.length
    })
  } catch (error) {
    console.error('[API] Bulk enrollment update error:', error)
    return NextResponse.json({ error: 'Failed to complete bulk update' }, { status: 500 })
  }
}
