'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
    FaCalendarAlt,
    FaMapMarkerAlt,
    FaArrowRight,
    FaFilter,
    FaHistory,
    FaClock,
    FaTrophy,
    FaFire,
    FaUsers,
    FaChevronLeft,
    FaChevronRight,
} from 'react-icons/fa'
import ScrollReveal from '@/app/_components/ScrollReveal'
import { EVENT_TYPE_BADGE_CLASS, EVENT_FILTER_OPTIONS, getEventLabel } from '@/data/constants/categories'

interface EventItem {
    id: string
    rawDate: number
    date: string
    endDate?: string
    title: string
    location: string
    type: string
    desc: string
    cta: string
}

/* ── Countdown Hook ── */
function useCountdown(targetDate: number) {
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

    useEffect(() => {
        function calculate() {
            const diff = Math.max(0, targetDate - Date.now())
            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((diff % (1000 * 60)) / 1000),
            })
        }
        calculate()
        const timer = setInterval(calculate, 1000)
        return () => clearInterval(timer)
    }, [targetDate])

    return timeLeft
}

/* ── Month names ── */
const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
]

const MONTHS_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export default function EventsPageClient({
    upcomingEvents,
    pastEvents,
}: {
    upcomingEvents: EventItem[]
    pastEvents: EventItem[]
}) {
    const [activeFilter, setActiveFilter] = useState('All')
    const [viewMode, setViewMode] = useState<'upcoming' | 'past'>('upcoming')

    const nextEvent = upcomingEvents[0] || null
    const countdown = useCountdown(nextEvent?.rawDate || 0)

    const currentList = viewMode === 'upcoming' ? upcomingEvents : pastEvents

    const filteredEvents = useMemo(() => {
        const list = activeFilter === 'All'
            ? currentList
            : currentList.filter((e) => getEventLabel(e.type) === activeFilter)
        return list
    }, [activeFilter, currentList])

    /* Group events by month-year */
    const groupedEvents = useMemo(() => {
        const groups: { key: string; label: string; events: EventItem[] }[] = []
        const map = new Map<string, EventItem[]>()

        filteredEvents.forEach((e) => {
            const d = new Date(e.rawDate)
            const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
            const label = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
            if (!map.has(key)) {
                map.set(key, [])
                groups.push({ key, label, events: map.get(key)! })
            }
            map.get(key)!.push(e)
        })

        return groups
    }, [filteredEvents])

    const renderDate = (dateString: string) => {
        const parts = dateString.split(' ')
        if (parts.length >= 2) {
            return (
                <>
                    <span className="ev-date__month">{parts[0]}</span>
                    <span className="ev-date__day">{parts[1].replace(',', '')}</span>
                </>
            )
        }
        return <span className="ev-date__full">{dateString}</span>
    }

    const filterOptions = EVENT_FILTER_OPTIONS
    const typeBadgeClass = EVENT_TYPE_BADGE_CLASS

    return (
        <div className="events-page">
            <div className="ev-orb ev-orb--1" />
            <div className="ev-orb ev-orb--2" />
            <div className="ev-watermark">行事</div>

            {/* ═══════ HERO WITH COUNTDOWN ═══════ */}
            <section className="ev-hero">
                <div className="ev-hero__bg" />
                <div className="ev-hero__grid-overlay" />
                <div className="glow glow-red ev-hero__glow-1" />
                <div className="glow glow-gold ev-hero__glow-2" />

                <div className="container ev-hero__content">
                    <span className="section-label">
                        <FaCalendarAlt /> SKF Calendar
                    </span>
                    <h1 className="ev-hero__title">
                        SKF <span className="text-gradient">Events</span>
                    </h1>
                    <p className="ev-hero__subtitle">
                        Elite competitions, technical gradings, and masterclass seminars.
                    </p>

                    {/* Countdown to next event */}
                    {nextEvent && (
                        <div className="ev-countdown">
                            <div className="ev-countdown__label">
                                <FaFire className="ev-countdown__fire" /> Next Event
                            </div>
                            <div className="ev-countdown__timer">
                                <div className="ev-countdown__unit">
                                    <span className="ev-countdown__value">{String(countdown.days).padStart(2, '0')}</span>
                                    <span className="ev-countdown__text">Days</span>
                                </div>
                                <span className="ev-countdown__sep">:</span>
                                <div className="ev-countdown__unit">
                                    <span className="ev-countdown__value">{String(countdown.hours).padStart(2, '0')}</span>
                                    <span className="ev-countdown__text">Hours</span>
                                </div>
                                <span className="ev-countdown__sep">:</span>
                                <div className="ev-countdown__unit">
                                    <span className="ev-countdown__value">{String(countdown.minutes).padStart(2, '0')}</span>
                                    <span className="ev-countdown__text">Min</span>
                                </div>
                                <span className="ev-countdown__sep">:</span>
                                <div className="ev-countdown__unit">
                                    <span className="ev-countdown__value">{String(countdown.seconds).padStart(2, '0')}</span>
                                    <span className="ev-countdown__text">Sec</span>
                                </div>
                            </div>
                            <div className="ev-countdown__event-name">{nextEvent.title}</div>
                            <div className="ev-countdown__event-location">
                                <FaMapMarkerAlt /> {nextEvent.location}
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* ═══════ STICKY TOOLBAR ═══════ */}
            <div className="ev-toolbar">
                <div className="container ev-toolbar__inner">
                    {/* View Mode Toggle */}
                    <div className="ev-toolbar__tabs">
                        <button
                            className={`ev-tab ${viewMode === 'upcoming' ? 'ev-tab--active' : ''}`}
                            onClick={() => setViewMode('upcoming')}
                        >
                            <FaCalendarAlt /> Upcoming
                            {upcomingEvents.length > 0 && (
                                <span className="ev-tab__count">{upcomingEvents.length}</span>
                            )}
                        </button>
                        <button
                            className={`ev-tab ${viewMode === 'past' ? 'ev-tab--active' : ''}`}
                            onClick={() => setViewMode('past')}
                        >
                            <FaHistory /> Past
                            {pastEvents.length > 0 && (
                                <span className="ev-tab__count">{pastEvents.length}</span>
                            )}
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="ev-toolbar__filters">
                        <FaFilter className="ev-toolbar__filter-icon" />
                        {filterOptions.map((f) => (
                            <button
                                key={f}
                                className={`ev-filter ${activeFilter === f ? 'ev-filter--active' : ''}`}
                                onClick={() => setActiveFilter(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ═══════ EVENTS CONTENT ═══════ */}
            <section className="ev-content">
                <div className="container">
                    {/* Empty State */}
                    {filteredEvents.length === 0 && (
                        <ScrollReveal>
                            <div className="ev-empty">
                                <div className="ev-empty__icon">
                                    <FaCalendarAlt />
                                </div>
                                <h3 className="ev-empty__title">No Events Found</h3>
                                <p className="ev-empty__text">
                                    No {viewMode} {activeFilter !== 'All' ? activeFilter : ''} events
                                    scheduled at this time. Check back soon!
                                </p>
                            </div>
                        </ScrollReveal>
                    )}

                    {/* Grouped Timeline */}
                    <div className="ev-timeline">
                        {groupedEvents.map((group, gi) => (
                            <div key={group.key} className="ev-timeline__group">
                                <ScrollReveal delay={gi * 0.05}>
                                    <div className="ev-timeline__month-header">
                                        <div className="ev-timeline__month-dot" />
                                        <h3 className="ev-timeline__month-label">{group.label}</h3>
                                        <span className="ev-timeline__month-count">
                                            {group.events.length} {group.events.length === 1 ? 'Event' : 'Events'}
                                        </span>
                                    </div>
                                </ScrollReveal>

                                <div className="ev-timeline__events">
                                    {group.events.map((e, i) => {
                                        const badgeClass = typeBadgeClass[getEventLabel(e.type)] || typeBadgeClass[e.type] || 'tag-fun'
                                        const isNextEvent = nextEvent && e.id === nextEvent.id

                                        return (
                                            <ScrollReveal key={`${e.id}-${i}`} delay={i * 0.06}>
                                                <div className={`ev-card ${isNextEvent ? 'ev-card--featured' : ''}`}>
                                                    {/* Left: Date */}
                                                    <div className="ev-card__date">
                                                        {renderDate(e.date)}
                                                    </div>

                                                    {/* Timeline Connector */}
                                                    <div className="ev-card__connector">
                                                        <div className={`ev-card__dot ${isNextEvent ? 'ev-card__dot--pulse' : ''}`} />
                                                    </div>

                                                    {/* Right: Content */}
                                                    <div className="ev-card__body">
                                                        <div className="ev-card__top">
                                                            <div className="ev-card__meta">
                                                                <span className={`premium-tag ${badgeClass}`}>
                                                                    {getEventLabel(e.type)}
                                                                </span>
                                                                {isNextEvent && (
                                                                    <span className="ev-card__next-badge">
                                                                        <FaFire /> Next Up
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <h3 className="ev-card__title">{e.title}</h3>
                                                        </div>

                                                        <p className="ev-card__desc">{e.desc}</p>

                                                        <div className="ev-card__footer">
                                                            <div className="ev-card__info">
                                                                <span className="ev-card__info-item">
                                                                    <FaMapMarkerAlt /> {e.location}
                                                                </span>
                                                                <span className="ev-card__info-item">
                                                                    <FaUsers /> Open to All
                                                                </span>
                                                            </div>
                                                            {e.cta && (
                                                                <Link href={e.cta} className="ev-card__cta">
                                                                    View Details <FaArrowRight />
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </ScrollReveal>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
