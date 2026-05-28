import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaArrowRight,
  FaArrowLeft,
  FaMedal,
} from "react-icons/fa"
import { getEventBySlugLive } from "@/lib/server/repositories/events-live"
import { getEventLabel } from "@/data/constants/categories"
import { absoluteMediaUrl, absoluteSiteUrl } from "@/data/constants/siteConfig"
import JsonLdScript from "@/components/JsonLdScript"
import { buildBreadcrumbJsonLd, buildSeoMetadata } from "@/data/constants/seo"
import { getBeltOrder } from "@/data/constants/belts"
import "./event-detail.css"

export const revalidate = 300

type EventParticipant = {
  skfId: string
  athleteName?: string
  branchName?: string
}

type EventResult = EventParticipant & {
  id?: string
  medal?: string
  result?: string
  specialAward?: string
  award?: string
  category?: string
  ageGroup?: string
  weightCategory?: string
  grade?: string | number
  score?: string | number
  doublePromotion?: boolean
  notes?: string
  beltAwarded?: string
  promotion?: string
}

type EventDetail = {
  id?: string
  slug: string
  type: string
  name: string
  description?: string
  date?: string
  venue?: string
  city?: string
  isResultsPublished?: boolean
  participants?: EventParticipant[]
  results?: EventResult[]
}

type RosterEntry = EventParticipant & {
  result: EventResult | null
}

type EventPageProps = {
  params: Promise<{ slug: string }>
}

