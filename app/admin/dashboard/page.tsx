import Link from 'next/link'
import { ArrowUpRight, CalendarRange, Globe2, ShieldCheck, Users } from 'lucide-react'

import { requireAdminSession } from '@/lib/utils/auth'
import { getAllAthletesLive } from '@/lib/server/repositories/athletes-live'
import { getAllCitiesLive } from '@/lib/server/repositories/classes-live'
import { getAllEventsAdminLive } from '@/lib/server/repositories/events-live'
import { getAllBlogPostsAdminLive } from '@/lib/server/repositories/blogs-live'
import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import { getWebsiteAnalyticsSummary } from '@/lib/server/site-analytics'
import { logger } from '@/src/server/lib/logger'

type DashboardEvent = {
  status?: string
  participants?: unknown[]
  results?: unknown[]
  isResultsPublished?: boolean
}

type DashboardStats = {
  athletes: number
  classes: number
  eventRecords: number
  upcomingEvents: number
  draftEvents: number
  attentionEvents: number
  blogPosts: number
  publishedBlogPosts: number
}

type DashboardEventRow = {
  status?: string | null
  is_results_published?: boolean | null
  participants?: unknown
  results?: unknown
}

async function withFallback<T>(promise: Promise<T>, fallback: T, label: string) {
  try {
    return await promise
  } catch (error) {
    logger.error('admin_dashboard.load_section_failed', { label, error })
    return fallback
  }
}

function needsAttention(event: DashboardEvent) {
  const participantCount = Array.isArray(event.participants) ? event.participants.length : 0
  const resultCount = Array.isArray(event.results) ? event.results.length : 0

  if (event.status !== 'draft' && participantCount === 0) return true
  if (event.status === 'completed' && participantCount > 0 && resultCount === 0) return true
  if (event.isResultsPublished && resultCount === 0) return true
  return false
}

function mapDashboardEventRow(row: DashboardEventRow): DashboardEvent {
  return {
    status: row.status || 'draft',
    isResultsPublished: Boolean(row.is_results_published),
    participants: Array.isArray(row.participants) ? row.participants : [],
    results: Array.isArray(row.results) ? row.results : [],
  }
}

async function countRows(table: string, filter?: { column: string; value: string }) {
  let query = supabaseAdmin.from(table).select('*', { count: 'exact', head: true })

  if (filter) {
    query = query.eq(filter.column, filter.value)
  }

  const { count, error } = await query
  if (error) throw error
  return count || 0
}

async function getEventSummaryRows(table: 'events' | 'tournaments') {
  const { data, error } = await supabaseAdmin
    .from(table)
    .select(table === 'events' ? 'status,is_results_published,participants,results' : 'status,participants,results')

  if (error) throw error
  return (data || []).map((row) => mapDashboardEventRow(row as DashboardEventRow))
}

async function getRepositoryDashboardStats(): Promise<DashboardStats> {
  const [athletes, cities, events, blogPosts] = await Promise.all([
    withFallback(getAllAthletesLive(), [], 'athletes'),
    withFallback(getAllCitiesLive(), [], 'classes'),
    withFallback(getAllEventsAdminLive(), [], 'events'),
    withFallback(getAllBlogPostsAdminLive(), [], 'blogs'),
  ])

  const classes = cities.reduce((total, city) => total + city.branches.length, 0)
  return {
    athletes: athletes.length,
    classes,
    eventRecords: events.length,
    upcomingEvents: events.filter((event) => event.status === 'upcoming' || event.status === 'ongoing').length,
    draftEvents: events.filter((event) => event.status === 'draft').length,
    attentionEvents: events.filter((event) => needsAttention(event)).length,
    blogPosts: blogPosts.length,
    publishedBlogPosts: blogPosts.filter((post) => post.status === 'published').length,
  }
}

