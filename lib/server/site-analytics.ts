import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import { logger } from '@/src/server/lib/logger'

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

type AnalyticsBreakdown = {
  label: string
  value: number
  percentage: number
}

type DailyTrafficPoint = {
  date: string
  views: number
  visits: number
  visitors: number
  leads: number
}

type HourlyTrafficPoint = {
  hour: number
  views: number
}

type WebsitePageAnalytics = {
  path: string
  title: string
  group: string
  views: number
  visitors: number
  entrances: number
  exits: number
  lastSeen: string | null
}

type WebsiteVisitorAnalytics = {
  visitorId: string
  firstSeen: string
  lastSeen: string
  sessions: number
  pageViews: number
  landingPage: string
  lastPage: string
  source: string
  device: string
  browser: string
  os: string
  ipLabel: string | null
}

type WebsiteRecentPageView = {
  id: string
  path: string
  title: string
  visitorId: string | null
  sessionId: string | null
  source: string
  device: string
  browser: string
  os: string
  createdAt: string
}

type WebsiteOperationalEvent = {
  id: string
  eventType: string
  path: string
  createdAt: string
  metadata: Record<string, unknown>
  skfId: string | null
}

export type WebsiteAnalyticsSummary = {
  period: {
    rangeDays: number
    startDate: string
    endDate: string
    label: string
    eventsLoaded: number
    eventLimit: number
    limited: boolean
  }
  history: {
    firstRecordedAt: string | null
    lastRecordedAt: string | null
    totalEvents: number
    totalPageViews: number
  }
  overview: {
    visits: number
    visitsToday: number
    uniqueVisitors: number
    returningVisitors: number
    pageViews: number
    publicPageViews: number
    portalPageViews: number
    avgPagesPerVisit: number
    bounceRate: number
    leadSubmissions: number
    leadFailures: number
    leadConversionRate: number
    portalLogins: number
    portalLoginFailures: number
  }
  acquisition: {
    referrers: AnalyticsBreakdown[]
    landingPages: WebsitePageAnalytics[]
  }
  content: {
    topPages: WebsitePageAnalytics[]
    pageGroups: AnalyticsBreakdown[]
    dailyTraffic: DailyTrafficPoint[]
    hourlyTraffic: HourlyTrafficPoint[]
  }
  audience: {
    devices: AnalyticsBreakdown[]
    browsers: AnalyticsBreakdown[]
    operatingSystems: AnalyticsBreakdown[]
    recentVisitors: WebsiteVisitorAnalytics[]
  }
  operations: {
    events: WebsiteOperationalEvent[]
    eventBreakdown: AnalyticsBreakdown[]
  }
  recent: {
    pageViews: WebsiteRecentPageView[]
  }
  insights: string[]
  warning?: string
  timeWindowLabel: string
}

type SupabaseErrorLike = {
  code?: string
  message?: string
} | null | undefined

type AnalyticsEventRow = {
  id: string
  event_type: string
  path?: string | null
  page_title?: string | null
  referrer?: string | null
  visitor_id?: string | null
  session_id?: string | null
  created_at: string
  metadata?: unknown
  skf_id?: string | null
  user_agent?: string | null
  ip_address?: string | null
}

