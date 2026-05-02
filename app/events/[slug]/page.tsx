import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaCity,
  FaUsers,
  FaArrowRight,
  FaArrowLeft,
  FaMedal,
  FaTrophy,
  FaChevronUp,
} from "react-icons/fa"
import { getEventBySlugLive } from "@/lib/server/repositories/events-live"
import { getEventLabel } from "@/data/constants/categories"
import { absoluteMediaUrl, absoluteSiteUrl } from "@/data/constants/siteConfig"
import JsonLdScript from "@/components/JsonLdScript"
import "./event-detail.css"

export const dynamic = "force-dynamic"

type EventParticipant = {
  registrationNumber: string
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

function formatDateShort(date: string) {
  if (!date) return { day: "", month: "", year: "" }
  const d = new Date(date)
  return {
    day: d.getDate().toString(),
    month: d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
    year: d.getFullYear().toString(),
  }
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

function getResultMeta(result: EventResult) {
  const parts: string[] = []

  if (result.category) parts.push(result.category.replace(/-/g, ' '))
  if (result.ageGroup) parts.push(result.ageGroup.replace(/-/g, ' '))
  if (result.weightCategory) parts.push(result.weightCategory)
  if (result.grade) parts.push(`Grade ${result.grade}`)
  if (result.score === 0 || result.score) parts.push(`Score ${result.score}`)
  if (result.doublePromotion) parts.push('Double promotion')
  if (result.notes) parts.push(result.notes)

  return parts.join(' · ')
}

export async function generateMetadata({ params }: EventPageProps) {
  const { slug } = await params
  const event = await getEventBySlugLive(slug) as EventDetail | null

  if (!event) {
    return { title: 'SKF Karate' }
  }

  const imageUrl = absoluteMediaUrl()
  const canonicalUrl = absoluteSiteUrl(`/events/${event.slug}`)

  return {
    title: 'SKF Karate',
    description: event.description || 'SKF Karate Event Details',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: 'SKF Karate',
      description: event.description || 'SKF Karate Event Details',
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: event.name,
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: 'SKF Karate',
      description: event.description || 'SKF Karate Event Details',
      images: [imageUrl],
    }
  }
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
  const dateInfo = event.date ? formatDateShort(event.date) : null

  // Count results by type
  const resultsSummary = hasResults ? {
    total: results.length,
    gold: results.filter((r) => r.medal === 'gold').length,
    silver: results.filter((r) => r.medal === 'silver').length,
    bronze: results.filter((r) => r.medal === 'bronze').length,
    passed: results.filter((r) => r.result === 'pass' || r.result === 'completed').length,
    promotions: results.filter((r) => r.beltAwarded || r.promotion).length,
  } : null

  return (
    <div className="evd-page">
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

      {/* ═══════ STAT CARDS ═══════ */}
      <div className="container">
        <div className="evd-stats">
          {dateInfo && (
            <div className="evd-stat-card">
              <div className="evd-stat-card__icon">
                <FaCalendarAlt />
              </div>
              <div className="evd-stat-card__content">
                <span className="evd-stat-card__label">Date</span>
                <span className="evd-stat-card__value">{formatDate(event.date)}</span>
              </div>
            </div>
          )}
          {event.venue && (
            <div className="evd-stat-card">
              <div className="evd-stat-card__icon evd-stat-card__icon--crimson">
                <FaMapMarkerAlt />
              </div>
              <div className="evd-stat-card__content">
                <span className="evd-stat-card__label">Venue</span>
                <span className="evd-stat-card__value">{event.venue}</span>
              </div>
            </div>
          )}
          {event.city && (
            <div className="evd-stat-card">
              <div className="evd-stat-card__icon evd-stat-card__icon--blue">
                <FaCity />
              </div>
              <div className="evd-stat-card__content">
                <span className="evd-stat-card__label">City</span>
                <span className="evd-stat-card__value">{event.city}</span>
              </div>
            </div>
          )}
          {event.isResultsPublished && hasParticipants && (
            <div className="evd-stat-card">
              <div className="evd-stat-card__icon evd-stat-card__icon--green">
                <FaUsers />
              </div>
              <div className="evd-stat-card__content">
                <span className="evd-stat-card__label">Athletes</span>
                <span className="evd-stat-card__value">{participants.length}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════ DASHBOARD ═══════ */}
      {event.isResultsPublished && (hasParticipants || hasResults) && (
        <div className="container">
          <div className="evd-dashboard">
            <div className="evd-dashboard__glow" />

            {/* ── Results Summary Strip ── */}
            {resultsSummary && (resultsSummary.gold > 0 || resultsSummary.silver > 0 || resultsSummary.bronze > 0) && (
              <div className="evd-medal-strip">
                {resultsSummary.gold > 0 && (
                  <div className="evd-medal-stat">
                    <span className="evd-medal-stat__dot evd-medal-stat__dot--gold" />
                    <span className="evd-medal-stat__count evd-medal-stat__count--gold">{resultsSummary.gold}</span>
                    <span className="evd-medal-stat__label">Gold</span>
                  </div>
                )}
                {resultsSummary.silver > 0 && (
                  <>
                    <div className="evd-medal-strip__divider" />
                    <div className="evd-medal-stat">
                      <span className="evd-medal-stat__dot evd-medal-stat__dot--silver" />
                      <span className="evd-medal-stat__count evd-medal-stat__count--silver">{resultsSummary.silver}</span>
                      <span className="evd-medal-stat__label">Silver</span>
                    </div>
                  </>
                )}
                {resultsSummary.bronze > 0 && (
                  <>
                    <div className="evd-medal-strip__divider" />
                    <div className="evd-medal-stat">
                      <span className="evd-medal-stat__dot evd-medal-stat__dot--bronze" />
                      <span className="evd-medal-stat__count evd-medal-stat__count--bronze">{resultsSummary.bronze}</span>
                      <span className="evd-medal-stat__label">Bronze</span>
                    </div>
                  </>
                )}
                {resultsSummary.promotions > 0 && (
                  <>
                    <div className="evd-medal-strip__divider" />
                    <div className="evd-medal-stat">
                      <FaChevronUp className="evd-medal-stat__icon evd-medal-stat__icon--green" />
                      <span className="evd-medal-stat__count evd-medal-stat__count--green">{resultsSummary.promotions}</span>
                      <span className="evd-medal-stat__label">Promotions</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ── Content Grid ── */}
            <div className={`evd-dashboard__grid ${hasParticipants && hasResults ? 'evd-dashboard__grid--split' : ''}`}>

              {/* ── Roster Panel ── */}
              {hasParticipants && (
                <section className="evd-panel">
                  <div className="evd-panel__header">
                    <div className="evd-panel__header-left">
                      <FaUsers className="evd-panel__header-icon" />
                      <div>
                        <span className="evd-panel__tag">Roster</span>
                        <h2 className="evd-panel__title">Assigned Athletes</h2>
                      </div>
                    </div>
                    <span className="evd-panel__count">{participants.length}</span>
                  </div>

                  <div className="evd-panel__divider" />

                  <div className="evd-roster">
                    {participants.map((participant, idx) => (
                      <Link
                        key={participant.registrationNumber}
                        href={`/athlete/${participant.registrationNumber}`}
                        className="evd-roster__row"
                      >
                        <span className="evd-roster__index">{String(idx + 1).padStart(2, '0')}</span>
                        <div className="evd-roster__avatar">
                          {participant.athleteName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="evd-roster__info">
                          <h3 className="evd-roster__name">{participant.athleteName}</h3>
                          <span className="evd-roster__meta">
                            {participant.registrationNumber}
                            {participant.branchName && <> · {participant.branchName}</>}
                          </span>
                        </div>
                        <div className="evd-roster__arrow">
                          <FaArrowRight />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* ── Results Panel ── */}
              {hasResults && (
                <section className="evd-panel evd-panel--results">
                  <div className="evd-panel__header">
                    <div className="evd-panel__header-left">
                      <FaTrophy className="evd-panel__header-icon evd-panel__header-icon--gold" />
                      <div>
                        <span className="evd-panel__tag evd-panel__tag--gold">Results</span>
                        <h2 className="evd-panel__title">Outcomes & Awards</h2>
                      </div>
                    </div>
                    <span className="evd-panel__count">{results.length}</span>
                  </div>

                  <div className="evd-panel__divider" />

                  <div className="evd-results-list">
                    {results.map((result, idx) => (
                      <div
                        key={`${result.registrationNumber}-${result.id || result.award || result.medal || idx}`}
                        className="evd-result-row"
                      >
                        <span className="evd-result-row__index">{String(idx + 1).padStart(2, '0')}</span>
                        <div className="evd-result-row__avatar">
                          {result.athleteName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="evd-result-row__info">
                          <Link href={`/athlete/${result.registrationNumber}`} className="evd-result-row__name">
                            {result.athleteName}
                          </Link>
                          <span className="evd-result-row__meta">
                            {result.registrationNumber}
                            {getResultMeta(result) && <> · {getResultMeta(result)}</>}
                          </span>
                        </div>
                        <div className="evd-result-row__badges">
                          <span className={`evd-badge ${getMedalClass(result)}`}>
                            <FaMedal className="evd-badge__icon" />
                            {getResultLabel(result)}
                          </span>
                          {(result.beltAwarded || result.promotion) && (
                            <span className="evd-badge evd-badge--promotion">
                              <FaChevronUp className="evd-badge__icon" />
                              {(result.beltAwarded || result.promotion).replace(/-/g, ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
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