async function getFastDashboardStats(): Promise<DashboardStats> {
  if (!isSupabaseReady()) {
    return getRepositoryDashboardStats()
  }

  try {
    const [
      athletes,
      classes,
      standaloneEvents,
      tournaments,
      blogPosts,
      publishedBlogPosts,
    ] = await Promise.all([
      countRows('athletes'),
      countRows('class_branches'),
      getEventSummaryRows('events'),
      getEventSummaryRows('tournaments'),
      countRows('blog_posts'),
      countRows('blog_posts', { column: 'status', value: 'published' }),
    ])

    const events = [...standaloneEvents, ...tournaments]
    return {
      athletes,
      classes,
      eventRecords: events.length,
      upcomingEvents: events.filter((event) => event.status === 'upcoming' || event.status === 'ongoing').length,
      draftEvents: events.filter((event) => event.status === 'draft').length,
      attentionEvents: events.filter((event) => needsAttention(event)).length,
      blogPosts,
      publishedBlogPosts,
    }
  } catch (error) {
    logger.warn('admin_dashboard.repository_summary_fallback', { error })
    return getRepositoryDashboardStats()
  }
}

export default async function AdminDashboardPage() {
  await requireAdminSession(['admin', 'instructor'])

  const [dashboardStats, analyticsSummary] = await Promise.all([
    withFallback(getFastDashboardStats(), {
      athletes: 0,
      classes: 0,
      eventRecords: 0,
      upcomingEvents: 0,
      draftEvents: 0,
      attentionEvents: 0,
      blogPosts: 0,
      publishedBlogPosts: 0,
    }, 'dashboard stats'),
    withFallback(getWebsiteAnalyticsSummary(), { data: null }, 'analytics'),
  ])

  const website = analyticsSummary.data
  const stats = {
    ...dashboardStats,
    totalVisits: website?.overview.totalVisits || 0,
    visitsToday: website?.overview.visitsToday || 0,
    leadFailures: website?.overview.leadFailures || 0,
    portalLoginFailures: website?.overview.portalLoginFailures || 0,
  }

  const overviewCards = [
    {
      label: 'Athlete Profiles',
      value: stats.athletes,
      helper: 'Live athlete records mirrored into public profiles.',
      icon: <Users size={16} />,
    },
    {
      label: 'Training Branches',
      value: stats.classes,
      helper: 'Classes, branches, and training centres active in admin.',
      icon: <ShieldCheck size={16} />,
    },
    {
      label: 'Event Records',
      value: stats.eventRecords,
      helper: `${stats.upcomingEvents} upcoming or live · ${stats.draftEvents} drafts`,
      icon: <CalendarRange size={16} />,
    },
    {
      label: 'Blog Guides',
      value: stats.blogPosts,
      helper: `${stats.publishedBlogPosts} published on the public blog`,
      icon: <Globe2 size={16} />,
    },
    {
      label: 'Website Visits',
      value: stats.totalVisits,
      helper: `${stats.visitsToday} visits today`,
      icon: <Globe2 size={16} />,
    },
  ]

  const workflowGroups = [
    {
      title: 'Event Operations',
      description: 'Create, assign, publish, record outcomes, then sync athlete profiles.',
      items: [
        { label: 'Open Events Hub', href: '/admin/events', meta: `${stats.eventRecords} total records` },
        { label: 'Tournament Studio', href: '/admin/results', meta: 'Tournament outcomes workflow' },
        { label: 'Needs Attention', href: '/admin/events?lane=attention', meta: `${stats.attentionEvents} records need follow-up` },
      ],
    },
    {
      title: 'Training Network',
      description: 'Athletes, classes, and senseis stay linked here so dropdown-driven workflows stay consistent.',
      items: [
        { label: 'Athlete Profiles', href: '/admin/students', meta: `${stats.athletes} active records` },
        { label: 'Classes & Branches', href: '/admin/classes', meta: `${stats.classes} branches in live catalog` },
        { label: 'Sensei Directory', href: '/admin/senseis', meta: 'Manage dropdown-backed instructor data' },
      ],
    },
    {
      title: 'Intelligence',
      description: 'Website visits, lead failures, and portal failures are surfaced with certificate analytics.',
      items: [
        { label: 'Analytics Center', href: '/admin/analytics', meta: `${stats.totalVisits} tracked visits` },
        { label: 'Lead Issues', href: '/admin/analytics', meta: `${stats.leadFailures} failed lead submissions` },
        { label: 'Portal Issues', href: '/admin/analytics', meta: `${stats.portalLoginFailures} failed login attempts` },
      ],
    },
    {
      title: 'Content & Portal',
      description: 'Public guides and athlete portal content stay connected to the live site.',
      items: [
        { label: 'Blog Studio', href: '/admin/blogs', meta: `${stats.blogPosts} guide blocks` },
        { label: 'Portal Content', href: '/admin/portal', meta: 'Home practice and timetable control' },
        { label: 'Public Blog', href: '/blog', meta: `${stats.publishedBlogPosts} published guides` },
      ],
    },
    {
      title: 'Programs & Certificates',
      description: 'Manage program templates, certificate programs, and the issuance pipeline.',
      items: [
        { label: 'Program Catalog', href: '/admin/programs', meta: 'Program templates and editor flow' },
        { label: 'Certificate Programs', href: '/admin/certificates', meta: 'Templates and active certificate programs' },
        { label: 'Issuance Queue', href: '/admin/enrollments', meta: 'Certificate processing pipeline' },
      ],
    },
    {
      title: 'Commerce',
      description: 'Shop fulfilment and product catalog controls for the public website.',
      items: [
        { label: 'Shop Orders', href: '/admin/shop', meta: 'Fulfilment and approval queue' },
        { label: 'Shop Products', href: '/admin/shop/products', meta: 'Merchandise catalog' },
      ],
    },
    {
      title: 'System',
      description: 'Environment and service health checks for backend integrations.',
      items: [
        { label: 'Settings', href: '/admin/settings', meta: 'Environment and service health' },
      ],
    },
  ]

  return (
    <div
      style={{
        padding: '2rem 2.5rem 4rem',
        minHeight: '100dvh',
        background: '#000',
        color: '#fff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ marginBottom: '2.5rem' }}>
        <p style={{ fontSize: '0.78rem', color: '#666', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
          Overview
        </p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 400, margin: 0, letterSpacing: '-0.03em' }}>
          Operations Dashboard
        </h1>
        <p style={{ margin: '0.85rem 0 0', color: '#7f7f7f', lineHeight: 1.65, maxWidth: '920px' }}>
          Start from the operational hub that matches the work you are doing, then drill into the precise editor flow from there.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {overviewCards.map((card) => (
          <div key={card.label} style={{ padding: '1.2rem', borderRadius: '18px', border: '1px solid #151515', background: '#050505' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.9rem', color: '#cdcdcd' }}>
              {card.icon}
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#707070' }}>{card.label}</span>
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 600, letterSpacing: '-0.05em' }}>{card.value}</div>
            <div style={{ marginTop: '0.35rem', color: '#7a7a7a', fontSize: '0.82rem', lineHeight: 1.5 }}>{card.helper}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {workflowGroups.map((group) => (
          <section key={group.title} style={{ borderRadius: '20px', border: '1px solid #151515', background: '#040404', padding: '1.35rem 1.4rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{group.title}</h2>
              <p style={{ margin: '0.45rem 0 0', color: '#787878', lineHeight: 1.6 }}>{group.description}</p>
            </div>

            <div style={{ display: 'grid', gap: '0.8rem', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              {group.items.map((item) => (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '1rem',
                    alignItems: 'flex-start',
                    padding: '1rem 1.05rem',
                    borderRadius: '16px',
                    border: '1px solid #171717',
                    background: '#070707',
                    color: '#fff',
                    textDecoration: 'none',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.96rem', fontWeight: 600 }}>{item.label}</div>
                    <div style={{ marginTop: '0.35rem', fontSize: '0.8rem', color: '#717171', lineHeight: 1.45 }}>{item.meta}</div>
                  </div>
                  <ArrowUpRight size={18} color="#8f8f8f" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
