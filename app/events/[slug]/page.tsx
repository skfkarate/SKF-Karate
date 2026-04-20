import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { FaCalendarAlt, FaMapMarkerAlt, FaCity, FaUsers, FaArrowRight, FaMedal } from "react-icons/fa"
import { getEventBySlug } from "@/lib/server/repositories/events"
import "../events.css"

export const dynamic = "force-dynamic"

function formatDate(date: string) {
  if (!date) return null
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function getResultLabel(result: any) {
  if (result.medal) {
    if (result.medal === 'gold') return 'Gold Medal'
    if (result.medal === 'silver') return 'Silver Medal'
    if (result.medal === 'bronze') return 'Bronze Medal'
  }
  if (result.award) return result.award
  if (result.result === "completed") return "Completed"
  if (result.result === "attended") return "Attended"
  if (result.result === "pass") return "Passed"
  if (result.result === "fail") return "Failed"
  return result.result || "Recorded"
}

export async function generateMetadata({ params }: any) {
  const { slug } = await params
  const event = getEventBySlug(slug)

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
  const event = getEventBySlug(slug)

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
  
  // Decide if we should split the screen or go full width
  const showSplit = event.isResultsPublished && hasParticipants && hasResults

  return (
    <div className="ev-detail">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />
      
      {/* ═══════ HERO ═══════ */}
      <section className="ev-detail-hero">
        <div className="ev-detail-hero__bg" />
        <div className="container ev-detail-hero__content">
            <span className="ev-detail-hero__type">
                {event.type.replace(/-/g, ' ')}
            </span>
            <h1 className="ev-detail-hero__title">
                {event.name}
            </h1>
            {event.description && (
                <p className="ev-detail-hero__desc">
                    {event.description}
                </p>
            )}
        </div>
      </section>

      {/* ═══════ META INFO GRID ═══════ */}
      <div className="container">
        <div className="ev-detail-meta">
            {event.date && (
                <div className="ev-meta-card">
                    <div className="ev-meta-card__icon"><FaCalendarAlt /></div>
                    <div className="ev-meta-card__label">Date</div>
                    <div className="ev-meta-card__value">{formatDate(event.date)}</div>
                </div>
            )}
            {event.venue && (
                <div className="ev-meta-card">
                    <div className="ev-meta-card__icon"><FaMapMarkerAlt /></div>
                    <div className="ev-meta-card__label">Venue</div>
                    <div className="ev-meta-card__value">{event.venue}</div>
                </div>
            )}
            {event.city && (
                <div className="ev-meta-card">
                    <div className="ev-meta-card__icon"><FaCity /></div>
                    <div className="ev-meta-card__label">City</div>
                    <div className="ev-meta-card__value">{event.city}</div>
                </div>
            )}
            {event.isResultsPublished && hasParticipants && (
                <div className="ev-meta-card">
                    <div className="ev-meta-card__icon"><FaUsers /></div>
                    <div className="ev-meta-card__label">Participants</div>
                    <div className="ev-meta-card__value">{event.participants.length}</div>
                </div>
            )}
        </div>

        {/* ═══════ ROSTER & RESULTS ═══════ */}
        {event.isResultsPublished && (hasParticipants || hasResults) && (
            <div className={`ev-detail-content ${showSplit ? 'ev-detail-content--split' : ''}`}>
                
                {/* Roster Section */}
                {hasParticipants && (
                    <section className="ev-section">
                        <div className="ev-section__bg-glow" />
                        <div className="ev-section__header">
                            <span className="ev-section__label">Roster</span>
                            <h2 className="ev-section__title">Assigned Athletes</h2>
                        </div>

                        <div className="ev-list">
                            {event.participants.map((participant: any) => (
                                <Link
                                    key={participant.registrationNumber}
                                    href={`/athlete/${participant.registrationNumber}`}
                                    className="ev-list-item"
                                >
                                    <div className="ev-list-item__left">
                                        <h3 className="ev-list-item__name">{participant.athleteName}</h3>
                                        <span className="ev-list-item__meta">
                                            {participant.registrationNumber} · {participant.branchName}
                                        </span>
                                    </div>
                                    <div className="ev-list-item__action">
                                        View <FaArrowRight />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Results Section */}
                {hasResults && (
                    <section className="ev-section">
                        <div className="ev-section__bg-glow" style={{ background: 'radial-gradient(circle, rgba(255, 183, 3, 0.05) 0%, transparent 70%)' }} />
                        <div className="ev-section__header">
                            <span className="ev-section__label" style={{ color: 'var(--gold)' }}>Results</span>
                            <h2 className="ev-section__title">Outcomes & Awards</h2>
                        </div>

                        <div className="ev-list">
                            {event.results.map((result: any) => (
                                <div
                                    key={`${result.registrationNumber}-${result.id || result.award || result.medal}`}
                                    className="ev-list-item"
                                >
                                    <div className="ev-list-item__left">
                                        <Link href={`/athlete/${result.registrationNumber}`}>
                                            <h3 className="ev-list-item__name">{result.athleteName}</h3>
                                        </Link>
                                        <span className="ev-list-item__meta">
                                            {result.registrationNumber}
                                        </span>
                                    </div>
                                    
                                    <div className="ev-list-item__right">
                                        <span className="ev-result-badge">
                                            <FaMedal style={{ display: 'inline-block', marginRight: '4px', position: 'relative', top: '-1px' }} />
                                            {getResultLabel(result)}
                                        </span>
                                        {result.promotion && (
                                            <span className="ev-promotion-badge">
                                                Promoted to {result.promotion.replace(/-/g, ' ')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        )}
      </div>
    </div>
  )
}
