'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { FaArrowLeft, FaChevronLeft, FaChevronRight, FaMapMarkerAlt, FaClock, FaPhoneAlt, FaWhatsapp, FaTrophy, FaCheckCircle, FaUserTie } from 'react-icons/fa'
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

    // Force exactly 3 photos for the bento layout
    const bentoPhotos = [
        branch.photos[0] || '/gallery/In Dojo.jpeg',
        branch.photos[1] || branch.photos[0] || '/gallery/In Dojo.jpeg',
        branch.photos[2] || branch.photos[1] || branch.photos[0] || '/gallery/In Dojo.jpeg'
    ]

    return (
        <div style={{ background: '#05080f', minHeight: '100vh', paddingBottom: '4rem' }}>
            {/* Scoped CSS for responsive bento and cinematic blocks */}
            <style jsx>{`
                .bento-gallery {
                    display: grid;
                    grid-template-columns: 3fr 2fr;
                    gap: 8px;
                    height: 70vh;
                    min-height: 500px;
                    max-height: 800px;
                    width: 100%;
                }
                .bento-left {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: #111;
                }
                .bento-right {
                    display: grid;
                    grid-template-rows: 1fr 1fr;
                    gap: 8px;
                    height: 100%;
                }
                .bento-right-item {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: #111;
                }
                
                .cinematic-section {
                    display: flex;
                    align-items: center;
                    gap: 4rem;
                    padding: 8rem 0;
                }
                .cinematic-section.reverse {
                    flex-direction: row-reverse;
                }
                .cinematic-content {
                    flex: 1;
                }
                .cinematic-visual {
                    flex: 1;
                    /* Visual anchor for the right side */
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.05);
                    border-radius: 24px;
                    padding: 3rem;
                    position: relative;
                    overflow: hidden;
                }
                
                @media (max-width: 992px) {
                    .cinematic-section, .cinematic-section.reverse {
                        flex-direction: column;
                        padding: 4rem 0;
                        gap: 3rem;
                    }
                    .cinematic-visual {
                        width: 100%;
                    }
                    .bento-gallery {
                        grid-template-columns: 1fr;
                        grid-template-rows: 2fr 1fr 1fr;
                        height: 100vh;
                    }
                    .bento-right {
                        display: contents; /* unwrap the nested grid on mobile if desired, or keep it */
                    }
                }
            `}</style>

            {/* ═══════ HEADER (Minimalist) ═══════ */}
            <header className="container" style={{ paddingTop: '8rem', paddingBottom: '2rem' }}>
                <Link 
                    href={`/classes/${citySlug}`} 
                    style={{ 
                        color: 'rgba(255,255,255,0.5)', 
                        textDecoration: 'none', 
                        fontSize: '0.9rem', 
                        letterSpacing: '1px',
                        display: 'inline-flex', 
                        alignItems: 'center',
                        marginBottom: '1.5rem',
                        transition: 'color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.color = '#fff'}
                    onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                >
                    <FaArrowLeft style={{ marginRight: '0.5rem' }} /> BACK TO {cityName.toUpperCase()}
                </Link>
                <h1 style={{ 
                    fontSize: 'clamp(3.5rem, 6vw, 6rem)', 
                    fontWeight: 900, 
                    lineHeight: 1, 
                    margin: 0, 
                    fontFamily: 'var(--font-heading)',
                    letterSpacing: '-1px',
                    color: '#fff'
                }}>
                    {branch.name}
                </h1>
                {branch.isHQ && (
                    <div style={{ marginTop: '1rem', display: 'inline-block', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.8rem', letterSpacing: '2px', fontWeight: 700, textTransform: 'uppercase' }}>
                        National Headquarters
                    </div>
                )}
            </header>

            {/* ═══════ BENTO GALLERY ═══════ */}
            <div className="bento-gallery">
                <div className="bento-left">
                    <Image 
                        src={bentoPhotos[0]} 
                        alt={`${branch.name} main view`} 
                        fill 
                        sizes="(max-width: 992px) 100vw, 60vw"
                        style={{ objectFit: 'cover' }}
                        priority 
                    />
                </div>
                <div className="bento-right">
                    <div className="bento-right-item">
                        <Image 
                            src={bentoPhotos[1]} 
                            alt={`${branch.name} secondary view`} 
                            fill 
                            sizes="(max-width: 992px) 100vw, 40vw"
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                    <div className="bento-right-item">
                        <Image 
                            src={bentoPhotos[2]} 
                            alt={`${branch.name} details view`} 
                            fill 
                            sizes="(max-width: 992px) 100vw, 40vw"
                            style={{ objectFit: 'cover' }}
                        />
                    </div>
                </div>
            </div>

            {/* ═══════ CINEMATIC TRAINING BLOCKS ═══════ */}
            
            {/* --- GROUP TRAINING MODULE --- */}
            <section style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="container cinematic-section">
                    <div className="cinematic-content">
                        <span style={{ color: 'var(--gold)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>
                            Community Learning
                        </span>
                        <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>
                            Group Training
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '600px' }}>
                            Experience the raw energy of collective progression. Our group classes follow the structured WKF syllabus led meticulously by {branch.sensei}. Test your skills in kumite sparring cycles and ascend the belt ranks alongside dedicated martial artists pursuing the same mastery.
                        </p>
                        
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2.5rem' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1.2rem', borderRadius: '100px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaCheckCircle style={{ color: 'var(--gold)' }}/> WKF Syllabus
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1.2rem', borderRadius: '100px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaCheckCircle style={{ color: 'var(--gold)' }}/> Kata & Kumite
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.8rem 1.2rem', borderRadius: '100px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <FaCheckCircle style={{ color: 'var(--gold)' }}/> Belt Graded
                            </div>
                        </div>

                        <button className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }} onClick={() => openModal(branch.slug)}>
                            Book a Trial Class
                        </button>
                    </div>
                    
                    {/* Visual Anchor: The interactive Calendar / Schedule widget */}
                    <div className="cinematic-visual">
                        <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', background: 'var(--gold)', filter: 'blur(100px)', opacity: 0.1, borderRadius: '50%' }}></div>
                        
                        <h3 className="branch-calendar__title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                            Dojo Schedule
                        </h3>
                        
                        <div style={{ marginBottom: '2rem' }}>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.8rem', fontSize: '1.1rem' }}>
                                <FaClock style={{ color: 'var(--gold)', fontSize: '1.2rem' }}/> 
                                <strong>{formatClassDaysFull(branch.classDays)}</strong>
                            </p>
                            <p style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)' }}>
                                <span style={{ width: '1.2rem' }}></span>{branch.classTime}
                            </p>
                        </div>
                        
                        {/* Beautifully integrated minimalist calendar */}
                        <div className="cal-grid" style={{ gap: '6px' }}>
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                <div key={i} style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', paddingBottom: '0.5rem' }}>{d}</div>
                            ))}
                            {calendarWeeks.flat().map((cell, i) => {
                                if (!cell.isCurrentMonth) return <div key={i} />
                                
                                const isClass = cell.isClassDay
                                const isToday = cell.isToday
                                
                                return (
                                    <div key={i} style={{
                                        aspectRatio: '1/1',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.9rem',
                                        borderRadius: '50%',
                                        background: isToday ? 'var(--gold)' : (isClass ? 'rgba(255,255,255,0.1)' : 'transparent'),
                                        color: isToday ? '#000' : (isClass ? '#fff' : 'rgba(255,255,255,0.3)'),
                                        fontWeight: (isClass || isToday) ? 700 : 400
                                    }}>
                                        {cell.date}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* --- PERSONAL TRAINING MODULE --- */}
            <section style={{ background: 'radial-gradient(circle at 70% 50%, rgba(214,40,40,0.08) 0%, #05080f 60%)' }}>
                <div className="container cinematic-section reverse">
                    <div className="cinematic-content">
                        <span style={{ color: 'var(--crimson-light)', fontSize: '0.9rem', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '1rem', display: 'block' }}>
                            Exclusive 1-on-1 Coaching
                        </span>
                        <h2 style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>
                            Personal Training
                        </h2>
                        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '2rem', maxWidth: '600px' }}>
                            Accelerate your technical mastery. Personal training offers undivided attention from our certified Black Belt instructors. Perfect for athletes aiming for rapid grading progression, intense tournament preparation, or specialized self-defense mechanics. 
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                            <div>
                                <h4 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Tailored Syllabus</h4>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.5 }}>Customized approach isolating your targeted weaknesses in Kata or Kumite.</p>
                            </div>
                            <div>
                                <h4 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Flexible Timing</h4>
                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.5 }}>Train securely on your own optimal schedule directly with the Sensei.</p>
                            </div>
                        </div>

                        <a 
                            href={`https://wa.me/${branch.whatsapp}?text=Hi! I am interested in inquiring about exclusive Personal Training availability at the ${branch.name} branch.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary" 
                            style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', background: 'transparent', borderColor: 'var(--crimson)', color: '#fff' }}
                        >
                            <FaWhatsapp style={{ marginRight: '0.5rem', color: 'var(--crimson-light)' }}/> Enquire for PT
                        </a>
                    </div>
                    
                    {/* Visual Anchor: The Sensei Plate */}
                    <div className="cinematic-visual" style={{ background: 'transparent', border: 'none', padding: 0, position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '20%', left: '10%', width: '60%', height: '80%', border: '1px solid rgba(214,40,40,0.3)', borderRadius: '24px', zIndex: 1 }}></div>
                        <div style={{ position: 'relative', zIndex: 2, background: '#111', padding: '3rem', borderRadius: '24px', marginLeft: '10%', marginBottom: '10%', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}>
                            <GiBlackBelt style={{ fontSize: '4rem', color: 'var(--crimson-light)', opacity: 0.2, position: 'absolute', top: '1rem', right: '1rem' }} />
                            
                            <h4 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem' }}>{branch.sensei}</h4>
                            <p style={{ color: 'var(--crimson-light)', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, marginBottom: '2rem' }}>{branch.senseiDan} · Lead Instructor</p>
                            
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '2rem' }}>
                                "True martial arts mastery requires precise mechanical correction. In a one-on-one environment, we eliminate bad habits instantly and unlock your true physical potential."
                            </p>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255,255,255,0.8)' }}>
                                <FaPhoneAlt style={{ color: 'rgba(255,255,255,0.4)' }}/> {branch.phone}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ LOCATION & MAP MODULE ═══════ */}
            <section style={{ padding: '6rem 0', background: '#0a0d14' }}>
                <div className="container">
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem' }}>
                        
                        <div style={{ flex: '1 1 300px' }}>
                            <h3 className="section-title" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Branch Details</h3>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', gap: '1.2rem', marginBottom: '2rem' }}>
                                    <FaMapMarkerAlt style={{ color: 'var(--gold)', fontSize: '1.5rem', flexShrink: 0, marginTop: '0.2rem' }} />
                                    <div>
                                        <h4 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Address</h4>
                                        <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{branch.address}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1.2rem' }}>
                                    <FaPhoneAlt style={{ color: 'var(--gold)', fontSize: '1.3rem', flexShrink: 0, marginTop: '0.2rem' }} />
                                    <div>
                                        <h4 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.1rem' }}>Contact</h4>
                                        <p style={{ color: 'rgba(255,255,255,0.6)' }}><a href={`tel:${branch.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{branch.phone}</a></p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ flex: '2 1 500px' }}>
                            <div style={{ width: '100%', height: '100%', minHeight: '300px', borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
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
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ TOP PERFORMERS (Honours Integration) ═══════ */}
            {topPerformers && topPerformers.length > 0 && (
                <section style={{ padding: '6rem 0' }}>
                    <div className="container">
                        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                            <span className="section-label" style={{ justifyContent: 'center' }}><FaTrophy /> Branch Standing</span>
                            <h2 className="section-title" style={{ fontSize: '3rem' }}>Elite Roster — {branch.name}</h2>
                            <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '500px', margin: '0 auto' }}>Recognizing the highest point holders and medalists rigorously training at this academy.</p>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                            {topPerformers.map((p, i) => (
                                <div key={i} style={{ 
                                    background: 'var(--bg-card)', 
                                    border: '1px solid rgba(255,255,255,0.05)', 
                                    borderRadius: '24px', 
                                    padding: '2.5rem 2rem', 
                                    textAlign: 'center',
                                    transition: 'transform 0.3s ease',
                                }} className="hover-lift">
                                    <div style={{ 
                                        width: 80, height: 80, 
                                        margin: '0 auto 1.5rem', 
                                        background: 'rgba(255,183,3,0.1)', 
                                        color: 'var(--gold)', 
                                        borderRadius: '50%', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        fontSize: '2rem', 
                                        fontWeight: 900 
                                    }}>
                                        {p.name.charAt(0)}
                                    </div>
                                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>{p.name}</div>
                                    <div style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{p.category}</div>
                                    <div style={{ fontSize: '1.5rem', letterSpacing: '6px', marginBottom: '1rem' }}>{p.medals}</div>
                                    <div style={{ display: 'inline-block', background: 'rgba(0,0,0,0.5)', padding: '0.4rem 1rem', borderRadius: '100px', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                                        <strong style={{ color: '#fff' }}>{p.points.toFixed(0)}</strong> Points
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                            <Link href="/honours" className="btn btn-secondary" style={{ padding: '1rem 3rem' }}>
                                View Full Academy Honours Board
                            </Link>
                        </div>
                    </div>
                </section>
            )}
            
            {/* Global hover utility added dynamically */}
            <style jsx global>{`
                .hover-lift:hover {
                    transform: translateY(-5px);
                    border-color: rgba(255,183,3,0.3) !important;
                }
            `}</style>
        </div>
    )
}
