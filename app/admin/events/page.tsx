'use client'

import type { CSSProperties } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  CalendarDays,
  ExternalLink,
  Eye,
  PenSquare,
  Plus,
  Trash2,
  Trophy,
  Users,
} from 'lucide-react'

import { getEventLabel } from '@/data/constants/categories'
import { TOURNAMENT_LEVEL_LABELS } from '@/lib/types/tournament'

type EventLane = 'timeline' | 'standard' | 'tournaments' | 'attention'

type AdminEventRow = {
  id: string
  slug: string
  name: string
  type: string
  status: string
  level?: string
  date: string
  venue?: string
  city?: string
  description?: string
  hostingBranch?: string
  isPublished?: boolean
  isResultsPublished?: boolean
  participants?: unknown[]
  results?: unknown[]
  resultsAppliedAt?: string
}

type AdminEventsResponse = {
  events?: AdminEventRow[]
}

function formatFullDate(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTimelineHeading(value: string) {
  return new Date(value).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })
}

function getWorkflowStatus(event: AdminEventRow) {
  const participantCount = Array.isArray(event.participants) ? event.participants.length : 0
  const resultCount = Array.isArray(event.results) ? event.results.length : 0

  if (event.status === 'draft') return 'Draft'
  if (event.status === 'completed' && resultCount > 0 && event.resultsAppliedAt) return 'Completed & Synced'
  if (event.status === 'completed' && resultCount > 0) return 'Completed'
  if (event.status === 'completed') return 'Completed / Awaiting outcomes'
  if (event.status === 'ongoing') return 'Live'
  if (participantCount === 0) return 'Awaiting athlete assignment'
  return 'Scheduled'
}

function getTypeLabel(event: AdminEventRow) {
  if (event.type === 'tournament') {
    return TOURNAMENT_LEVEL_LABELS[event.level as keyof typeof TOURNAMENT_LEVEL_LABELS] || 'Tournament'
  }

  return getEventLabel(event.type || 'seminar')
}

function needsAttention(event: AdminEventRow) {
  const participantCount = Array.isArray(event.participants) ? event.participants.length : 0
  const resultCount = Array.isArray(event.results) ? event.results.length : 0

  if (event.status !== 'draft' && participantCount === 0) return true
  if (event.status === 'completed' && participantCount > 0 && resultCount === 0) return true
  if (event.isResultsPublished && resultCount === 0) return true
  return false
}

