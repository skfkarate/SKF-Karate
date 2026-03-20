'use client'
import { useState } from 'react'
import Link from 'next/link'
import { FaCalendarAlt, FaMapMarkerAlt, FaTrophy, FaArrowRight, FaUsers, FaFilter } from 'react-icons/fa'
import ScrollReveal from '../components/ScrollReveal'

const typeBadgeClass = {
    Camp: 'tag-camp',
    Grading: 'tag-grading',
    Tournament: 'tag-tournament',
    'PELT Exam': 'tag-seminar',
    Seminar: 'tag-seminar',
    Fun: 'tag-fun',
}

const filterOptions = ['All', 'Camp', 'Grading', 'Tournament', 'PELT Exam', 'Seminar', 'Fun']

export default function EventsClient({ upcomingEvents, pastEvents }) {
    const [activeFilter, setActiveFilter] = useState('All')

    const filteredEvents = activeFilter === 'All'
        ? upcomingEvents
        : upcomingEvents.filter((e) => e.type === activeFilter)

    const renderDate = (dateString) => {
        const parts = dateString.split(' ')
        if (parts.length >= 2) {
            return (
                <>
                    <span className="date-month">{parts[0]}</span>
                    <span className="date-day">{parts[1].replace(',', '')}</span>
                </>
            )
        }
        return <span className="date-full">{dateString}</span>
    }

    return (
        <div className="events-page">
            {/* HERO */}
            <section className="events-hero">
                <div className="events-hero__background">
                    <div className="events-hero__glow events-hero__glow--1"></div>
                    <div className="events-hero__glow events-hero__glow--2"></div>
                </div>
                <div className="container events-hero__content">
                    <span className="premium-badge"><FaCalendarAlt /> Official Calendar</span>
                    <h1 className="display-title">SKF <span className="text-gradient-gold">Events</span></h1>
                    <p className="events-hero__subtitle">Competitions, Gradings, Camps & Seminars</p>
                </div>
            </section>

            {/* UPCOMING */}
            <section className="section upcoming-section">
                <div className="container">
                    <ScrollReveal>
                        <div className="section-header">
                            <h2 className="section-title">Upcoming <span className="text-gradient">Schedule</span></h2>
                            <p className="section-desc">Mark your calendars for these important upcoming academy events.</p>
                        </div>
                    </ScrollReveal>

                    {/* FILTER PILLS */}
                    <ScrollReveal delay={0.1}>
                        <div className="filter-bar">
                            <FaFilter className="filter-bar__icon" />
                            {filterOptions.map((f) => (
                                <button
                                    key={f}
                                    className={`filter-pill ${activeFilter === f ? 'filter-pill--active' : ''}`}
                                    onClick={() => setActiveFilter(f)}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>
                    </ScrollReveal>

                    <div className="events-timeline">
                        {filteredEvents.length === 0 && (
                            <ScrollReveal>
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>
                                    No upcoming {activeFilter} events scheduled at this time.
                                </p>
                            </ScrollReveal>
                        )}
                        {filteredEvents.map((e, i) => (
                            <ScrollReveal key={`${e.title}-${i}`} delay={i * 0.08}>
                                <div className="event-row">
                                    <div className="event-row__date">
                                        {renderDate(e.date)}
                                    </div>
                                    <div className="event-row__divider">
                                        <div className="dot"></div>
                                    </div>
                                    <div className="event-row__content">
                                        <div className="event-row__header">
                                            <div className="event-row__title-group">
                                                <span className={`premium-tag ${typeBadgeClass[e.type]}`}>{e.type}</span>
                                                <h3>{e.title}</h3>
                                            </div>
                                            {e.cta && <Link href={e.cta} className="btn-action">View Details <FaArrowRight /></Link>}
                                        </div>
                                        <p className="event-row__desc">{e.desc}</p>
                                        <div className="event-row__footer">
                                            <div className="event-meta">
                                                <FaMapMarkerAlt className="meta-icon" />
                                                <span>{e.location}</span>
                                            </div>
                                            <div className="event-meta">
                                                <FaUsers className="meta-icon" />
                                                <span>All Belt Levels</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* PAST RESULTS */}
            <section className="section past-section">
                <div className="container">
                    <ScrollReveal>
                        <div className="section-header text-center">
                            <span className="premium-badge badge-center"><FaTrophy /> Hall of Fame</span>
                            <h2 className="section-title">Recent <span className="text-gradient-gold">Results</span></h2>
                            <p className="section-desc">Celebrating the outstanding achievements of our athletes.</p>
                        </div>
                    </ScrollReveal>

                    <div className="past-results-grid">
                        {pastEvents.map((e, i) => (
                            <ScrollReveal key={i} delay={i * 0.1}>
                                <div className="result-plaque">
                                    <div className="plaque-corner top-left"></div>
                                    <div className="plaque-corner top-right"></div>
                                    <div className="plaque-corner bottom-left"></div>
                                    <div className="plaque-corner bottom-right"></div>
                                    <FaTrophy className="plaque-bg-icon" />
                                    <span className="plaque-date">{e.date}</span>
                                    <h3 className="plaque-title">{e.title}</h3>
                                    <div className="plaque-divider"></div>
                                    <p className="plaque-result">{e.result}</p>
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>

                    <ScrollReveal delay={0.3}>
                        <div className="section-cta">
                            <Link href="/results" className="btn-action btn-action--lg">
                                View All Past Results <FaArrowRight />
                            </Link>
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </div>
    )
}