function isMissingTableError(error: SupabaseErrorLike) {
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

function metadataObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function canonicalPath(value: unknown) {
  const path = sanitizePath(value) || '/'
  return path.split('?')[0] || '/'
}

function isLandingView(row: AnalyticsEventRow) {
  return metadataObject(row.metadata).landing === true
}

function pageGroupForPath(pathInput: unknown, metadata?: unknown) {
  const metadataGroup = metadataObject(metadata).pageGroup
  if (typeof metadataGroup === 'string' && metadataGroup.trim()) {
    return metadataGroup.trim() === 'portal' ? 'Athlete Portal' : 'Public Website'
  }

  const path = canonicalPath(pathInput)
  if (path === '/') return 'Home'
  if (path.startsWith('/portal')) return 'Athlete Portal'
  if (path.startsWith('/athlete')) return 'Athlete Profiles'
  if (path.startsWith('/events')) return 'Events'
  if (path.startsWith('/results')) return 'Results'
  if (path.startsWith('/classes')) return 'Classes'
  if (path.startsWith('/shop')) return 'Shop'
  if (path.startsWith('/gallery')) return 'Gallery'
  if (path.startsWith('/rankings') || path.startsWith('/honours')) return 'Rankings'
  if (path.startsWith('/blog')) return 'Blogs'
  if (path.startsWith('/book-trial') || path.startsWith('/contact')) return 'Leads'
  return 'Other'
}

function safeDate(value: unknown) {
  const date = new Date(String(value || ''))
  return Number.isNaN(date.getTime()) ? null : date
}

function dateLabel(date: Date) {
  return date.toISOString().slice(0, 10)
}

function buildDailyTraffic(rows: AnalyticsEventRow[], days: number) {
  const now = new Date()
  const labels = Array.from({ length: days }, (_, index) => {
    const date = new Date(now)
    date.setUTCDate(now.getUTCDate() - (days - index - 1))
    return dateLabel(date)
  })

  const buckets = new Map(
    labels.map((label) => [
      label,
      {
        views: 0,
        leads: 0,
        visitors: new Set<string>(),
        visits: new Set<string>(),
      },
    ])
  )

  for (const row of rows) {
    const label = String(row.created_at || '').slice(0, 10)
    const bucket = buckets.get(label)
    if (!bucket) continue

    if (row.event_type === 'page_view') {
      bucket.views += 1
      if (row.visitor_id) bucket.visitors.add(row.visitor_id)
      if (row.session_id) bucket.visits.add(row.session_id)
    }

    if (row.event_type === 'lead_submit_success') {
      bucket.leads += 1
    }
  }

  return labels.map((date) => ({
    date,
    views: buckets.get(date)?.views || 0,
    visits: buckets.get(date)?.visits.size || 0,
    visitors: buckets.get(date)?.visitors.size || 0,
    leads: buckets.get(date)?.leads || 0,
  }))
}

function buildHourlyTraffic(rows: AnalyticsEventRow[]) {
  const counts = new Map<number, number>(Array.from({ length: 24 }, (_, hour) => [hour, 0]))

  for (const row of rows) {
    if (row.event_type !== 'page_view') continue
    const date = safeDate(row.created_at)
    if (!date) continue
    const hour = date.getUTCHours()
    counts.set(hour, (counts.get(hour) || 0) + 1)
  }

  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    views: counts.get(hour) || 0,
  }))
}

function percentage(value: number, total: number) {
  if (total <= 0) return 0
  return Math.round((value / total) * 1000) / 10
}

function buildBreakdown(counts: Map<string, number>, total: number, limit = 8): AnalyticsBreakdown[] {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, value]) => ({
      label,
      value,
      percentage: percentage(value, total),
    }))
}