function sortEventsForTimeline(events: AdminEventRow[]) {
  return [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export default function AdminEventsPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [events, setEvents] = useState<AdminEventRow[]>([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState('')
  const initialLane =
    searchParams?.get('lane') === 'standard' ||
    searchParams?.get('lane') === 'tournaments' ||
    searchParams?.get('lane') === 'attention'
      ? (searchParams.get('lane') as EventLane)
      : 'timeline'
  const [lane, setLane] = useState<EventLane>(initialLane)
  const [query, setQuery] = useState('')

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/events')
      const data = await res.json() as AdminEventsResponse
      setEvents(Array.isArray(data.events) ? data.events : [])
    } catch (error) {
      console.error('Failed to load events hub:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void fetchEvents()
    }, 0)
    return () => window.clearTimeout(id)
  }, [fetchEvents])

  useEffect(() => {
    if (!searchParams) return

    const requestedLane = searchParams.get('lane')
    if (
      requestedLane === 'standard' ||
      requestedLane === 'tournaments' ||
      requestedLane === 'attention' ||
      requestedLane === 'timeline'
    ) {
      const id = window.setTimeout(() => setLane(requestedLane), 0)
      return () => window.clearTimeout(id)
    }
  }, [searchParams])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return

    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setNotification('Record deleted.')
        window.setTimeout(() => setNotification(''), 3000)
        fetchEvents()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete record')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to delete record')
    }
  }

  const scopedEvents = useMemo(() => {
    const filteredByLane = events.filter((event) => {
      if (lane === 'standard') return event.type !== 'tournament'
      if (lane === 'tournaments') return event.type === 'tournament'
      if (lane === 'attention') return needsAttention(event)
      return true
    })

    const normalizedQuery = query.trim().toLowerCase()
    const searched = normalizedQuery
      ? filteredByLane.filter((event) => {
          const haystack = [
            event.name,
            event.slug,
            event.type,
            event.level,
            event.city,
            event.venue,
            event.hostingBranch,
          ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()

          return haystack.includes(normalizedQuery)
        })
      : filteredByLane

    return sortEventsForTimeline(searched)
  }, [events, lane, query])

  const groupedTimeline = useMemo(() => {
    const map = new Map<string, AdminEventRow[]>()
    for (const event of scopedEvents) {
      const key = formatTimelineHeading(event.date)
      const bucket = map.get(key) || []
      bucket.push(event)
      map.set(key, bucket)
    }
    return [...map.entries()]
  }, [scopedEvents])

  const summary = useMemo(() => {
    const total = events.length
    const tournaments = events.filter((event) => event.type === 'tournament').length
    const publicCount = events.filter((event) => event.isPublished).length
    const draftCount = events.filter((event) => event.status === 'draft').length
    const attentionCount = events.filter((event) => needsAttention(event)).length

    return { total, tournaments, publicCount, draftCount, attentionCount }
  }, [events])

  const laneButtonStyle = (active: boolean) => ({
    padding: '0.75rem 1rem',
    borderRadius: '999px',
    border: `1px solid ${active ? '#2f2f2f' : '#171717'}`,
    background: active ? '#121212' : '#070707',
    color: active ? '#fff' : '#8a8a8a',
    cursor: 'pointer',
    fontSize: '0.84rem',
    fontWeight: 600,
  })

  const cardActionStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.45rem',
    padding: '0.55rem 0.8rem',
    borderRadius: '10px',
    border: '1px solid #2a2a2a',
    color: '#f5f5f5',
    textDecoration: 'none',
    background: '#111',
    fontSize: '0.8rem',
    fontWeight: 500,
  }

  const selectLane = (nextLane: EventLane) => {
    setLane(nextLane)
    router.replace(`${pathname}?lane=${nextLane}`, { scroll: false })
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#0a0a0a',
        color: '#fff',
        paddingBottom: '4rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {notification ? (
        <div
          style={{
            position: 'fixed',
            top: '2rem',
            right: '3rem',
            background: '#fff',
            color: '#000',
            padding: '0.95rem 1.2rem',
            fontWeight: 600,
            zIndex: 100,
            borderRadius: '12px',
          }}
        >
          {notification}
        </div>
      ) : null}

      <div
        style={{
          borderBottom: '1px solid #171717',
          padding: '2rem 2.5rem',
          background: '#000',
        }}
      >
        <p
          style={{
            color: '#666',
            fontSize: '0.78rem',
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
            marginBottom: '1rem',
            textTransform: 'uppercase',
          }}
        >
          Event Operations
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div style={{ maxWidth: '760px' }}>
            <h1 style={{ fontSize: '2.6rem', fontWeight: 400, margin: 0, letterSpacing: '-0.04em' }}>
              Events Hub
            </h1>
            <p style={{ margin: '0.8rem 0 0', color: '#808080', lineHeight: 1.65 }}>
              Track the full event chain in one place: create a draft, assign athletes, publish publicly, record attendance or results,
              then push outcomes into athlete profiles. Tournaments remain in their own precise workflow, but are visible here in the same timeline.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link
              href="/admin/events/new"
              style={{
                ...cardActionStyle,
                background: '#fff',
                color: '#000',
                border: 'none',
                padding: '0.8rem 1.1rem',
                fontWeight: 700,
              }}
            >
              <Plus size={16} />
              Create Event
            </Link>
            <Link
              href="/admin/results/new"
              style={{
                ...cardActionStyle,
                padding: '0.8rem 1.1rem',
                borderColor: '#2b2b2b',
              }}
            >
              <Trophy size={16} />
              Create Tournament
            </Link>
          </div>
        </div>
      </div>

      <div style={{ padding: '2rem 2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            ['Total Records', summary.total],
            ['Tournaments', summary.tournaments],
            ['Public Events', summary.publicCount],
            ['Drafts', summary.draftCount],
            ['Need Attention', summary.attentionCount],
          ].map(([label, value]) => (
            <div key={label} style={{ padding: '1rem 1.15rem', borderRadius: '16px', background: '#050505', border: '1px solid #141414' }}>
              <div style={{ color: '#696969', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
              <div style={{ marginTop: '0.55rem', fontSize: '1.95rem', fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'minmax(0, 1fr)',
            padding: '1rem',
            borderRadius: '20px',
            border: '1px solid #151515',
            background: '#040404',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => selectLane('timeline')} style={laneButtonStyle(lane === 'timeline')}>
                Full Timeline
              </button>
              <button type="button" onClick={() => selectLane('standard')} style={laneButtonStyle(lane === 'standard')}>
                Standard Events
              </button>
              <button type="button" onClick={() => selectLane('tournaments')} style={laneButtonStyle(lane === 'tournaments')}>
                Tournaments
              </button>
              <button type="button" onClick={() => selectLane('attention')} style={laneButtonStyle(lane === 'attention')}>
                Needs Attention
              </button>
            </div>

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, slug, type, city, venue..."
              style={{
                minWidth: '280px',
                width: '100%',
                maxWidth: '420px',
                padding: '0.85rem 1rem',
                borderRadius: '14px',
                background: '#0c0c0c',
                border: '1px solid #202020',
                color: '#fff',
              }}
            />
          </div>

          <div style={{ color: '#717171', fontSize: '0.82rem', lineHeight: 1.5 }}>
            Timeline order is based on the actual event date, so late-created records still sit in the right operational position.
          </div>
        </div>

        {loading && events.length === 0 ? (
          <div style={{ padding: '3rem', border: '1px dashed #232323', color: '#6f6f6f', textAlign: 'center' }}>Loading event operations…</div>
        ) : scopedEvents.length === 0 ? (
          <div style={{ padding: '3rem', border: '1px dashed #232323', color: '#6f6f6f', textAlign: 'center' }}>
            No records match this view yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {groupedTimeline.map(([label, monthEvents]) => (
              <section key={label}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                  <CalendarDays size={16} color="#7d7d7d" />
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, letterSpacing: '0.03em', color: '#e8e8e8' }}>{label}</h2>
                </div>

                <div style={{ display: 'grid', gap: '1rem' }}>
                  {monthEvents.map((event) => {
                    const participantCount = Array.isArray(event.participants) ? event.participants.length : 0
                    const resultCount = Array.isArray(event.results) ? event.results.length : 0
                    const isTournament = event.type === 'tournament'

                    return (
                      <article
                        key={event.id}
                        style={{
                          display: 'grid',
                          gap: '1rem',
                          gridTemplateColumns: '140px minmax(0, 1fr)',
                          border: '1px solid #151515',
                          borderRadius: '20px',
                          background: '#050505',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            padding: '1.25rem',
                            background: '#090909',
                            borderRight: '1px solid #151515',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '0.8rem',
                          }}
                        >
                          <div>
                            <div style={{ color: '#838383', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                              Event Date
                            </div>
                            <div style={{ marginTop: '0.45rem', fontSize: '1.1rem', fontWeight: 700 }}>
                              {formatFullDate(event.date)}
                            </div>
                          </div>
                          <div style={{ color: '#9a9a9a', fontSize: '0.8rem', lineHeight: 1.5 }}>
                            {event.city || 'City pending'}
                            <br />
                            {event.venue || 'Venue pending'}
                          </div>
                        </div>

                        <div style={{ padding: '1.25rem 1.35rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                            <div style={{ maxWidth: '760px' }}>
                              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.7rem' }}>
                                <span style={{ padding: '0.25rem 0.6rem', borderRadius: '999px', border: '1px solid #202020', color: '#dcdcdc', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                  {getTypeLabel(event)}
                                </span>
                                <span style={{ padding: '0.25rem 0.6rem', borderRadius: '999px', border: `1px solid ${needsAttention(event) ? 'rgba(255,107,107,0.35)' : '#202020'}`, color: needsAttention(event) ? '#ff8b8b' : '#8d8d8d', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                  {getWorkflowStatus(event)}
                                </span>
                                <span style={{ padding: '0.25rem 0.6rem', borderRadius: '999px', border: '1px solid #202020', color: event.isPublished ? '#b9f7cf' : '#8d8d8d', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                  {event.isPublished ? 'Public' : 'Private'}
                                </span>
                              </div>

                              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, letterSpacing: '-0.02em' }}>{event.name}</h3>
                              <p style={{ margin: '0.6rem 0 0', color: '#7b7b7b', lineHeight: 1.6 }}>
                                {event.description || 'No description added yet.'}
                              </p>
                            </div>

                            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                              <Link
                                href={isTournament ? `/admin/results/${event.id}/edit` : `/admin/events/${event.id}`}
                                style={cardActionStyle}
                              >
                                <PenSquare size={14} />
                                {isTournament ? 'Tournament Studio' : 'Details'}
                              </Link>
                              {!isTournament ? (
                                <>
                                  <Link href={`/admin/events/${event.id}?tab=athletes`} style={cardActionStyle}>
                                    <Users size={14} />
                                    Athletes
                                  </Link>
                                  <Link href={`/admin/events/${event.id}?tab=results`} style={cardActionStyle}>
                                    <Eye size={14} />
                                    Outcomes
                                  </Link>
                                </>
                              ) : (
                                <Link href={`/admin/results/${event.id}/edit`} style={cardActionStyle}>
                                  <Trophy size={14} />
                                  Outcomes
                                </Link>
                              )}
                              {event.isPublished ? (
                                <Link href={`/events/${event.slug}`} target="_blank" style={cardActionStyle}>
                                  <ExternalLink size={14} />
                                  Public View
                                </Link>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => handleDelete(event.id, event.name)}
                                style={{ ...cardActionStyle, cursor: 'pointer', color: '#ff8b8b', borderColor: 'rgba(255,107,107,0.28)' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gap: '0.8rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginTop: '1rem' }}>
                            <div style={{ padding: '0.9rem 1rem', border: '1px solid #161616', borderRadius: '14px', background: '#080808' }}>
                              <div style={{ color: '#707070', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Athlete Assignment</div>
                              <div style={{ marginTop: '0.45rem', fontSize: '1.1rem', fontWeight: 700 }}>{participantCount}</div>
                              <div style={{ marginTop: '0.25rem', color: '#8a8a8a', fontSize: '0.8rem' }}>
                                {participantCount > 0 ? 'Athletes ready for event flow' : 'No athletes assigned yet'}
                              </div>
                            </div>

                            <div style={{ padding: '0.9rem 1rem', border: '1px solid #161616', borderRadius: '14px', background: '#080808' }}>
                              <div style={{ color: '#707070', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Recorded Outcomes</div>
                              <div style={{ marginTop: '0.45rem', fontSize: '1.1rem', fontWeight: 700 }}>{resultCount}</div>
                              <div style={{ marginTop: '0.25rem', color: '#8a8a8a', fontSize: '0.8rem' }}>
                                {resultCount > 0 ? 'Attendance / results entered' : 'Nothing recorded yet'}
                              </div>
                            </div>

                            <div style={{ padding: '0.9rem 1rem', border: '1px solid #161616', borderRadius: '14px', background: '#080808' }}>
                              <div style={{ color: '#707070', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Profile Sync</div>
                              <div style={{ marginTop: '0.45rem', fontSize: '1.1rem', fontWeight: 700 }}>
                                {event.resultsAppliedAt ? 'Applied' : 'Pending'}
                              </div>
                              <div style={{ marginTop: '0.25rem', color: '#8a8a8a', fontSize: '0.8rem' }}>
                                {event.resultsAppliedAt
                                  ? `Updated ${formatFullDate(event.resultsAppliedAt)}`
                                  : 'Not pushed to athlete profiles yet'}
                              </div>
                            </div>

                            <div style={{ padding: '0.9rem 1rem', border: '1px solid #161616', borderRadius: '14px', background: '#080808' }}>
                              <div style={{ color: '#707070', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Publication</div>
                              <div style={{ marginTop: '0.45rem', fontSize: '1.1rem', fontWeight: 700 }}>
                                {event.isPublished ? 'Live on Website' : 'Hidden'}
                              </div>
                              <div style={{ marginTop: '0.25rem', color: '#8a8a8a', fontSize: '0.8rem' }}>
                                {event.isResultsPublished ? 'Participants / results visible publicly' : 'Results stay internal'}
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
