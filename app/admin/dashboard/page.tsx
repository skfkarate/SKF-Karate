'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, CalendarRange, Globe2, ShieldCheck, Users } from 'lucide-react'

type DashboardState = {
  athletes: number
  classes: number
  eventRecords: number
  upcomingEvents: number
  draftEvents: number
  attentionEvents: number
  totalVisits: number
  visitsToday: number
  leadFailures: number
  portalLoginFailures: number
}

function needsAttention(event: any) {
  const participantCount = Array.isArray(event.participants) ? event.participants.length : 0
  const resultCount = Array.isArray(event.results) ? event.results.length : 0

  if (event.status !== 'draft' && participantCount === 0) return true
  if (event.status === 'completed' && participantCount > 0 && resultCount === 0) return true
  if (event.isResultsPublished && resultCount === 0) return true
  return false
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardState>({
    athletes: 0,
    classes: 0,
    eventRecords: 0,
    upcomingEvents: 0,
    draftEvents: 0,
    attentionEvents: 0,
    totalVisits: 0,
    visitsToday: 0,
    leadFailures: 0,
    portalLoginFailures: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [athletesRes, classesRes, eventsRes, analyticsRes] = await Promise.all([
          fetch('/api/admin/students'),
          fetch('/api/admin/classes'),
          fetch('/api/admin/events'),
          fetch('/api/admin/analytics'),
        ])

        const [athletesData, classesData, eventsData, analyticsData] = await Promise.all([
          athletesRes.json(),
          classesRes.json(),
          eventsRes.json(),
          analyticsRes.json(),
        ])

        const events = Array.isArray(eventsData.events) ? eventsData.events : []
        const website = analyticsData?.analytics?.website

        setStats({
          athletes: athletesData.students?.length || 0,
          classes: Array.isArray(classesData.cities)
            ? classesData.cities.reduce(
                (total: number, city: any) => total + (Array.isArray(city.branches) ? city.branches.length : 0),
                0
              )
            : 0,
          eventRecords: events.length,
          upcomingEvents: events.filter((event: any) => event.status === 'upcoming' || event.status === 'ongoing').length,
          draftEvents: events.filter((event: any) => event.status === 'draft').length,
          attentionEvents: events.filter((event: any) => needsAttention(event)).length,
          totalVisits: website?.overview?.totalVisits || 0,
          visitsToday: website?.overview?.visitsToday || 0,
          leadFailures: website?.overview?.leadFailures || 0,
          portalLoginFailures: website?.overview?.portalLoginFailures || 0,
        })
      } catch (error) {
        console.error('Dashboard load error:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const overviewCards = useMemo(
    () => [
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
        label: 'Website Visits',
        value: stats.totalVisits,
        helper: `${stats.visitsToday} visits today`,
        icon: <Globe2 size={16} />,
      },
    ],
    [stats]
  )

  const workflowGroups = [
    {
      title: 'Event Operations',
      description: 'The highest-priority operational chain: create, assign, publish, record outcomes, then sync athlete profiles.',
      items: [
        { label: 'Open Events Hub', href: '/admin/events', meta: `${stats.eventRecords} total records` },
        { label: 'Tournament Studio', href: '/admin/results', meta: 'Separate precise workflow for tournament outcomes' },
        { label: 'Needs Attention', href: '/admin/events?lane=attention', meta: `${stats.attentionEvents} records need follow-up` },
      ],
    },
    {
      title: 'Training Network',
      description: 'Athletes, classes, and senseis stay linked here so dropdown-driven workflows remain consistent.',
      items: [
        { label: 'Athlete Profiles', href: '/admin/students', meta: `${stats.athletes} active records` },
        { label: 'Classes & Branches', href: '/admin/classes', meta: `${stats.classes} branches in live catalog` },
        { label: 'Sensei Directory', href: '/admin/senseis', meta: 'Manage dropdown-backed instructor data' },
      ],
    },
    {
      title: 'Intelligence',
      description: 'Website visits, lead failures, and portal failures are now surfaced with certificate analytics in one place.',
      items: [
        { label: 'Analytics Center', href: '/admin/analytics', meta: `${stats.totalVisits} tracked visits` },
        { label: 'Lead Issues', href: '/admin/analytics', meta: `${stats.leadFailures} failed lead submissions` },
        { label: 'Portal Issues', href: '/admin/analytics', meta: `${stats.portalLoginFailures} failed login attempts` },
      ],
    },
  ]

  return (
    <div
      style={{
        padding: '2rem 2.5rem 4rem',
        minHeight: '100vh',
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
          The admin is now structured around real workflows instead of isolated screens. Start from the operational hub that matches the work you are doing, then drill into the precise editor flow from there.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {overviewCards.map((card) => (
          <div key={card.label} style={{ padding: '1.2rem', borderRadius: '18px', border: '1px solid #151515', background: '#050505' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', marginBottom: '0.9rem', color: '#cdcdcd' }}>
              {card.icon}
              <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#707070' }}>{card.label}</span>
            </div>
            <div style={{ fontSize: '2.1rem', fontWeight: 600, letterSpacing: '-0.05em' }}>{loading ? '—' : card.value}</div>
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
