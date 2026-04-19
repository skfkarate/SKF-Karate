'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { FaArrowLeft, FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaClock, FaPhoneAlt, FaWhatsapp, FaTrophy } from 'react-icons/fa'
import { GiBlackBelt } from 'react-icons/gi'
import { useTrialModal } from '@/app/_components/TrialModalContext'
import { type Branch, formatClassDays, formatClassDaysFull, generateCalendar, getMonthName } from '@/lib/classesData'

interface BranchDetailClientProps {
    branch: Branch
    cityName: string
    citySlug: string
}

export default function BranchDetailClient({ branch, cityName, citySlug }: BranchDetailClientProps) {
    const { openModal } = useTrialModal()
    const now = new Date()
    const [calYear, setCalYear] = useState(now.getFullYear())
    const [calMonth, setCalMonth] = useState(now.getMonth())

    const calendarWeeks = generateCalendar(calYear, calMonth, branch.classDays)

    const prevMonth = () => {
        if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1) }
        else setCalMonth(calMonth - 1)
    }

    const nextMonth = () => {
        if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1) }
        else setCalMonth(calMonth + 1)
    }

    // Placeholder top performers (will be dynamic from admin later)
    const performers = [
        { name: 'Athlete 1', category: 'Junior Kata', medals: '🥇🥈' },
        { name: 'Athlete 2', category: 'Cadet Kumite', medals: '🥇🥉' },
        { name: 'Athlete 3', category: 'Senior Kata', medals: '🥈🥈' },
    ]

    return (
        <div className="classes-page">
            {/* ═══════ HERO ═══════ */}
            <section className="page-hero">
                <div className="page-hero__bg"></div>
                <div className="glow glow-red page-hero__glow-1"></div>
                <div className="glow glow-gold page-hero__glow-2"></div>
                <div className="container page-hero__content">
                    <Link href={`/classes/${citySlug}`} className="city-back"><FaArrowLeft /> {cityName}</Link>
                    <h1 className="page-hero__title">
                        <span className="text-gradient">{branch.name}</span>
                        {branch.isHQ && <span style={{ display: 'block', fontSize: '0.9rem', letterSpacing: '3px', color: 'var(--text-muted)', marginTop: '0.3rem' }}>HEADQUARTERS</span>}
                    </h1>
                    <p className="page-hero__subtitle">{branch.address}</p>
                </div>
            </section>

            {/* ═══════ PHOTO GRID ═══════ */}
            <section className="section section--tint-cool" style={{ paddingTop: '2rem' }}>
                <div className="container">
                    <div className="branch-photos">
                        {(branch.photos.length > 0 ? branch.photos : ['/gallery/In Dojo.jpeg']).slice(0, 3).map((photo, i) => (
                            <div key={i} className="branch-photos__item">
                                <Image
                                    src={photo}
                                    alt={`${branch.name} dojo photo ${i + 1}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* ═══════ CALENDAR + INFO SIDEBAR ═══════ */}
                    <div className="branch-detail">

                        {/* Left: Calendar */}
                        <div className="branch-calendar">
                            <div className="branch-calendar__header">
                                <h3 className="branch-calendar__title">Class Schedule</h3>
                                <div className="branch-calendar__nav">
                                    <button className="branch-calendar__nav-btn" onClick={prevMonth} aria-label="Previous month">
                                        <FaChevronLeft />
                                    </button>
                                    <button className="branch-calendar__nav-btn" onClick={nextMonth} aria-label="Next month">
                                        <FaChevronRight />
                                    </button>
                                </div>
                            </div>

                            <div className="branch-calendar__month">
                                {getMonthName(calMonth)} {calYear}
                            </div>

                            <div className="branch-calendar__schedule-info">
                                Every <strong>{formatClassDays(branch.classDays)}</strong> · {branch.classTime}
                            </div>

                            {/* Calendar grid */}
                            <div className="cal-grid">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                    <div key={d} className="cal-header">{d}</div>
                                ))}
                                {calendarWeeks.flat().map((cell, i) => {
                                    if (!cell.isCurrentMonth) {
                                        return <div key={i} className="cal-cell cal-cell--empty" />
                                    }

                                    let className = 'cal-cell cal-cell--day'
                                    if (cell.isClassDay) className += ' cal-cell--class'
                                    if (cell.isToday) className += ' cal-cell--today'

                                    return (
                                        <div key={i} className={className}>
                                            {cell.date}
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="cal-legend">
                                <span><span className="cal-legend__dot cal-legend__dot--class" /> Class day</span>
                                <span><span className="cal-legend__dot cal-legend__dot--today" /> Today</span>
                            </div>
                        </div>

                        {/* Right: Info sidebar */}
                        <div className="branch-info">
                            {/* Contact card */}
                            <div className="branch-info-card">
                                <h4 className="branch-info-card__title">Branch Details</h4>

                                <div className="branch-info-item">
                                    <div className="branch-info-item__icon"><FaMapMarkerAlt /></div>
                                    <div className="branch-info-item__text">
                                        <strong>Address</strong>
                                        {branch.address}
                                    </div>
                                </div>

                                <div className="branch-info-item">
                                    <div className="branch-info-item__icon"><FaClock /></div>
                                    <div className="branch-info-item__text">
                                        <strong>Schedule</strong>
                                        {formatClassDaysFull(branch.classDays)}<br />
                                        {branch.classTime}
                                    </div>
                                </div>

                                <div className="branch-info-item">
                                    <div className="branch-info-item__icon"><FaPhoneAlt /></div>
                                    <div className="branch-info-item__text">
                                        <strong>Phone</strong>
                                        <a href={`tel:${branch.phone}`}>{branch.phone}</a>
                                    </div>
                                </div>

                                <div className="branch-info-item">
                                    <div className="branch-info-item__icon"><FaWhatsapp /></div>
                                    <div className="branch-info-item__text">
                                        <strong>WhatsApp</strong>
                                        <a href={`https://wa.me/${branch.whatsapp}`} target="_blank" rel="noopener noreferrer">
                                            Chat with us →
                                        </a>
                                    </div>
                                </div>

                                <div className="branch-info-item">
                                    <div className="branch-info-item__icon" style={{ background: 'rgba(214, 40, 40, 0.1)', color: 'var(--crimson-light)' }}>
                                        <GiBlackBelt />
                                    </div>
                                    <div className="branch-info-item__text">
                                        <strong>Lead Instructor</strong>
                                        {branch.sensei}<br />
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{branch.senseiDan}</span>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary branch-info__cta"
                                    onClick={() => openModal(branch.slug)}
                                >
                                    Book Free Trial
                                </button>
                            </div>

                            {/* Map Card */}
                            <div className="branch-info-card" style={{ marginTop: '1.5rem', padding: '1rem' }}>
                                <h4 className="branch-info-card__title" style={{ marginBottom: '1rem', marginLeft: '0.5rem' }}>Location Map</h4>
                                <div style={{ width: '100%', height: '250px', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <iframe 
                                        width="100%" 
                                        height="100%" 
                                        style={{ border: 0 }} 
                                        loading="lazy" 
                                        allowFullScreen 
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={`https://www.google.com/maps?q=${encodeURIComponent(branch.address)}&output=embed`}
                                    ></iframe>
                                </div>
                                {branch.mapUrl && (
                                    <a href={branch.mapUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--gold)', fontWeight: 600 }}>
                                        Open in Google Maps →
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ═══════ TOP PERFORMERS ═══════ */}
                    <div className="branch-performers">
                        <div style={{ marginBottom: '1.5rem' }}>
                            <span className="section-label"><FaTrophy /> Champions</span>
                            <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Top Performers — {branch.name}</h2>
                        </div>
                        <div className="branch-performers__grid">
                            {performers.map((p, i) => (
                                <div key={i} className="performer-card">
                                    <div className="performer-card__avatar">{p.name[0]}</div>
                                    <div className="performer-card__name">{p.name}</div>
                                    <div className="performer-card__category">{p.category}</div>
                                    <div className="performer-card__medals">{p.medals}</div>
                                </div>
                            ))}
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <Link href="/rankings" style={{ color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 600 }}>
                                View Full Rankings →
                            </Link>
                        </div>
                    </div>

                    {/* ═══════ FINAL CTA ═══════ */}
                    <div className="branch-final-cta">
                        <h3>Ready to Start at {branch.name}?</h3>
                        <p>Book a free trial class — no commitment, just show up and train.</p>
                        <div className="branch-final-cta__actions">
                            <button className="btn btn-primary" onClick={() => openModal(branch.slug)}>
                                Book Free Trial
                            </button>
                            <a
                                href={`https://wa.me/${branch.whatsapp}?text=Hi! I'd like to book a free trial class at ${branch.name}.`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-secondary"
                            >
                                <FaWhatsapp /> WhatsApp Us
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
