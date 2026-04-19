'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { FaArrowLeft, FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaClock, FaPhoneAlt, FaWhatsapp, FaTrophy, FaUsers, FaDumbbell } from 'react-icons/fa'
import { GiBlackBelt } from 'react-icons/gi'
import { useTrialModal } from '@/app/_components/TrialModalContext'
import { type Branch, formatClassDays, formatClassDaysFull, generateCalendar, getMonthName } from '@/lib/classesData'

interface TopPerformer {
    name: string
    category: string
    medals: string
    points: number
}

interface BranchDetailClientProps {
    branch: Branch
    cityName: string
    citySlug: string
    topPerformers?: TopPerformer[]
}

export default function BranchDetailClient({ branch, cityName, citySlug, topPerformers = [] }: BranchDetailClientProps) {
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
            <section className="section section--tint-cool" style={{ padding: '2rem 0 4rem' }}>
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

                    {/* ═══════ TRAINING PROGRAMS (NEW SPLIT DESIGN) ═══════ */}
                    <div style={{ marginTop: '5rem', marginBottom: '3rem' }}>
                        <div className="text-center" style={{ marginBottom: '3rem' }}>
                            <span className="section-label"><FaDumbbell /> Training Options</span>
                            <h2 className="section-title">
                                Choose Your <span className="text-gradient">Path</span>
                            </h2>
                            <p className="section-subtitle" style={{ maxWidth: '600px', margin: '0 auto' }}>
                                We offer traditional group classes for community learning, and specialized personal training for accelerated focus.
                            </p>
                        </div>
                        
                        <div className="programs-split" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'stretch' }}>
                            
                            {/* Option 1: Group Classes */}
                            <div className="program-card group-training" style={{ background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(255,183,3,0.1)', color: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                        <FaUsers />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.2rem', fontFamily: 'var(--font-heading)' }}>Group Training</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Learn alongside fellow martial artists</p>
                                    </div>
                                </div>
                                
                                <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', lineHeight: 1.6 }}>
                                    Join our structured syllabus classes led by {branch.sensei}. Experience the energy of group training, participate in kumite sparring, and progress through the belt system together.
                                </p>

                                {/* Mini Calendar / Schedule inside Group Training */}
                                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '16px', padding: '1.5rem', marginBottom: '2rem' }}>
                                    <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>Regular Schedule</h4>
                                    <p style={{ marginBottom: '0.5rem', fontSize: '0.95rem' }}><FaClock style={{ color: 'var(--gold)', marginRight: '0.5rem' }}/> <strong>{formatClassDaysFull(branch.classDays)}</strong></p>
                                    <p style={{ fontSize: '0.95rem' }}><FaMapMarkerAlt style={{ color: 'var(--gold)', marginRight: '0.5rem' }}/> {branch.classTime}</p>
                                </div>
                                
                                <div style={{ marginTop: 'auto' }}>
                                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => openModal(branch.slug)}>
                                        Book Free Trial Class
                                    </button>
                                </div>
                            </div>

                            {/* Option 2: Personal Training */}
                            <div className="program-card personal-training" style={{ background: 'linear-gradient(135deg, rgba(214, 40, 40, 0.1) 0%, rgba(10, 14, 25, 1) 100%)', borderRadius: '24px', border: '1px solid rgba(214,40,40,0.3)', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(214,40,40,0.2)', color: 'var(--crimson-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                                        <GiBlackBelt />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.2rem', fontFamily: 'var(--font-heading)' }}>Personal Training</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Exclusive 1-on-1 elite coaching</p>
                                    </div>
                                </div>
                                
                                <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', lineHeight: 1.6 }}>
                                    Accelerate your learning curve with personalized attention from our certified Black Belt instructors. Perfect for rapid belt progression, intense competition preparation, or specialized self-defense mastery.
                                </p>

                                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', color: '#fff', opacity: 0.9 }}>
                                    <li style={{ marginBottom: '0.5rem' }}>✓ Customized training syllabus</li>
                                    <li style={{ marginBottom: '0.5rem' }}>✓ Flexible timing based on your schedule</li>
                                    <li style={{ marginBottom: '0.5rem' }}>✓ Exclusive focus on Kata & Kumite refinement</li>
                                    <li style={{ marginBottom: '0.5rem' }}>✓ Immediate feedback and technique correction</li>
                                </ul>
                                
                                <div style={{ marginTop: 'auto' }}>
                                    <a 
                                        href={`https://wa.me/${branch.whatsapp}?text=Hi! I am interested in Personal Training at the ${branch.name} branch. Can you provide details?`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-secondary" 
                                        style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)' }}
                                    >
                                        <FaWhatsapp /> Enquire for PT
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══════ BRANCH DETAILS & INFO ═══════ */}
                    <div className="branch-detail" style={{ marginTop: '4rem' }}>
                        {/* Instructor & Location Info */}
                        <div className="branch-info" style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            <div className="branch-info-card">
                                <h4 className="branch-info-card__title">Contact Details</h4>
                                <div className="branch-info-item">
                                    <div className="branch-info-item__icon"><FaMapMarkerAlt /></div>
                                    <div className="branch-info-item__text">
                                        <strong>Address</strong>
                                        {branch.address}
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
                                    <div className="branch-info-item__icon" style={{ background: 'rgba(214, 40, 40, 0.1)', color: 'var(--crimson-light)' }}>
                                        <GiBlackBelt />
                                    </div>
                                    <div className="branch-info-item__text">
                                        <strong>Lead Instructor</strong>
                                        {branch.sensei} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>({branch.senseiDan})</span>
                                    </div>
                                </div>
                            </div>

                            {/* Map Card */}
                            <div className="branch-info-card" style={{ padding: '1rem' }}>
                                <h4 className="branch-info-card__title" style={{ marginBottom: '1rem', marginLeft: '0.5rem' }}>Location Map</h4>
                                <div style={{ width: '100%', height: '200px', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.05)' }}>
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
                    {topPerformers && topPerformers.length > 0 && (
                        <div className="branch-performers" style={{ marginTop: '5rem' }}>
                            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                                <span className="section-label" style={{ justifyContent: 'center' }}><FaTrophy /> Branch Standing</span>
                                <h2 className="section-title" style={{ fontSize: '2rem' }}>Top {branch.name} Athletes</h2>
                            </div>
                            <div className="branch-performers__grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                {topPerformers.map((p, i) => (
                                    <div key={i} className="performer-card" style={{ background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '1.5rem', textAlign: 'center' }}>
                                        <div className="performer-card__avatar" style={{ width: 60, height: 60, margin: '0 auto 1rem', background: 'rgba(255,183,3,0.1)', color: 'var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
                                            {p.name.charAt(0)}
                                        </div>
                                        <div className="performer-card__name" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>{p.name}</div>
                                        <div className="performer-card__category" style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{p.category}</div>
                                        <div className="performer-card__medals" style={{ fontSize: '1.2rem', letterSpacing: '4px' }}>{p.medals}</div>
                                        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Points: {p.points.toFixed(0)}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                                <Link href="/honours" className="btn btn-secondary">
                                    View Academy Honours Board →
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
