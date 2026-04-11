'use client'

import { useState, useEffect } from 'react'
import {
  BarChart3, TrendingUp, Download, Eye, Bell, Users,
  Award, Shield, CheckCircle, XCircle, Clock
} from 'lucide-react'

const BELT_COLORS: Record<string, string> = {
  white: '#FFFFFF',
  yellow: '#FFD700',
  orange: '#FF8C00',
  green: '#228B22',
  blue: '#1E3A8A',
  purple: '#9B59B6',
  brown: '#8B4513',
  black: '#1a1a1a'
}

interface Analytics {
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

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(res => res.json())
      .then(data => setAnalytics(data.analytics))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#666', fontSize: '1.2rem' }}>Loading analytics...</div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#666', fontSize: '1.2rem' }}>Analytics unavailable. Database may not be configured.</div>
      </div>
    )
  }

  const o = analytics.overview
  const downloadRate = o.totalUnlocked > 0 ? Math.round((o.downloadsThisMonth / Math.max(o.totalUnlocked, 1)) * 100) : 0

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <p style={{ fontSize: '0.8rem', color: '#666', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>
          Intelligence
        </p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 400, margin: 0, letterSpacing: '-0.03em' }}>
          Certificate Analytics
        </h1>
      </div>

      {/* Overview Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        <StatCard icon={<Award size={18} />} label="Certificates Issued" value={o.totalUnlocked} accent="#2ecc71" />
        <StatCard icon={<TrendingUp size={18} />} label="Unlocked This Month" value={o.unlockedThisMonth} accent="#f39c12" />
        <StatCard icon={<Clock size={18} />} label="Pending Enrollment" value={o.totalEnrolled} accent="#3498db" />
        <StatCard icon={<XCircle size={18} />} label="Revoked" value={o.totalRevoked} accent="#e74c3c" />
        <StatCard icon={<Eye size={18} />} label="Views This Month" value={o.viewsThisMonth} accent="#9b59b6" />
        <StatCard icon={<Download size={18} />} label="Downloads This Month" value={o.downloadsThisMonth} accent="#1abc9c" />
        <StatCard icon={<Bell size={18} />} label="Emails Sent" value={o.notificationsSent} accent="#2ecc71" />
        <StatCard icon={<Bell size={18} />} label="Pending Notifications" value={o.notificationsPending} accent="#e67e22" />
      </div>

      {/* Program Breakdown */}
      <div style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 400, marginBottom: '2rem', borderBottom: '1px solid #111', paddingBottom: '1rem', letterSpacing: '-0.02em' }}>
          Program Breakdown
        </h2>
        <div style={{ background: '#050505', border: '1px solid #111', borderRadius: '8px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#0a0a0a', borderBottom: '1px solid #222' }}>
                <th style={{ padding: '1rem 1.5rem', color: '#666', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Program</th>
                <th style={{ padding: '1rem 1.5rem', color: '#666', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</th>
                <th style={{ padding: '1rem 1.5rem', color: '#f39c12', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Enrolled</th>
                <th style={{ padding: '1rem 1.5rem', color: '#2ecc71', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Completed</th>
                <th style={{ padding: '1rem 1.5rem', color: '#e74c3c', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Revoked</th>
                <th style={{ padding: '1rem 1.5rem', color: '#666', fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {analytics.programBreakdown.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No programs found.</td></tr>
              ) : analytics.programBreakdown.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #111' }}>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, background: 'rgba(243, 156, 18, 0.1)', color: '#f39c12', textTransform: 'uppercase' }}>
                      {p.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center', color: '#f39c12', fontWeight: 600 }}>{p.enrolled}</td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center', color: '#2ecc71', fontWeight: 600 }}>{p.completed}</td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center', color: '#e74c3c', fontWeight: 600 }}>{p.revoked}</td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 600 }}>{p.enrolled + p.completed + p.revoked}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two-Column: Belt Distribution + Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Belt Distribution */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 400, marginBottom: '2rem', borderBottom: '1px solid #111', paddingBottom: '1rem', letterSpacing: '-0.02em' }}>
            Belt Distribution
          </h2>
          <div style={{ background: '#050505', border: '1px solid #111', borderRadius: '8px', padding: '1.5rem' }}>
            {Object.keys(analytics.beltDistribution).length === 0 ? (
              <div style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No belt data yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(analytics.beltDistribution)
                  .sort((a, b) => b[1] - a[1])
                  .map(([belt, count]) => {
                    const totalBelts = Object.values(analytics.beltDistribution).reduce((s, v) => s + v, 0)
                    const pct = Math.round((count / totalBelts) * 100)
                    const color = BELT_COLORS[belt.toLowerCase()] || '#888'
                    return (
                      <div key={belt} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: color, border: belt.toLowerCase() === 'white' ? '1px solid #444' : 'none', flexShrink: 0 }} />
                        <span style={{ width: '80px', fontSize: '0.85rem', textTransform: 'capitalize', fontWeight: 600, color: '#ccc' }}>{belt}</span>
                        <div style={{ flex: 1, height: '8px', background: '#111', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', minWidth: '40px', textAlign: 'right' }}>{count}</span>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 400, marginBottom: '2rem', borderBottom: '1px solid #111', paddingBottom: '1rem', letterSpacing: '-0.02em' }}>
            Recent Certificate Activity
          </h2>
          <div style={{ background: '#050505', border: '1px solid #111', borderRadius: '8px', overflow: 'hidden' }}>
            {analytics.recentActivity.length === 0 ? (
              <div style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No activity yet</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {analytics.recentActivity.map((a, i) => (
                  <div key={i} style={{
                    padding: '0.85rem 1.25rem',
                    borderBottom: '1px solid #111',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '50%',
                        background: a.downloaded_at ? 'rgba(46, 204, 113, 0.15)' : 'rgba(243, 156, 18, 0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {a.downloaded_at ? <Download size={14} color="#2ecc71" /> : <Eye size={14} color="#f39c12" />}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500, fontFamily: 'monospace', color: '#ccc' }}>{a.skf_id}</div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>
                          {a.downloaded_at ? `Downloaded ${a.download_format?.toUpperCase() || ''}` : 'Viewed'}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>
                      {new Date(a.viewed_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Engagement Summary */}
      <div style={{ marginTop: '3rem', padding: '2rem', background: '#050505', border: '1px solid #111', borderRadius: '8px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1.5rem', color: '#888' }}>Engagement Summary</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '2rem' }}>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '2rem', fontWeight: 300, color: '#2ecc71' }}>{downloadRate}%</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Download Rate (MTD)</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '2rem', fontWeight: 300, color: '#f39c12' }}>{o.viewsThisMonth}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Certificate Views (MTD)</p>
          </div>
          <div>
            <p style={{ margin: '0 0 0.25rem 0', fontSize: '2rem', fontWeight: 300, color: '#e74c3c' }}>{o.notificationsPending}</p>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Follow-ups</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent: string }) {
  return (
    <div style={{
      padding: '1.5rem',
      border: '1px solid #111',
      background: '#050505',
      borderRadius: '0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <span style={{ color: accent }}>{icon}</span>
        <p style={{ fontSize: '0.7rem', color: '#666', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
          {label}
        </p>
      </div>
      <p style={{ fontSize: '2.2rem', fontWeight: 300, color: '#fff', margin: 0, letterSpacing: '-0.05em' }}>
        {value}
      </p>
    </div>
  )
}
