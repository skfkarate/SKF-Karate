import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'

export const SITE_ANALYTICS_EVENT_TYPES = [
  'page_view',
  'lead_submit_success',
  'lead_submit_failed',
  'portal_login_success',
  'portal_login_failed',
] as const

export type SiteAnalyticsEventType =
  (typeof SITE_ANALYTICS_EVENT_TYPES)[number]

export type SiteAnalyticsEventInput = {
  eventType: SiteAnalyticsEventType
  path?: string | null
  pageTitle?: string | null
  referrer?: string | null
  visitorId?: string | null
  sessionId?: string | null
  skfId?: string | null
  metadata?: Record<string, unknown> | null
  userAgent?: string | null
  ipAddress?: string | null
}

type GroupedCount = {
  path: string
  views: number
}

type DailyTrafficPoint = {
  date: string
  views: number
}

type WebsiteAnalyticsSummary = {
  overview: {
    totalVisits: number
    visitsToday: number
    totalPageViews: number
    publicPageViews: number
    portalPageViews: number
    leadSubmissions: number
    leadFailures: number
    portalLogins: number
    portalLoginFailures: number
  }
  topPages: GroupedCount[]
  topLandingPages: GroupedCount[]
  dailyTraffic: DailyTrafficPoint[]
  recentOperationalEvents: Array<{
    id: string
    eventType: string
    path: string
    createdAt: string
    metadata: Record<string, unknown>
    skfId: string | null
  }>
  timeWindowLabel: string
}

function isMissingTableError(error: any) {
  return (
    error?.code === 'PGRST205' ||
    String(error?.message || '').toLowerCase().includes('site_analytics_events')
  )
}

function sanitizeText(value: unknown, maxLength = 240) {
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  if (!normalized) return null
  return normalized.slice(0, maxLength)
}

function sanitizePath(value: unknown) {
  const normalized = sanitizeText(value, 280)
  if (!normalized) return null

  if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
    try {
      return new URL(normalized).pathname || '/'
    } catch {
      return null
    }
  }

  return normalized.startsWith('/') ? normalized : `/${normalized.replace(/^\/+/, '')}`
}

function sanitizeMetadata(metadata?: Record<string, unknown> | null) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {}
  }

  try {
    return JSON.parse(JSON.stringify(metadata))
  } catch {
    return {}
  }
}

function buildGroupedCounts(rows: Array<{ path?: string | null }>, limit = 5) {
  const counts = new Map<string, number>()

  for (const row of rows) {
    const path = sanitizePath(row.path) || '/'
    counts.set(path, (counts.get(path) || 0) + 1)
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([path, views]) => ({ path, views }))
}

function buildDailyTraffic(rows: Array<{ created_at?: string | null }>, days = 14) {
  const now = new Date()
  const labels = Array.from({ length: days }, (_, index) => {
    const date = new Date(now)
    date.setDate(now.getDate() - (days - index - 1))
    return date.toISOString().slice(0, 10)
  })

  const counts = new Map<string, number>(labels.map((label) => [label, 0]))

  for (const row of rows) {
    const label = String(row.created_at || '').slice(0, 10)
    if (!counts.has(label)) continue
    counts.set(label, (counts.get(label) || 0) + 1)
  }

  return labels.map((date) => ({
    date,
    views: counts.get(date) || 0,
  }))
}

export function extractClientIp(headers: Headers) {
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || null
  }

  return headers.get('x-real-ip') || null
}

export async function recordSiteAnalyticsEvent(input: SiteAnalyticsEventInput) {
  if (!isSupabaseReady()) {
    return { ok: false, reason: 'database-not-configured' as const }
  }

  const path = sanitizePath(input.path)
  if (path?.startsWith('/admin')) {
    return { ok: false, reason: 'admin-route-ignored' as const }
  }

  const payload = {
    event_type: input.eventType,
    path,
    page_title: sanitizeText(input.pageTitle, 200),
    referrer: sanitizeText(input.referrer, 400),
    visitor_id: sanitizeText(input.visitorId, 120),
    session_id: sanitizeText(input.sessionId, 120),
    skf_id: sanitizeText(input.skfId, 80),
    metadata: sanitizeMetadata(input.metadata),
    user_agent: sanitizeText(input.userAgent, 1000),
    ip_address: sanitizeText(input.ipAddress, 120),
  }

  const { error } = await supabaseAdmin.from('site_analytics_events').insert(payload)

  if (error) {
    if (isMissingTableError(error)) {
      console.warn(
        '[site-analytics] Missing "site_analytics_events" table. Apply database/schema.sql to enable admin website analytics.'
      )
      return { ok: false, reason: 'missing-table' as const }
    }

    console.error('[site-analytics] Failed to record analytics event:', error)
    return { ok: false, reason: 'insert-failed' as const }
  }

  return { ok: true as const }
}

