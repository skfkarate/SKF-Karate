'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  Award,
  Bell,
  Eye,
  Globe2,
  LogIn,
  MousePointerClick,
  TriangleAlert,
} from 'lucide-react'

type WebsiteAnalytics = {
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
  topPages: Array<{ path: string; views: number }>
  topLandingPages: Array<{ path: string; views: number }>
  dailyTraffic: Array<{ date: string; views: number }>
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

type CertificateAnalytics = {
  overview: {
    totalUnlocked: number
    unlockedThisMonth: number
    totalEnrolled: number
    totalRevoked: number
    viewsThisMonth: number
    downloadsThisMonth: number
    notificationsSent: number
    notificationsPending: number
  }
  programBreakdown: Array<{
    id: string
    name: string
    type: string
    enrolled: number
    completed: number
    revoked: number
  }>
  beltDistribution: Record<string, number>
  recentActivity: Array<{
    skf_id: string
    enrollment_id: string
    viewed_at: string
    downloaded_at: string | null
    download_format: string | null
  }>
}

type AnalyticsPayload = {
  website: WebsiteAnalytics | null
  certificates: CertificateAnalytics | null
}

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
  })
}

function formatEventLabel(value: string) {
  return value.replace(/_/g, ' ')
}

function formatPath(value: string) {
  return value === '/' ? 'Homepage' : value
}

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsPayload | null>(null)
  const [warnings, setWarnings] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => res.json())
      .then((payload) => {
        setAnalytics(payload.analytics || null)
        setWarnings(Array.isArray(payload.warnings) ? payload.warnings : [])
      })
      .catch((error) => {
        console.error('Failed to load analytics:', error)
      })
      .finally(() => setLoading(false))
  }, [])

  const website = analytics?.website || null
  const certificates = analytics?.certificates || null

  const beltDistribution = useMemo(() => {
    if (!certificates) return []
    return Object.entries(certificates.beltDistribution).sort((a, b) => b[1] - a[1])
  }, [certificates])

  if (loading) {
    return (
      <div style={{ minHeight: '100dvh', background: '#000', color: '#fff', padding: '2rem', display: 'grid', placeItems: 'center' }}>
        <div style={{ color: '#6b6b6b', fontSize: '1rem' }}>Loading analytics intelligence…</div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#000',
        color: '#fff',
        padding: '2rem 2.5rem 4rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '0.78rem', color: '#666', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
          Intelligence
        </p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 400, margin: 0, letterSpacing: '-0.03em' }}>
          Operations Analytics
        </h1>
        <p style={{ margin: '0.85rem 0 0', color: '#808080', lineHeight: 1.65, maxWidth: '900px' }}>
          Website traffic, lead capture, portal activity, and certificate performance are now visible from one admin surface. Public page views respect cookie consent. Operational failures such as lead submission issues and portal login failures are tracked server-side so you can diagnose real workflow problems.
        </p>
      </div>

      {warnings.length > 0 ? (
        <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {warnings.map((warning) => (
            <div
              key={warning}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                padding: '1rem 1.1rem',
                borderRadius: '16px',
                border: '1px solid rgba(245, 158, 11, 0.22)',
                background: 'rgba(245, 158, 11, 0.08)',
                color: '#f6d28b',
              }}
            >
              <TriangleAlert size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              <span style={{ lineHeight: 1.55 }}>{warning}</span>
            </div>
          ))}
        </div>
      ) : null}

      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1rem' }}>
          <Globe2 size={18} color="#d5d5d5" />
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>Website Activity</h2>
        </div>

        {website ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <MetricCard icon={<MousePointerClick size={16} />} label="Visits" value={website.overview.totalVisits} helper="Session entries tracked" />
              <MetricCard icon={<Activity size={16} />} label="Visits Today" value={website.overview.visitsToday} helper="Landing visits since midnight" />
              <MetricCard icon={<Eye size={16} />} label="Page Views" value={website.overview.totalPageViews} helper={`${website.overview.publicPageViews} public · ${website.overview.portalPageViews} portal`} />
              <MetricCard icon={<Award size={16} />} label="Lead Success" value={website.overview.leadSubmissions} helper={`${website.overview.leadFailures} lead failures`} />
              <MetricCard icon={<LogIn size={16} />} label="Portal Logins" value={website.overview.portalLogins} helper={`${website.overview.portalLoginFailures} login failures`} />
            </div>

            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1.2fr 1fr 1fr', marginBottom: '1.5rem' }}>
              <Panel title={`Top Pages · ${website.timeWindowLabel}`}>
                {website.topPages.length === 0 ? (
                  <EmptyPanel text="No tracked public traffic yet." />
                ) : (
                  website.topPages.map((entry) => (
                    <ListRow
                      key={entry.path}
                      label={formatPath(entry.path)}
                      value={`${entry.views} views`}
                    />
                  ))
                )}
              </Panel>

              <Panel title={`Top Landing Pages · ${website.timeWindowLabel}`}>
                {website.topLandingPages.length === 0 ? (
                  <EmptyPanel text="Landing-page data appears once traffic starts." />
                ) : (
                  website.topLandingPages.map((entry) => (
                    <ListRow
                      key={entry.path}
                      label={formatPath(entry.path)}
                      value={`${entry.views} visits`}
                    />
                  ))
                )}
              </Panel>

              <Panel title="Traffic Trend · Last 14 days">
                {website.dailyTraffic.length === 0 ? (
                  <EmptyPanel text="No daily traffic points yet." />
                ) : (
                  <div style={{ display: 'grid', gap: '0.65rem' }}>
                    {website.dailyTraffic.map((point) => (
                      <div key={point.date} style={{ display: 'grid', gap: '0.35rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.8rem', color: '#bfbfbf' }}>
                          <span>{formatShortDate(point.date)}</span>
                          <span>{point.views}</span>
                        </div>
                        <div style={{ height: '8px', borderRadius: '999px', background: '#111', overflow: 'hidden' }}>
                          <div
                            style={{
                              height: '100%',
                              width: `${Math.max(
                                6,
                                (point.views /
                                  Math.max(...website.dailyTraffic.map((entry) => entry.views), 1)) *
                                  100
                              )}%`,
                              background: 'linear-gradient(90deg, #ffffff, #5f5f5f)',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            </div>

            <Panel title="Recent Operational Signals">
              {website.recentOperationalEvents.length === 0 ? (
                <EmptyPanel text="Lead failures and portal login events will appear here." />
              ) : (
                <div style={{ display: 'grid', gap: '0.85rem' }}>
                  {website.recentOperationalEvents.map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        display: 'grid',
                        gap: '0.25rem',
                        padding: '0.95rem 1rem',
                        borderRadius: '14px',
                        border: '1px solid #171717',
                        background: '#080808',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9f9f9f' }}>
                          {formatEventLabel(entry.eventType)}
                        </span>
                        <span style={{ fontSize: '0.76rem', color: '#666' }}>
                          {new Date(entry.createdAt).toLocaleString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>{formatPath(entry.path)}</div>
                      <div style={{ color: '#7d7d7d', fontSize: '0.8rem', lineHeight: 1.55 }}>
                        {entry.skfId ? `SKF ID: ${entry.skfId} · ` : null}
                        {Object.entries(entry.metadata || {})
                          .slice(0, 3)
                          .map(([key, value]) => `${key}: ${String(value)}`)
                          .join(' · ') || 'No extra metadata'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </>
        ) : (
          <Panel title="Website Activity">
            <EmptyPanel text="Website analytics will appear here once the site analytics table is available and page views begin flowing." />
          </Panel>
        )}
      </section>

      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '1rem' }}>
          <Bell size={18} color="#d5d5d5" />
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>Certificates & Programs</h2>
        </div>

        {certificates ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <MetricCard icon={<Award size={16} />} label="Certificates Issued" value={certificates.overview.totalUnlocked} helper={`${certificates.overview.unlockedThisMonth} this month`} />
              <MetricCard icon={<Eye size={16} />} label="Certificate Views" value={certificates.overview.viewsThisMonth} helper={`${certificates.overview.downloadsThisMonth} downloads this month`} />
              <MetricCard icon={<Activity size={16} />} label="Pending Enrollment" value={certificates.overview.totalEnrolled} helper={`${certificates.overview.totalRevoked} revoked`} />
              <MetricCard icon={<Bell size={16} />} label="Notifications" value={certificates.overview.notificationsSent} helper={`${certificates.overview.notificationsPending} pending`} />
            </div>

            <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1.2fr 1fr 1fr' }}>
              <Panel title="Program Breakdown">
                {certificates.programBreakdown.length === 0 ? (
                  <EmptyPanel text="No program analytics yet." />
                ) : (
                  certificates.programBreakdown.map((program) => (
                    <ListRow
                      key={program.id}
                      label={program.name}
                      value={`${program.completed} complete · ${program.enrolled} enrolled`}
                      sublabel={program.type.replace(/_/g, ' ')}
                    />
                  ))
                )}
              </Panel>

              <Panel title="Belt Distribution">
                {beltDistribution.length === 0 ? (
                  <EmptyPanel text="No completed belt records yet." />
                ) : (
                  beltDistribution.map(([belt, count]) => (
                    <ListRow
                      key={belt}
                      label={belt}
                      value={String(count)}
                    />
                  ))
                )}
              </Panel>

              <Panel title="Recent Certificate Activity">
                {certificates.recentActivity.length === 0 ? (
                  <EmptyPanel text="No certificate activity yet." />
                ) : (
                  certificates.recentActivity.map((entry) => (
                    <ListRow
                      key={`${entry.enrollment_id}-${entry.viewed_at}`}
                      label={entry.skf_id}
                      value={entry.downloaded_at ? `Downloaded ${entry.download_format?.toUpperCase() || ''}` : 'Viewed'}
                      sublabel={formatShortDate(entry.viewed_at)}
                    />
                  ))
                )}
              </Panel>
            </div>
          </>
        ) : (
          <Panel title="Certificates & Programs">
            <EmptyPanel text="Certificate analytics are not available in this environment yet." />
          </Panel>
        )}
      </section>
    </div>
  )
}

function MetricCard({
  icon,
  label,
  value,
  helper,
}: {
  icon: ReactNode
  label: string
  value: number
  helper: string
}) {
  return (
    <div style={{ padding: '1.15rem 1.2rem', borderRadius: '18px', border: '1px solid #161616', background: '#050505' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', color: '#cfcfcf', marginBottom: '0.8rem' }}>
        {icon}
        <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#707070' }}>{label}</span>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 600, letterSpacing: '-0.04em' }}>{value}</div>
      <div style={{ marginTop: '0.35rem', color: '#7b7b7b', fontSize: '0.8rem', lineHeight: 1.45 }}>{helper}</div>
    </div>
  )
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ padding: '1.15rem', borderRadius: '18px', border: '1px solid #161616', background: '#050505' }}>
      <div style={{ marginBottom: '1rem', fontSize: '0.84rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#7a7a7a' }}>
        {title}
      </div>
      {children}
    </div>
  )
}

function ListRow({
  label,
  value,
  sublabel,
}: {
  label: string
  value: string
  sublabel?: string
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', padding: '0.7rem 0', borderBottom: '1px solid #111' }}>
      <div>
        <div style={{ fontSize: '0.92rem', fontWeight: 600 }}>{label}</div>
        {sublabel ? (
          <div style={{ marginTop: '0.2rem', fontSize: '0.78rem', color: '#666' }}>{sublabel}</div>
        ) : null}
      </div>
      <div style={{ fontSize: '0.82rem', color: '#bdbdbd', whiteSpace: 'nowrap' }}>{value}</div>
    </div>
  )
}

function EmptyPanel({ text }: { text: string }) {
  return <div style={{ color: '#6f6f6f', fontSize: '0.88rem', lineHeight: 1.6 }}>{text}</div>
}
