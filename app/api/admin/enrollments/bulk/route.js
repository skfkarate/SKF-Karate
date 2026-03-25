import { NextResponse } from 'next/server'
import { supabase, isSupabaseReady } from '@/lib/server/supabase'
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

    if (!isSupabaseReady()) {
      console.warn('[API] Supabase not configured. Mocking bulk completion success.')
      return NextResponse.json({ 
        success: true, 
        message: `Mocked success for ${enrollmentIds.length} enrollments`,
        notified: false 
      })
    }

    // 2. Update Supabase
    const { data, error } = await supabase
      .from('enrollments')
      .update({
        status: 'completed',
        certificate_unlocked: true,
        completion_date: new Date().toISOString().split('T')[0]
      })
      .in('id', enrollmentIds)
      .select()

    if (error) throw error

    return NextResponse.json({ 
      success: true, 
      count: data.length,
      updated: data
    })
  } catch (error) {
    console.error('[API] Bulk enrollment update error:', error)
    return NextResponse.json({ error: 'Failed to update enrollments' }, { status: 500 })
  }
}
