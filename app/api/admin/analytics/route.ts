import { NextResponse } from 'next/server'
import { supabaseAdmin, isSupabaseReady } from '@/lib/server/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth/options'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!isSupabaseReady()) {
      return NextResponse.json({ analytics: null, warning: 'Database not configured' })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    // Total certificates unlocked (all time)
    const { count: totalUnlocked } = await supabaseAdmin
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('certificate_unlocked', true)

    // Certificates unlocked this month
    const { count: unlockedThisMonth } = await supabaseAdmin
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('certificate_unlocked', true)
      .gte('updated_at', startOfMonth)

    // Total enrolled (pending)
    const { count: totalEnrolled } = await supabaseAdmin
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'enrolled')

    // Total revoked
    const { count: totalRevoked } = await supabaseAdmin
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'revoked')

    // Certificate views this month
    const { count: viewsThisMonth } = await supabaseAdmin
      .from('certificate_views')
      .select('*', { count: 'exact', head: true })
      .gte('viewed_at', startOfMonth)

    // Downloads this month
    const { count: downloadsThisMonth } = await supabaseAdmin
      .from('certificate_views')
      .select('*', { count: 'exact', head: true })
      .not('downloaded_at', 'is', null)
      .gte('viewed_at', startOfMonth)

    // Per-program breakdown
    const { data: programBreakdown } = await supabaseAdmin
      .from('enrollments')
      .select('program_id, status, programs(name, type)')
      .order('program_id')

    // Aggregate program stats
    const programMap: Record<string, { name: string; type: string; enrolled: number; completed: number; revoked: number }> = {}
    if (programBreakdown) {
      for (const e of programBreakdown) {
        const pid = e.program_id
        if (!programMap[pid]) {
          programMap[pid] = {
            name: (e.programs as any)?.name || 'Unknown',
            type: (e.programs as any)?.type || 'training',
            enrolled: 0,
            completed: 0,
            revoked: 0
          }
        }
        if (e.status === 'enrolled') programMap[pid].enrolled++
        else if (e.status === 'completed') programMap[pid].completed++
        else if (e.status === 'revoked') programMap[pid].revoked++
      }
    }

    // Belt distribution from completed belt_exam enrollments
    const { data: beltData } = await supabaseAdmin
      .from('enrollments')
      .select('belt_level')
      .eq('status', 'completed')
      .not('belt_level', 'is', null)

    const beltDistribution: Record<string, number> = {}
    if (beltData) {
      for (const e of beltData) {
        const b = e.belt_level || 'unknown'
        beltDistribution[b] = (beltDistribution[b] || 0) + 1
      }
    }

    // Recent activity — last 10 certificate views
    const { data: recentViews } = await supabaseAdmin
      .from('certificate_views')
      .select('skf_id, enrollment_id, viewed_at, downloaded_at, download_format')
      .order('viewed_at', { ascending: false })
      .limit(10)

    // Notification stats  
    const { count: notificationsSent } = await supabaseAdmin
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('notification_sent', true)

    const { count: notificationsPending } = await supabaseAdmin
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('certificate_unlocked', true)
      .or('notification_sent.is.null,notification_sent.eq.false')

    return NextResponse.json({
      analytics: {
        overview: {
          totalUnlocked: totalUnlocked || 0,
          unlockedThisMonth: unlockedThisMonth || 0,
          totalEnrolled: totalEnrolled || 0,
          totalRevoked: totalRevoked || 0,
          viewsThisMonth: viewsThisMonth || 0,
          downloadsThisMonth: downloadsThisMonth || 0,
          notificationsSent: notificationsSent || 0,
          notificationsPending: notificationsPending || 0
        },
        programBreakdown: Object.entries(programMap).map(([id, data]) => ({ id, ...data })),
        beltDistribution,
        recentActivity: recentViews || []
      }
    })
  } catch (error) {
    console.error('[API] Analytics fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