function formatDate(date: string) {
  if (!date) return null
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function getResultLabel(result: EventResult) {
  if (result.medal) {
    if (result.medal === 'gold') return 'Gold Medal'
    if (result.medal === 'silver') return 'Silver Medal'
    if (result.medal === 'bronze') return 'Bronze Medal'
    if (result.medal === 'participation') return 'Participation'
  }
  if (result.specialAward) return result.specialAward
  if (result.award) return result.award
  if (result.result === "completed") return "Completed"
  if (result.result === "attended") return "Attended"
  if (result.result === "absent") return "Absent"
  if (result.result === "pass") return "Passed"
  if (result.result === "fail") return "Failed"
  return result.result || "Recorded"
}

function getMedalClass(result: EventResult) {
  if (result.medal === 'gold') return 'evd-badge--gold'
  if (result.medal === 'silver') return 'evd-badge--silver'
  if (result.medal === 'bronze') return 'evd-badge--bronze'
  if (result.result === 'pass' || result.result === 'completed' || result.result === 'attended') return 'evd-badge--success'
  if (result.result === 'fail' || result.result === 'absent') return 'evd-badge--muted'
  return 'evd-badge--default'
}

function isGradingEvent(type: string) {
  const t = (type || '').toLowerCase()
  return t.includes('grading') || t.includes('exam') || t.includes('kyu') || t.includes('belt') || t.includes('progressive')
}

export async function generateMetadata({ params }: EventPageProps) {
  const { slug } = await params
  const event = await getEventBySlugLive(slug) as EventDetail | null

  if (!event) {
    return buildSeoMetadata(
      '/events',
      'View SKF Karate events, seminars, camps, gradings, and tournaments for karate students training in kata, kumite, self-defense, and competition skills.'
    )
  }

  return buildSeoMetadata(
    `/events/${event.slug}`,
    `${event.name} at SKF Karate. ${event.description || 'Karate event details for students training in kata, kumite, self-defense, and competition skills.'}`
  )
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params
  const event = await getEventBySlugLive(slug) as EventDetail | null

  if (!event) {
    notFound()
  }

  if (event.type === "tournament") {
    redirect(`/results/${event.slug}`)
  }

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    "name": event.name,
    "startDate": event.date,
    "description": event.description || "SKF Karate event",
    "image": absoluteMediaUrl(),
    "url": absoluteSiteUrl(`/events/${event.slug}`),
    "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
    "eventStatus": "https://schema.org/EventScheduled",
    ...(event.venue && {
      "location": {
        "@type": "Place",
        "name": event.venue,
        "address": event.city,
      },
    }),
    "organizer": { "@type": "Organization", "name": "SKF Karate", "url": absoluteSiteUrl('/') }
  }

  const participants = Array.isArray(event.participants) ? event.participants : []
  const results = Array.isArray(event.results) ? event.results : []
  const hasParticipants = participants.length > 0
  const hasResults = results.length > 0
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(event.name, `/events/${event.slug}`)

  // Merge participants and results into a single list
  const unifiedRosterMap = new Map<string, RosterEntry>()
  participants.forEach(p => {
    unifiedRosterMap.set(p.skfId, { ...p, result: null })
  })
  results.forEach(r => {
    const existing = unifiedRosterMap.get(r.skfId)
    if (existing) {
      unifiedRosterMap.set(r.skfId, { ...existing, result: r })
    } else {
      unifiedRosterMap.set(r.skfId, {
        skfId: r.skfId,
        athleteName: r.athleteName,
        branchName: r.branchName,
        result: r
      })
    }
  })
  const unifiedRosterUnsorted = Array.from(unifiedRosterMap.values())

  // Sort: for grading events, sort by belt rank (highest belt first)
  const isGrading = isGradingEvent(event.type)
  const unifiedRoster = isGrading
    ? unifiedRosterUnsorted.sort((a, b) => {
        const beltA = a.result?.beltAwarded || a.result?.promotion || ''
        const beltB = b.result?.beltAwarded || b.result?.promotion || ''
        const orderA = getBeltOrder(beltA)
        const orderB = getBeltOrder(beltB)
        if (orderB !== orderA) return orderB - orderA // highest belt first
        if (a.result?.doublePromotion && !b.result?.doublePromotion) return -1
        if (!a.result?.doublePromotion && b.result?.doublePromotion) return 1
        return 0
      })
    : unifiedRosterUnsorted

  return (
    <div className="evd-page">
      <JsonLdScript data={breadcrumbJsonLd} />
      <JsonLdScript data={eventSchema} />

      {/* ── AMBIENT EFFECTS ── */}
      <div className="evd-orb evd-orb--1" />
      <div className="evd-orb evd-orb--2" />
      <div className="evd-watermark">道</div>

      {/* ═══════ HERO ═══════ */}
      <section className="evd-hero">
        <div className="evd-hero__grid-overlay" />
        <div className="container evd-hero__inner">
          {/* Back Navigation */}
          <Link href="/events" className="evd-back">
            <FaArrowLeft />
            <span>Back to Events</span>
          </Link>

          {/* Event Type Badge */}
          <span className="evd-hero__type-badge">
            {getEventLabel(event.type)}
          </span>

          {/* Title */}
          <h1 className="evd-hero__title">{event.name}</h1>

          {/* Description */}
          {event.description && (
            <p className="evd-hero__desc">{event.description}</p>
          )}

          {/* Quick Info Pills */}
          <div className="evd-hero__pills">
            {event.date && (
              <div className="evd-pill">
                <FaCalendarAlt className="evd-pill__icon" />
                <span>{formatDate(event.date)}</span>
              </div>
            )}
            {event.venue && (
              <div className="evd-pill">
                <FaMapMarkerAlt className="evd-pill__icon" />
                <span>{event.venue}{event.city ? `, ${event.city}` : ''}</span>
              </div>
            )}
            {event.isResultsPublished && hasParticipants && (
              <div className="evd-pill">
                <FaUsers className="evd-pill__icon" />
                <span>{participants.length} Athletes</span>
              </div>
            )}
          </div>
        </div>
      </section>


      {/* ═══════ RESULTS TABLE ═══════ */}
      {event.isResultsPublished && (hasParticipants || hasResults) && (
        <div className="evd-board-section">
          <div className="evd-card">
            <div className="evd-table-container">
              {/* ── Table Header ── */}
              <div className="evd-lb-thead">
                <div className="evd-lb-th evd-lb-th--rank">#</div>
                <div className="evd-lb-th evd-lb-th--name">Athlete</div>
                <div className="evd-lb-th evd-lb-th--id">SKF ID</div>
                <div className="evd-lb-th evd-lb-th--branch">Branch</div>
                <div className="evd-lb-th evd-lb-th--result">Result</div>
                <div className="evd-lb-th evd-lb-th--belt">Belt Awarded</div>
                <div className="evd-lb-th evd-lb-th--action"></div>
              </div>

              {/* ── Rows ── */}
              <div className="evd-lb-rows">
                {unifiedRoster.map((item, idx) => {
                  const r = item.result
                  const beltLabel = r ? (r.beltAwarded || r.promotion || '').replace(/-/g, ' ') : ''
                  return (
                    <Link key={item.skfId} href={`/athlete/${item.skfId}`} className="evd-lb-row">
                      <div className="evd-lb-cell evd-lb-cell--rank">
                        <span className="evd-lb-rank">{idx + 1}</span>
                      </div>
                      
                      <div className="evd-lb-cell evd-lb-cell--name">
                        <span className="evd-lb-name">{item.athleteName}</span>
                      </div>
                      
                      <div className="evd-lb-cell evd-lb-cell--id">
                        <span className="evd-lb-text">{item.skfId}</span>
                      </div>
                      
                      <div className="evd-lb-cell evd-lb-cell--branch">
                        <span className="evd-lb-text">{item.branchName || '\u2014'}</span>
                      </div>
                      
                      <div className="evd-lb-cell evd-lb-cell--result">
                        {r ? (
                          <span className={`evd-badge ${getMedalClass(r)}`}>
                            <FaMedal className="evd-badge__icon" />
                            {getResultLabel(r)}
                          </span>
                        ) : (
                          <span className="evd-badge evd-badge--muted">
                            —
                          </span>
                        )}
                      </div>

                      <div className="evd-lb-cell evd-lb-cell--belt">
                        {beltLabel ? (
                          <span className="evd-lb-belt-text">{beltLabel}</span>
                        ) : (
                          <span className="evd-lb-text">—</span>
                        )}
                      </div>

                      <div className="evd-lb-cell evd-lb-cell--action">
                        <FaArrowRight className="evd-lb-arrow" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════ EMPTY STATE ═══════ */}
      {!event.isResultsPublished && (
        <div className="container">
          <div className="evd-empty">
            <div className="evd-empty__icon">🥋</div>
            <h3 className="evd-empty__title">Results Not Yet Published</h3>
            <p className="evd-empty__text">
              Results and roster for this event will be available once published. Check back soon!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
