import Link from 'next/link'
import { headers } from 'next/headers'
import { Calendar, Compass, MapPin, ArrowRight } from 'lucide-react'

import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'
import { getAllEventsLive } from '@/lib/server/repositories/events-live'
import {
  getAssignedPortalEvents,
  getPortalEventHref,
  isUpcomingPortalEvent,
} from '@/lib/utils/portal-events'

export const dynamic = 'force-dynamic'

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

function EventCard({ event, index }) {
  const badge = getTypeBadge(event.type)
  const href = getPortalEventHref(event)

  return (
    <Link
      href={href}
      className="events-grid-new__card"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '260px',
        background: 'rgba(20,20,20,0.4)',
        borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '2rem',
        overflow: 'hidden',
        textDecoration: 'none',
        boxShadow: '0 20px 40px rgba(0,0,0,0.45)',
        backdropFilter: 'blur(32px) saturate(180%)',
        animation: `portalEventIn 360ms ease ${index * 60}ms both`,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '190px',
          height: '190px',
          background: badge.color,
          filter: 'blur(80px)',
          opacity: 0.16,
          borderRadius: '50%',
        }}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
        <div>
          <div style={{ color: '#fff', fontSize: '2.1rem', fontWeight: 900, lineHeight: 1 }}>
            {formatDate(event.date)}
          </div>
          {event.endDate ? (
            <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: '0.85rem', marginTop: '0.45rem' }}>
              Ends {formatDate(event.endDate)}
            </div>
          ) : null}
        </div>
        <span
          style={{
            alignSelf: 'flex-start',
            fontSize: '0.72rem',
            fontWeight: 800,
            color: badge.color,
            background: badge.bg,
            border: `1px solid ${badge.color}30`,
            padding: '0.4rem 0.85rem',
            borderRadius: '999px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {badge.label}
        </span>
      </div>

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ margin: '0 0 0.9rem', fontSize: '1.55rem', fontWeight: 850, color: '#fff', lineHeight: 1.2 }}>
          {event.name}
        </h3>

        {event.venue ? (
          <p style={{ margin: '0 0 1rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.72)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={16} color={badge.color} />
            {event.venue}{event.city ? `, ${event.city}` : ''}
          </p>
        ) : null}

        {event.description ? (
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.52)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            {event.description}
          </p>
        ) : null}

        <span style={{ marginTop: 'auto', paddingTop: '1.4rem', display: 'inline-flex', alignItems: 'center', gap: '0.55rem', color: badge.color, fontWeight: 800 }}>
          View details <ArrowRight size={16} />
        </span>
      </div>
    </Link>
  )
}

function EventSection({ title, events }) {
  if (!events.length) return null

  return (
    <section style={{ display: 'grid', gap: '1.2rem' }}>
      <h2 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: '1.45rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ background: 'rgba(255,183,3,0.1)', padding: '0.4rem', borderRadius: '8px' }}>
          <Calendar size={20} color="var(--gold, #ffb703)" />
        </span>
        {title}
        <span style={{ fontSize: '0.78rem', color: 'var(--gold, #ffb703)', border: '1px solid rgba(255,183,3,0.2)', padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
          {events.length}
        </span>
      </h2>

      <div className="events-grid-new" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {events.map((event, index) => (
          <EventCard key={event.id || event.slug || event.name} event={event} index={index} />
        ))}
      </div>
    </section>
  )
}

export default async function PortalEventsPage() {
  const nonce = (await headers()).get('x-nonce') || undefined
  const { athlete } = await requirePortalAthlete()
  const allEvents = await getAllEventsLive()
  const assignedEvents = getAssignedPortalEvents(allEvents, athlete.skfId)
  const upcoming = assignedEvents.filter((event) => isUpcomingPortalEvent(event))
  const past = assignedEvents.filter((event) => !isUpcomingPortalEvent(event)).reverse()

  return (
    <div style={{ padding: '2rem 1rem 6rem', maxWidth: '1000px', margin: '0 auto', width: '100%', minHeight: '70vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ paddingTop: '3rem', marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading, "Outfit")',
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          margin: '0 0 0.5rem',
          background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.4) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 10px 30px rgba(0,0,0,0.5)',
        }}>
          Events & Tournaments
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', margin: '0 auto', maxWidth: '620px', fontWeight: 500, lineHeight: 1.6 }}>
          Events assigned to your athlete profile by the SKF admin team.
        </p>
      </div>

      {assignedEvents.length === 0 ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))',
          borderRadius: '28px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '4rem 2rem',
          textAlign: 'center',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Compass size={40} color="rgba(255,255,255,0.4)" strokeWidth={1.5} />
          </div>
          <h2 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: '2rem', color: '#fff', marginBottom: '1rem', fontWeight: 800 }}>No Assigned Events</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '440px', margin: '0 auto', lineHeight: 1.6, fontSize: '1.02rem' }}>
            Your enrolled tournaments, gradings, seminars, and camps will appear here once your Sensei assigns your SKF ID to an event.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          <EventSection title="Upcoming Events" events={upcoming} />
          <EventSection title="Past Events" events={past} />
        </div>
      )}

      <style nonce={nonce} dangerouslySetInnerHTML={{ __html: `
        @keyframes portalEventIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .events-grid-new__card:hover {
          transform: translateY(-6px);
          border-color: rgba(255,255,255,0.16) !important;
        }
      ` }} />
    </div>
  )
}