function parseDevice(userAgent?: string | null) {
  const ua = String(userAgent || '')
  const lower = ua.toLowerCase()
  const isBot = /bot|crawler|spider|preview|facebookexternalhit|slurp|bingpreview/.test(lower)

  let device = 'Desktop'
  if (isBot) device = 'Bot'
  else if (/ipad|tablet/.test(lower)) device = 'Tablet'
  else if (/mobile|iphone|android/.test(lower)) device = 'Mobile'

  let browser = 'Other'
  if (/edg\//i.test(ua)) browser = 'Edge'
  else if (/chrome|crios/i.test(ua) && !/edg\//i.test(ua)) browser = 'Chrome'
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Safari'
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox'
  else if (/samsungbrowser/i.test(ua)) browser = 'Samsung Internet'

  let os = 'Other'
  if (/iphone|ipad|ios/i.test(ua)) os = 'iOS'
  else if (/android/i.test(ua)) os = 'Android'
  else if (/windows/i.test(ua)) os = 'Windows'
  else if (/mac os|macintosh/i.test(ua)) os = 'macOS'
  else if (/linux/i.test(ua)) os = 'Linux'

  return { device, browser, os }
}

function sourceLabel(referrer?: string | null) {
  const raw = String(referrer || '').trim()
  if (!raw) return 'Direct'

  try {
    const url = new URL(raw)
    const host = url.hostname.replace(/^www\./, '').toLowerCase()
    if (!host) return 'Direct'
    if (host === 'skfkarate.org' || host === 'localhost' || host === '127.0.0.1') return 'Internal / SKF'
    if (host.includes('google.')) return 'Google'
    if (host.includes('instagram.')) return 'Instagram'
    if (host.includes('facebook.') || host.includes('fb.')) return 'Facebook'
    if (host.includes('youtube.') || host.includes('youtu.be')) return 'YouTube'
    if (host.includes('whatsapp.')) return 'WhatsApp'
    return host
  } catch {
    return raw.slice(0, 60)
  }
}

function maskedIp(value?: string | null) {
  const raw = String(value || '').trim()
  if (!raw) return null
  if (raw === '::1' || raw === '127.0.0.1') return 'Local'
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(raw)) {
    const parts = raw.split('.')
    return `${parts[0]}.${parts[1]}.${parts[2]}.x`
  }
  if (raw.includes(':')) {
    return `${raw.split(':').slice(0, 3).join(':')}:...`
  }
  return raw.slice(0, 10)
}

function shortId(value?: string | null) {
  const raw = String(value || '').trim()
  if (!raw) return null
  if (raw.length <= 18) return raw
  return `${raw.slice(0, 12)}...${raw.slice(-4)}`
}

function buildPageAnalytics(pageViews: AnalyticsEventRow[], sessionLastPages: Set<string>, limit = 12) {
  const pages = new Map<string, {
    path: string
    title: string
    group: string
    views: number
    visitors: Set<string>
    entrances: number
    exits: number
    lastSeen: string | null
  }>()

  for (const row of pageViews) {
    const path = canonicalPath(row.path)
    const current = pages.get(path) || {
      path,
      title: sanitizeText(row.page_title, 120) || path,
      group: pageGroupForPath(path, row.metadata),
      views: 0,
      visitors: new Set<string>(),
      entrances: 0,
      exits: 0,
      lastSeen: null,
    }

    current.views += 1
    if (row.visitor_id) current.visitors.add(row.visitor_id)
    if (isLandingView(row)) current.entrances += 1
    if (sessionLastPages.has(row.id)) current.exits += 1
    if (!current.lastSeen || row.created_at > current.lastSeen) current.lastSeen = row.created_at
    if (row.page_title) current.title = sanitizeText(row.page_title, 120) || current.title
    pages.set(path, current)
  }

  return [...pages.values()]
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
    .map((page) => ({
      path: page.path,
      title: page.title,
      group: page.group,
      views: page.views,
      visitors: page.visitors.size,
      entrances: page.entrances,
      exits: page.exits,
      lastSeen: page.lastSeen,
    }))
}

function buildSessionLastPageIds(pageViews: AnalyticsEventRow[]) {
  const sessions = new Map<string, AnalyticsEventRow[]>()

  for (const row of pageViews) {
    const sessionId = row.session_id || row.id
    const rows = sessions.get(sessionId) || []
    rows.push(row)
    sessions.set(sessionId, rows)
  }

  const ids = new Set<string>()
  for (const rows of sessions.values()) {
    rows.sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
    const last = rows[rows.length - 1]
    if (last?.id) ids.add(last.id)
  }
  return ids
}

function buildRecentVisitors(pageViews: AnalyticsEventRow[], limit = 24) {
  const visitors = new Map<string, AnalyticsEventRow[]>()

  for (const row of pageViews) {
    const visitorKey = row.visitor_id || row.session_id || row.id
    const rows = visitors.get(visitorKey) || []
    rows.push(row)
    visitors.set(visitorKey, rows)
  }

  return [...visitors.entries()]
    .map(([visitorId, rows]) => {
      const ordered = [...rows].sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)))
      const first = ordered[0]
      const last = ordered[ordered.length - 1]
      const device = parseDevice(last?.user_agent || first?.user_agent)
      const sessions = new Set(ordered.map((row) => row.session_id).filter(Boolean))

      return {
        visitorId: shortId(visitorId) || 'Unknown',
        firstSeen: first?.created_at || '',
        lastSeen: last?.created_at || '',
        sessions: sessions.size || 1,
        pageViews: ordered.length,
        landingPage: canonicalPath(first?.path),
        lastPage: canonicalPath(last?.path),
        source: sourceLabel(first?.referrer),
        device: device.device,
        browser: device.browser,
        os: device.os,
        ipLabel: maskedIp(last?.ip_address || first?.ip_address),
      }
    })
    .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen))
    .slice(0, limit)
}

