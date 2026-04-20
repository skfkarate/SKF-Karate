'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flag, Compass, Calendar, MapPin, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { usePortalAuth } from '@/app/_components/portal/usePortalAuth'

export default function PortalEventsPage() {
  usePortalAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/events')
        const data = await res.json()
        setEvents(data.events || [])
      } catch (e) {
        console.error('Failed to load events:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const upcoming = events.filter((e) => new Date(e.date).getTime() >= today.getTime())
  const past = events.filter((e) => new Date(e.date).getTime() < today.getTime())

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  function getTypeBadge(type) {
    const map = {
      tournament: { bg: '#dc264920', color: '#ff4d4d', label: 'Tournament' },
      grading: { bg: '#ffb70320', color: '#ffb703', label: 'Grading' },
      seminar: { bg: '#3b82f620', color: '#60a5fa', label: 'Seminar' },
      camp: { bg: '#10b98120', color: '#34d399', label: 'Camp' },
      fun: { bg: '#a855f720', color: '#c084fc', label: 'Fun Event' },
    }
    return map[type] || { bg: '#ffffff10', color: '#aaa', label: type || 'Event' }
  }

  return (
    <div style={{ padding: '2rem 1rem', maxWidth: '1420px', margin: '0 auto', width: '100%', minHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'center', gap: '1rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          <Flag size={48} color="var(--gold, #ffb703)" />
          Events & Tournaments
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', maxWidth: '600px', marginTop: '0.5rem' }}>
          Upcoming tournaments, seminars, gradings, and training camps from SKF Karate.
        </p>
      </motion.div>

      {loading ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, color: '#666' }}
        >
          Loading events...
        </motion.div>
      ) : events.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(10,14,22,0.6)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.05)',
            padding: '3rem',
            textAlign: 'center'
          }}
        >
          <Compass size={64} color="rgba(255,255,255,0.1)" strokeWidth={1} style={{ marginBottom: '1.5rem' }} />
          <h2 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: '2rem', color: '#fff', marginBottom: '1rem' }}>No Events Scheduled</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '400px', margin: '0 auto', lineHeight: 1.5 }}>
            There are currently no open tournaments or seminars. We will notify you when new events are scheduled.
          </p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {/* Upcoming Events */}
          {upcoming.length > 0 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Calendar size={20} color="var(--gold, #ffb703)" />
                Upcoming Events
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#666', background: '#111', padding: '0.2rem 0.6rem', borderRadius: '50px' }}>{upcoming.length}</span>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {upcoming.map((event, i) => {
                  const badge = getTypeBadge(event.type)
                  const slug = event.slug || event.id
                  const href = event.type === 'tournament' ? `/results/${slug}` : `/events/${slug}`

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '16px',
                        padding: '1.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: badge.color, background: badge.bg, padding: '0.25rem 0.7rem', borderRadius: '50px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {badge.label}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--gold, #ffb703)', fontWeight: 600 }}>
                          {formatDate(event.date)}
                        </span>
                      </div>

                      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>{event.name}</h3>

                      {event.venue && (
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <MapPin size={14} /> {event.venue}{event.city ? `, ${event.city}` : ''}
                        </p>
                      )}

                      {event.description && (
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, flex: 1 }}>
                          {event.description.length > 120 ? event.description.slice(0, 120) + '...' : event.description}
                        </p>
                      )}

                      <Link href={href} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.7rem 1rem',
                        background: 'rgba(255,183,3,0.08)',
                        border: '1px solid rgba(255,183,3,0.15)',
                        borderRadius: '10px',
                        color: 'var(--gold, #ffb703)',
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: '0.85rem',
                        marginTop: 'auto',
                        transition: 'background 0.2s',
                      }}>
                        View Details <ArrowRight size={14} />
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Past Events */}
          {past.length > 0 && (
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: '1.5rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                Past Events
                <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#555', background: '#111', padding: '0.2rem 0.6rem', borderRadius: '50px' }}>{past.length}</span>
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                {past.slice(0, 6).map((event, i) => {
                  const badge = getTypeBadge(event.type)
                  const slug = event.slug || event.id
                  const href = event.type === 'tournament' ? `/results/${slug}` : `/events/${slug}`

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid rgba(255,255,255,0.04)',
                        borderRadius: '16px',
                        padding: '1.5rem',
                        opacity: 0.7,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: badge.color, background: badge.bg, padding: '0.2rem 0.6rem', borderRadius: '50px', textTransform: 'uppercase' }}>
                          {badge.label}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#555' }}>{formatDate(event.date)}</span>
                      </div>
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{event.name}</h3>
                      {event.venue && (
                        <p style={{ margin: '0.5rem 0 0', fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)' }}>
                          {event.venue}{event.city ? `, ${event.city}` : ''}
                        </p>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
