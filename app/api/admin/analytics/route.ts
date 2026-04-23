import { NextResponse } from 'next/server'

import { getAuthorizedApiSession } from '@/lib/server/auth/session'
import { getWebsiteAnalyticsSummary } from '@/lib/server/site-analytics'
import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'

async function getCertificateAnalyticsSummary() {
  if (!isSupabaseReady()) {
    return {
      data: null,
      warning: 'Database not configured for certificate analytics.',
    }
  }

  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [
      totalUnlockedResponse,
      unlockedThisMonthResponse,
      totalEnrolledResponse,
      totalRevokedResponse,
      viewsThisMonthResponse,
      downloadsThisMonthResponse,
      programBreakdownResponse,
      beltDataResponse,
      recentViewsResponse,
      notificationsSentResponse,
      notificationsPendingResponse,
    ] = await Promise.all([
      supabaseAdmin
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('certificate_unlocked', true),
      supabaseAdmin
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('certificate_unlocked', true)
        .gte('updated_at', startOfMonth),
      supabaseAdmin
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'enrolled'),
      supabaseAdmin
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'revoked'),
      supabaseAdmin
        .from('certificate_views')
        .select('*', { count: 'exact', head: true })
        .gte('viewed_at', startOfMonth),
      supabaseAdmin
        .from('certificate_views')
        .select('*', { count: 'exact', head: true })
        .not('downloaded_at', 'is', null)
        .gte('viewed_at', startOfMonth),
      supabaseAdmin
        .from('enrollments')
        .select('program_id, status, programs(name, type)')
        .order('program_id'),
      supabaseAdmin
        .from('enrollments')
        .select('belt_level')
        .eq('status', 'completed')
        .not('belt_level', 'is', null),
      supabaseAdmin
        .from('certificate_views')
        .select('skf_id, enrollment_id, viewed_at, downloaded_at, download_format')
        .order('viewed_at', { ascending: false })
        .limit(10),
      supabaseAdmin
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('notification_sent', true),
      supabaseAdmin
        .from('enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('certificate_unlocked', true)
        .or('notification_sent.is.null,notification_sent.eq.false'),
    ])

    const responses = [
      totalUnlockedResponse,
      unlockedThisMonthResponse,
      totalEnrolledResponse,
      totalRevokedResponse,
      viewsThisMonthResponse,
      downloadsThisMonthResponse,
      programBreakdownResponse,
      beltDataResponse,
      recentViewsResponse,
      notificationsSentResponse,
      notificationsPendingResponse,
    ]

    const firstError = responses.find((response) => response.error)?.error
    if (firstError) {
      throw firstError
    }

    const programMap: Record<
      string,
      {
        name: string
        type: string
        enrolled: number
        completed: number
        revoked: number
      }
    > = {}

    for (const enrollment of programBreakdownResponse.data || []) {
      const programId = enrollment.program_id
      if (!programId) continue

      if (!programMap[programId]) {
        programMap[programId] = {
          name: (enrollment.programs as any)?.name || 'Unknown',
          type: (enrollment.programs as any)?.type || 'training',
          enrolled: 0,
          completed: 0,
          revoked: 0,
        }
      }

      if (enrollment.status === 'enrolled') programMap[programId].enrolled += 1
      if (enrollment.status === 'completed') programMap[programId].completed += 1
      if (enrollment.status === 'revoked') programMap[programId].revoked += 1
    }

    const beltDistribution: Record<string, number> = {}
    for (const entry of beltDataResponse.data || []) {
      const belt = entry.belt_level || 'unknown'
      beltDistribution[belt] = (beltDistribution[belt] || 0) + 1
    }

    return {
      data: {
        overview: {
          totalUnlocked: totalUnlockedResponse.count || 0,
          unlockedThisMonth: unlockedThisMonthResponse.count || 0,
          totalEnrolled: totalEnrolledResponse.count || 0,
          totalRevoked: totalRevokedResponse.count || 0,
          viewsThisMonth: viewsThisMonthResponse.count || 0,
          downloadsThisMonth: downloadsThisMonthResponse.count || 0,
          notificationsSent: notificationsSentResponse.count || 0,
          notificationsPending: notificationsPendingResponse.count || 0,
        },
        programBreakdown: Object.entries(programMap).map(([id, data]) => ({
          id,
          ...data,
        })),
        beltDistribution,
        recentActivity: recentViewsResponse.data || [],
      },
    }
  } catch (error) {
    console.error('[admin/analytics] Failed to load certificate analytics:', error)
    return {
      data: null,
      warning: 'Certificate analytics could not be loaded.',
    }
  }
}

export async function GET() {
  try {
    const session = await getAuthorizedApiSession(['admin', 'instructor'])
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [website, certificates] = await Promise.all([
      getWebsiteAnalyticsSummary(),
      getCertificateAnalyticsSummary(),
    ])

    return NextResponse.json({
      analytics: {
        website: website.data,
        certificates: certificates.data,
      },
      warnings: [website.warning, certificates.warning].filter(Boolean),
    })
  } catch (error) {
    console.error('[admin/analytics] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