function buildInsights(input: {
  topPages: WebsitePageAnalytics[]
  referrers: AnalyticsBreakdown[]
  devices: AnalyticsBreakdown[]
  overview: WebsiteAnalyticsSummary['overview']
}) {
  const insights: string[] = []
  const topPage = input.topPages[0]
  const topReferrer = input.referrers[0]
  const topDevice = input.devices[0]

  if (topPage) {
    insights.push(`${topPage.path} is the highest-traffic page in this period with ${topPage.views} views.`)
  }

  if (topReferrer) {
    insights.push(`${topReferrer.label} is the strongest traffic source at ${topReferrer.percentage}%.`)
  }

  if (topDevice) {
    insights.push(`${topDevice.label} is the dominant device type at ${topDevice.percentage}%.`)
  }

  if (input.overview.bounceRate >= 70 && input.overview.visits >= 10) {
    insights.push(`Bounce rate is ${input.overview.bounceRate}%, so landing pages should be checked for clarity and speed.`)
  }

  if (input.overview.leadFailures > 0) {
    insights.push(`${input.overview.leadFailures} lead submission failure${input.overview.leadFailures === 1 ? '' : 's'} occurred in this period.`)
  }

  if (input.overview.portalLoginFailures > input.overview.portalLogins && input.overview.portalLoginFailures > 0) {
    insights.push('Portal login failures are higher than successful logins; check parent instructions and DOB format.')
  }

  if (!insights.length) {
    insights.push('Traffic is being recorded, but there is not enough activity yet for strong trend signals.')
  }

  return insights
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
      logger.warn('site_analytics.missing_table', { table: 'site_analytics_events' })
      return { ok: false, reason: 'missing-table' as const }
    }

    logger.error('site_analytics.record_failed', { error })
    return { ok: false, reason: 'insert-failed' as const }
  }

  return { ok: true as const }
}

async function fetchAnalyticsRows(startIso: string, maxRows: number) {
  const pageSize = 1000
  const rows: AnalyticsEventRow[] = []

  for (let offset = 0; offset < maxRows; offset += pageSize) {
    const end = Math.min(offset + pageSize - 1, maxRows - 1)
    const { data, error } = await supabaseAdmin
      .from('site_analytics_events')
      .select('id, event_type, path, page_title, referrer, visitor_id, session_id, skf_id, metadata, user_agent, ip_address, created_at')
      .gte('created_at', startIso)
      .order('created_at', { ascending: false })
      .range(offset, end)

    if (error) throw error
    rows.push(...((data || []) as AnalyticsEventRow[]))
    if (!data || data.length < pageSize) break
  }

  return rows
}

function normalizeRangeDays(value?: number) {
  const parsed = Number(value || 90)
  if (!Number.isFinite(parsed)) return 90
  return Math.min(Math.max(Math.round(parsed), 7), 365)
}

