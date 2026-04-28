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
  FaStar,
  FaChevronUp,
} from "react-icons/fa"
import { getEventBySlugLive } from "@/lib/server/repositories/events-live"
import { getEventLabel } from "@/data/constants/categories"
import "./event-detail.css"

export const dynamic = "force-dynamic"

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

function getResultLabel(result: any) {
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

function getMedalClass(result: any) {
  if (result.medal === 'gold') return 'evd-badge--gold'
  if (result.medal === 'silver') return 'evd-badge--silver'
  if (result.medal === 'bronze') return 'evd-badge--bronze'
  if (result.result === 'pass' || result.result === 'completed' || result.result === 'attended') return 'evd-badge--success'
  if (result.result === 'fail' || result.result === 'absent') return 'evd-badge--muted'
  return 'evd-badge--default'
}

function getResultMeta(result: any) {
  const parts = []

  if (result.category) parts.push(result.category.replace(/-/g, ' '))
  if (result.ageGroup) parts.push(result.ageGroup.replace(/-/g, ' '))
  if (result.weightCategory) parts.push(result.weightCategory)
  if (result.grade) parts.push(`Grade ${result.grade}`)
  if (result.score === 0 || result.score) parts.push(`Score ${result.score}`)
  if (result.doublePromotion) parts.push('Double promotion')
  if (result.notes) parts.push(result.notes)

  return parts.join(' · ')
}

export async function generateMetadata({ params }: any) {
  const { slug } = await params
  const event = await getEventBySlugLive(slug)

  if (!event) {
    return { title: "Event Not Found | SKF Karate" }
  }

  const imageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://skfkarate.org'}/icon.png`

  return {
    title: `${event.name} | SKF Karate`,
    description: event.description || 'SKF Karate Event Details',
    openGraph: {
      title: `${event.name} | SKF Karate`,
      description: event.description || 'SKF Karate Event Details',
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
      title: `${event.name} | SKF Karate`,
      description: event.description || 'SKF Karate Event Details',
      images: [imageUrl],
    }
  }
}

export default async function EventDetailPage({ params }: any) {
  const { slug } = await params
  const event = await getEventBySlugLive(slug)

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
    ...(event.venue && { "location": { "@type": "Place", "name": event.venue, "address": event.city } }),
    "organizer": { "@type": "Organization", "name": "SKF Karate" }
  }

  const hasParticipants = event.participants && event.participants.length > 0
  const hasResults = event.results && event.results.length > 0
  const dateInfo = event.date ? formatDateShort(event.date) : null

  // Count results by type
  const resultsSummary = hasResults ? {
    total: event.results.length,
    gold: event.results.filter((r: any) => r.medal === 'gold').length,
    silver: event.results.filter((r: any) => r.medal === 'silver').length,
    bronze: event.results.filter((r: any) => r.medal === 'bronze').length,
    passed: event.results.filter((r: any) => r.result === 'pass' || r.result === 'completed').length,
    promotions: event.results.filter((r: any) => r.beltAwarded || r.promotion).length,
  } : null

  return (
    <div className="evd-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />

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
                <span>{event.participants.length} Athletes</span>
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
                <span className="evd-stat-card__value">{formatDate(event.date!)}</span>
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
                <span className="evd-stat-card__value">{event.participants.length}</span>
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
                    <span className="evd-panel__count">{event.participants.length}</span>
                  </div>

                  <div className="evd-panel__divider" />

                  <div className="evd-roster">
                    {event.participants.map((participant: any, idx: number) => (
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
                    <span className="evd-panel__count">{event.results.length}</span>
                  </div>

                  <div className="evd-panel__divider" />

                  <div className="evd-results-list">
                    {event.results.map((result: any, idx: number) => (
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