export async function getWebsiteAnalyticsSummary(): Promise<{
  data: WebsiteAnalyticsSummary | null
  warning?: string
}> {
  if (!isSupabaseReady()) {
    return {
      data: null,
      warning: 'Database not configured for website analytics.',
    }
  }

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const ninetyDaysAgo = new Date(now)
  ninetyDaysAgo.setDate(now.getDate() - 89)
  const ninetyDaysAgoIso = ninetyDaysAgo.toISOString()

  try {
    const [
      totalVisitsResponse,
      visitsTodayResponse,
      totalPageViewsResponse,
      portalPageViewsResponse,
      leadSubmissionsResponse,
      leadFailuresResponse,
      portalLoginsResponse,
      portalLoginFailuresResponse,
      topPagesResponse,
      topLandingPagesResponse,
      dailyTrafficResponse,
      recentOperationalEventsResponse,
    ] = await Promise.all([
      supabaseAdmin
        .from('site_analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view')
        .contains('metadata', { landing: true }),
      supabaseAdmin
        .from('site_analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view')
        .contains('metadata', { landing: true })
        .gte('created_at', startOfDay),
      supabaseAdmin
        .from('site_analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view'),
      supabaseAdmin
        .from('site_analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view')
        .like('path', '/portal%'),
      supabaseAdmin
        .from('site_analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'lead_submit_success'),
      supabaseAdmin
        .from('site_analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'lead_submit_failed'),
      supabaseAdmin
        .from('site_analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'portal_login_success'),
      supabaseAdmin
        .from('site_analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'portal_login_failed'),
      supabaseAdmin
        .from('site_analytics_events')
        .select('path')
        .eq('event_type', 'page_view')
        .gte('created_at', ninetyDaysAgoIso)
        .limit(3000),
      supabaseAdmin
        .from('site_analytics_events')
        .select('path')
        .eq('event_type', 'page_view')
        .contains('metadata', { landing: true })
        .gte('created_at', ninetyDaysAgoIso)
        .limit(3000),
      supabaseAdmin
        .from('site_analytics_events')
        .select('created_at')
        .eq('event_type', 'page_view')
        .gte('created_at', ninetyDaysAgoIso)
        .limit(3000),
      supabaseAdmin
        .from('site_analytics_events')
        .select('id, event_type, path, created_at, metadata, skf_id')
        .neq('event_type', 'page_view')
        .order('created_at', { ascending: false })
        .limit(12),
    ])

    const errors = [
      totalVisitsResponse.error,
      visitsTodayResponse.error,
      totalPageViewsResponse.error,
      portalPageViewsResponse.error,
      leadSubmissionsResponse.error,
      leadFailuresResponse.error,
      portalLoginsResponse.error,
      portalLoginFailuresResponse.error,
      topPagesResponse.error,
      topLandingPagesResponse.error,
      dailyTrafficResponse.error,
      recentOperationalEventsResponse.error,
    ].filter(Boolean)

    if (errors.length > 0) {
      const firstError = errors[0]
      if (isMissingTableError(firstError)) {
        return {
          data: null,
          warning: 'The "site_analytics_events" table is missing. Apply database/schema.sql to enable website analytics.',
        }
      }

      throw firstError
    }

    const totalPageViews = totalPageViewsResponse.count || 0
    const portalPageViews = portalPageViewsResponse.count || 0

    return {
      data: {
        overview: {
          totalVisits: totalVisitsResponse.count || 0,
          visitsToday: visitsTodayResponse.count || 0,
          totalPageViews,
          publicPageViews: Math.max(totalPageViews - portalPageViews, 0),
          portalPageViews,
          leadSubmissions: leadSubmissionsResponse.count || 0,
          leadFailures: leadFailuresResponse.count || 0,
          portalLogins: portalLoginsResponse.count || 0,
          portalLoginFailures: portalLoginFailuresResponse.count || 0,
        },
        topPages: buildGroupedCounts(topPagesResponse.data || []),
        topLandingPages: buildGroupedCounts(topLandingPagesResponse.data || []),
        dailyTraffic: buildDailyTraffic(dailyTrafficResponse.data || []),
        recentOperationalEvents: (recentOperationalEventsResponse.data || []).map((entry: any) => ({
          id: entry.id,
          eventType: entry.event_type,
          path: sanitizePath(entry.path) || '/',
          createdAt: entry.created_at,
          metadata:
            entry.metadata && typeof entry.metadata === 'object' && !Array.isArray(entry.metadata)
              ? entry.metadata
              : {},
          skfId: entry.skf_id || null,
        })),
        timeWindowLabel: 'last 90 days',
      },
    }
  } catch (error) {
    console.error('[site-analytics] Failed to load website analytics:', error)
    return {
      data: null,
      warning: 'Website analytics could not be loaded.',
    }
  }
}