export async function getWebsiteAnalyticsSummary(input: {
  rangeDays?: number
  maxRows?: number
} = {}): Promise<{
  data: WebsiteAnalyticsSummary | null
  warning?: string
}> {
  if (!isSupabaseReady()) {
    return {
      data: null,
      warning: 'Database not configured for website analytics.',
    }
  }

  const rangeDays = normalizeRangeDays(input.rangeDays)
  const eventLimit = Math.min(Math.max(Number(input.maxRows || 10000), 1000), 20000)
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setUTCHours(0, 0, 0, 0)
  const startDate = new Date(now)
  startDate.setUTCDate(now.getUTCDate() - (rangeDays - 1))
  startDate.setUTCHours(0, 0, 0, 0)

  try {
    const [
      rangeEventsResponse,
      totalEventsResponse,
      totalPageViewsResponse,
      firstEventResponse,
      lastEventResponse,
    ] = await Promise.all([
      supabaseAdmin
        .from('site_analytics_events')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startDate.toISOString()),
      supabaseAdmin
        .from('site_analytics_events')
        .select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('site_analytics_events')
        .select('*', { count: 'exact', head: true })
        .eq('event_type', 'page_view'),
      supabaseAdmin
        .from('site_analytics_events')
        .select('created_at')
        .order('created_at', { ascending: true })
        .limit(1),
      supabaseAdmin
        .from('site_analytics_events')
        .select('created_at')
        .order('created_at', { ascending: false })
        .limit(1),
    ])

    const errors = [
      rangeEventsResponse.error,
      totalEventsResponse.error,
      totalPageViewsResponse.error,
      firstEventResponse.error,
      lastEventResponse.error,
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

    const rows = await fetchAnalyticsRows(startDate.toISOString(), eventLimit)
    const pageViews = rows.filter((row) => row.event_type === 'page_view')
    const operationalEvents = rows.filter((row) => row.event_type !== 'page_view')
    const sessionIds = new Set(pageViews.map((row) => row.session_id).filter(Boolean))
    const visitorIds = new Set(pageViews.map((row) => row.visitor_id).filter(Boolean))
    const sessions = new Map<string, AnalyticsEventRow[]>()
    const visitorSessions = new Map<string, Set<string>>()

    for (const row of pageViews) {
      const sessionKey = row.session_id || row.id
      const sessionRows = sessions.get(sessionKey) || []
      sessionRows.push(row)
      sessions.set(sessionKey, sessionRows)

      if (row.visitor_id) {
        const set = visitorSessions.get(row.visitor_id) || new Set<string>()
        set.add(sessionKey)
        visitorSessions.set(row.visitor_id, set)
      }
    }

    const visits = sessionIds.size || pageViews.filter(isLandingView).length
    const visitsToday = new Set(
      pageViews
        .filter((row) => String(row.created_at) >= startOfDay.toISOString())
        .map((row) => row.session_id || row.id)
    ).size
    const returningVisitors = [...visitorSessions.values()].filter((set) => set.size > 1).length
    const bouncedSessions = [...sessions.values()].filter((sessionRows) => sessionRows.length === 1).length
    const leadSubmissions = operationalEvents.filter((row) => row.event_type === 'lead_submit_success').length
    const leadFailures = operationalEvents.filter((row) => row.event_type === 'lead_submit_failed').length
    const portalLogins = operationalEvents.filter((row) => row.event_type === 'portal_login_success').length
    const portalLoginFailures = operationalEvents.filter((row) => row.event_type === 'portal_login_failed').length
    const portalPageViews = pageViews.filter((row) => pageGroupForPath(row.path, row.metadata) === 'Athlete Portal').length
    const publicPageViews = Math.max(pageViews.length - portalPageViews, 0)

    const referrerCounts = new Map<string, number>()
    const deviceCounts = new Map<string, number>()
    const browserCounts = new Map<string, number>()
    const osCounts = new Map<string, number>()
    const pageGroupCounts = new Map<string, number>()
    const eventCounts = new Map<string, number>()

    for (const row of pageViews) {
      const referrer = sourceLabel(row.referrer)
      referrerCounts.set(referrer, (referrerCounts.get(referrer) || 0) + 1)

      const device = parseDevice(row.user_agent)
      deviceCounts.set(device.device, (deviceCounts.get(device.device) || 0) + 1)
      browserCounts.set(device.browser, (browserCounts.get(device.browser) || 0) + 1)
      osCounts.set(device.os, (osCounts.get(device.os) || 0) + 1)

      const group = pageGroupForPath(row.path, row.metadata)
      pageGroupCounts.set(group, (pageGroupCounts.get(group) || 0) + 1)
    }

    for (const row of operationalEvents) {
      eventCounts.set(row.event_type, (eventCounts.get(row.event_type) || 0) + 1)
    }

    const sessionLastPageIds = buildSessionLastPageIds(pageViews)
    const topPages = buildPageAnalytics(pageViews, sessionLastPageIds, 14)
    const landingPages = buildPageAnalytics(pageViews.filter(isLandingView), sessionLastPageIds, 10)
    const overview: WebsiteAnalyticsSummary['overview'] = {
      visits,
      visitsToday,
      uniqueVisitors: visitorIds.size,
      returningVisitors,
      pageViews: pageViews.length,
      publicPageViews,
      portalPageViews,
      avgPagesPerVisit: visits > 0 ? Math.round((pageViews.length / visits) * 10) / 10 : 0,
      bounceRate: visits > 0 ? Math.round((bouncedSessions / visits) * 100) : 0,
      leadSubmissions,
      leadFailures,
      leadConversionRate: visits > 0 ? Math.round((leadSubmissions / visits) * 1000) / 10 : 0,
      portalLogins,
      portalLoginFailures,
    }
    const referrers = buildBreakdown(referrerCounts, pageViews.length, 10)
    const devices = buildBreakdown(deviceCounts, pageViews.length, 6)

    return {
      data: {
        period: {
          rangeDays,
          startDate: startDate.toISOString(),
          endDate: now.toISOString(),
          label: `Last ${rangeDays} days`,
          eventsLoaded: rows.length,
          eventLimit,
          limited: Boolean((rangeEventsResponse.count || 0) > rows.length),
        },
        history: {
          firstRecordedAt: (firstEventResponse.data?.[0] as { created_at?: string } | undefined)?.created_at || null,
          lastRecordedAt: (lastEventResponse.data?.[0] as { created_at?: string } | undefined)?.created_at || null,
          totalEvents: totalEventsResponse.count || 0,
          totalPageViews: totalPageViewsResponse.count || 0,
        },
        overview: {
          ...overview,
        },
        acquisition: {
          referrers,
          landingPages,
        },
        content: {
          topPages,
          pageGroups: buildBreakdown(pageGroupCounts, pageViews.length, 10),
          dailyTraffic: buildDailyTraffic(rows, rangeDays),
          hourlyTraffic: buildHourlyTraffic(pageViews),
        },
        audience: {
          devices,
          browsers: buildBreakdown(browserCounts, pageViews.length, 8),
          operatingSystems: buildBreakdown(osCounts, pageViews.length, 8),
          recentVisitors: buildRecentVisitors(pageViews),
        },
        operations: {
          events: operationalEvents.slice(0, 18).map((entry) => ({
            id: entry.id,
            eventType: entry.event_type,
            path: canonicalPath(entry.path),
            createdAt: entry.created_at,
            metadata: metadataObject(entry.metadata),
            skfId: entry.skf_id || null,
          })),
          eventBreakdown: buildBreakdown(eventCounts, operationalEvents.length, 8),
        },
        recent: {
          pageViews: pageViews.slice(0, 30).map((row) => {
            const device = parseDevice(row.user_agent)
            return {
              id: row.id,
              path: canonicalPath(row.path),
              title: sanitizeText(row.page_title, 120) || canonicalPath(row.path),
              visitorId: shortId(row.visitor_id),
              sessionId: shortId(row.session_id),
              source: sourceLabel(row.referrer),
              device: device.device,
              browser: device.browser,
              os: device.os,
              createdAt: row.created_at,
            }
          }),
        },
        insights: buildInsights({ topPages, referrers, devices, overview }),
        warning: (rangeEventsResponse.count || 0) > rows.length
          ? `Loaded the latest ${rows.length} analytics events from this period. Exact totals are still counted from the database.`
          : undefined,
        timeWindowLabel: `last ${rangeDays} days`,
      },
    }
  } catch (error) {
    logger.error('site_analytics.load_failed', { error })
    return {
      data: null,
      warning: 'Website analytics could not be loaded.',
    }
  }
}
