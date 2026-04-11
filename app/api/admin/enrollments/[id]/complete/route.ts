import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase'
import { awardPoints } from '@/lib/points/pointsService'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth/options'

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { completionDate, issuerName } = body

    const { data, error } = await supabaseAdmin
      .from('enrollments')
      .update({
        status: 'completed',
        certificate_unlocked: true,
        completion_date: completionDate || new Date().toISOString().split('T')[0],
        issuer_name: issuerName || 'Chief Administrative Head',
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
    } catch (e) {
      console.error('Gamification hook for grading failed:', e)
    }

    return NextResponse.json({ success: true, enrollment: data })
  } catch (error: any) {
    console.error('[API PATCH] Failed to complete enrollment:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
