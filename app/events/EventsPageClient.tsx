'use client'
import { useState, Suspense } from 'react'
import Link from 'next/link'
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaArrowRight, FaFilter, FaTrophy } from 'react-icons/fa'
import ScrollReveal from '@/app/_components/ScrollReveal'
import ResultsPageClient from '@/app/_components/results/ResultsPageClient'
import '@/app/rankings/rankings.css' // Reuse tab UI styling

const typeBadgeClass: Record<string, string> = {
    Camp: 'tag-camp',
    Grading: 'tag-grading',
    Tournament: 'tag-tournament',
    'pelt-exam': 'tag-seminar',
    Seminar: 'tag-seminar',
    Fun: 'tag-fun',
}

const getEventLabel = (type: string) => {
    if (type === 'tournament') return 'Tournament'
    if (type === 'seminar') return 'Seminar'
    if (type === 'pelt-exam') return 'PELT Exam'
    if (type === 'grading') return 'Grading'
    if (type === 'camp') return 'Camp'
    return type
}

const filterOptions = ['All', 'Camp', 'Grading', 'Tournament', 'PELT Exam', 'Seminar', 'Fun']

export default function EventsPageClient({ upcomingEvents, resultsData }: any) {
    const [activeMainTab, setActiveMainTab] = useState<'upcoming' | 'results'>('upcoming')
    const [activeFilter, setActiveFilter] = useState('All')

    const filteredEvents = activeFilter === 'All'
        ? upcomingEvents
        : upcomingEvents.filter((e: any) => getEventLabel(e.type) === activeFilter)

    const renderDate = (dateString: string) => {
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
            {/* HERO & TABS */}
            <section className="rankings-hero" style={{ background: 'linear-gradient(180deg, #111 0%, #1a1a2e 100%)' }}>
                <div className="rankings-hero__bg">
                    <div className="glow glow-red rankings-hero__glow-1"></div>
                    <div className="glow glow-gold rankings-hero__glow-2"></div>
                </div>
                
                <div className="container rankings-hero__content">
                    <span className="section-label"><FaCalendarAlt /> Calendar & Results</span>
                    <h1 className="rankings-hero__title">
                        SKF <span className="text-gradient">Events</span>
                    </h1>
                    <p className="rankings-hero__subtitle">
                        Upcoming schedule and historic competition results.
                    </p>

                    <div className="rankings-tabs-nav">
                        <button 
                            className={`rankings-tab-btn ${activeMainTab === 'upcoming' ? 'active' : ''}`}
                            onClick={() => setActiveMainTab('upcoming')}
                        >
                            <FaCalendarAlt /> Upcoming Schedule
                        </button>
                        <button 
                            className={`rankings-tab-btn ${activeMainTab === 'results' ? 'active' : ''}`}
                            onClick={() => setActiveMainTab('results')}
                        >
                            <FaTrophy /> Past Results
                        </button>
                    </div>
                </div>
            </section>

            {/* TAB: UPCOMING EVENTS */}
            {activeMainTab === 'upcoming' && (
                <section className="rankings-tab-content active" style={{ padding: '4rem 0 8rem' }}>
                    <div className="container">
                        <ScrollReveal>
                            <div className="section-header">
                                <h2 className="section-title">Upcoming <span className="text-gradient">Schedule</span></h2>
                                <p className="section-desc" style={{ color: 'var(--text-muted)' }}>Mark your calendars for these important upcoming academy events.</p>
                            </div>
                        </ScrollReveal>

                        <ScrollReveal delay={0.1}>
                            <div className="filter-bar" style={{ justifyContent: 'center', marginBottom: '3rem' }}>
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

                        <div className="events-timeline" style={{ maxWidth: '800px', margin: '0 auto' }}>
                            {filteredEvents.length === 0 && (
                                <ScrollReveal>
                                    <p className="center-text text-muted" style={{ padding: '3rem', textAlign: 'center' }}>
                                        No upcoming {activeFilter !== 'All' ? activeFilter : ''} events scheduled at this time.
                                    </p>
                                </ScrollReveal>
                            )}
                            {filteredEvents.map((e: any, i: number) => (
                                <ScrollReveal key={`${e.title}-${i}`} delay={i * 0.08}>
                                    <div className="event-row" style={{ background: 'var(--bg-card)', border: 'var(--border-glass)', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', gap: '2rem' }}>
                                        <div className="event-row__date" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '80px', color: 'var(--gold)' }}>
                                            {renderDate(e.date)}
                                        </div>
                                        <div className="event-row__content" style={{ flex: 1 }}>
                                            <div className="event-row__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                <div>
                                                    <span className={`premium-tag ${typeBadgeClass[getEventLabel(e.type)] || typeBadgeClass[e.type] || 'tag-fun'}`} style={{ display: 'inline-block', marginBottom: '0.5rem', fontSize: '0.7rem' }}>
                                                        {getEventLabel(e.type)}
                                                    </span>
                                                    <h3 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>{e.title}</h3>
                                                </div>
                                                {e.cta && <Link href={e.cta} className="btn-action">View <FaArrowRight /></Link>}
                                            </div>
                                            <p className="event-row__desc" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{e.desc}</p>
                                            <div className="event-row__footer" style={{ display: 'flex', gap: '1.5rem', fontSize: '0.8rem', color: 'var(--text-light)' }}>
                                                <div className="event-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <FaMapMarkerAlt /> <span>{e.location}</span>
                                                </div>
                                                <div className="event-meta" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <FaUsers /> <span>All Belt Levels</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* TAB: RESULTS */}
            {activeMainTab === 'results' && (
                <div className="rankings-tab-content active view-dashboard-wrapper">
                    <Suspense fallback={<div>Loading Results...</div>}>
                        <ResultsPageClient 
                            allTournaments={resultsData.allTournaments}
                            stats={resultsData.stats}
                            availableYears={resultsData.availableYears}
                        />
                    </Suspense>
                </div>
            )}
        </div>
    )
}
