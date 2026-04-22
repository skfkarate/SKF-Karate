'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { 
    FaArrowLeft, FaMapMarkerAlt, FaClock, FaPhoneAlt, 
    FaWhatsapp, FaTrophy, FaCheckCircle, FaUserTie 
} from 'react-icons/fa'
import { GiBlackBelt } from 'react-icons/gi'
import { type Branch, formatClassDaysFull, generateCalendar } from '@/lib/classesData'

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
    isDirectSkipBranch?: boolean
}

export default function BranchDetailClient({ branch, cityName, citySlug, topPerformers = [], isDirectSkipBranch = false }: BranchDetailClientProps) {
    const now = new Date()
    const [calYear] = useState(now.getFullYear())
    const [calMonth] = useState(now.getMonth())

    const calendarWeeks = generateCalendar(calYear, calMonth, branch.classDays)

    return (
        <div className="obs-page" style={{ paddingBottom: 0 }}>
            {/* Cinematic Full-Bleed Hero */}
            <header className="obs-bdetail-hero">
                <div className="obs-bdetail-hero__bg">
                    <Image 
                        src={branch.photos[0] || '/gallery/In Dojo.jpeg'}
                        alt={branch.name}
                        fill
                        sizes="100vw"
                        priority
                    />
                </div>
                <div className="obs-bdetail-hero__overlay" />
                
                <div className="obs-bdetail-hero__content">
                    {/* Left: Branding & Core Nav */}
                    <div style={{ flex: 1 }}>
                        <Link 
                            href={isDirectSkipBranch ? "/classes" : `/classes/${citySlug}`} 
                            style={{ 
                                display: 'inline-flex', alignItems: 'center', gap: '8px', 
                                color: 'var(--gold, #ffb703)', fontSize: '0.8rem', 
                                fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', 
                                textDecoration: 'none', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.4)',
                                padding: '0.4rem 1rem', borderRadius: '50px', border: '1px solid rgba(255,183,3,0.3)'
                            }}
                        >
                            <FaArrowLeft /> {isDirectSkipBranch ? "ALL LOCATIONS" : `BACK TO ${cityName}`}
                        </Link>
                        {branch.isHQ && (
                            <div style={{ display: 'table', marginBottom: '1rem', background: 'var(--crimson, #d62828)', color: '#fff', padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}>
                                National Headquarters
                            </div>
                        )}
                        <h1 className="obs-bdetail-hero__title">{branch.name}</h1>
                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', marginTop: '1rem', maxWidth: '600px' }}>
                            {branch.description || `Premier WKF Karate training program in ${cityName}.`}
                        </p>
                    </div>

                    {/* Right: Floating Quick-Action Stats/Bento Overlay */}
                    <div className="obs-bdetail-hero__action-bento">
                        <div className="obs-bdetail-hero__action-row">
                            <FaClock size={20} style={{ color: 'var(--gold)' }} />
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Schedule</div>
                                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{branch.classTime}</div>
                            </div>
                        </div>
                        <div className="obs-bdetail-hero__action-row">
                            <FaMapMarkerAlt size={20} style={{ color: 'var(--gold)' }} />
                            <div>
                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Location</div>
                                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{branch.address.split(',')[0]}</div>
                            </div>
                        </div>
                        <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', margin: '1.5rem 0' }} />
                        <Link 
                            href={`/book-trial?branch=${branch.slug}`}
                            className="obs-cta-btn obs-cta-btn--prime" 
                            style={{ width: '100%', justifyContent: 'center', padding: '1rem', textDecoration: 'none', textAlign: 'center' }}
                        >
                            BOOK A TRIAL CLASS
                        </Link>
                    </div>
                </div>
            </header>

            {/* Asymmetric Floating Bento Matrix */}
            <div className="obs-bdetail-grid">
                
                {/* ── LEFT COLUMN (Main Content) ── */}
                <div className="obs-bdetail-main">
                    
                    {/* Visual Gallery Carousels/Modules */}
                    <div className="obs-glass-pane" style={{ padding: 0 }}>
                        <div style={{ position: 'relative', width: '100%', height: '350px' }}>
                             <Image 
                                src={branch.photos[1] || branch.photos[0] || '/gallery/In Dojo.jpeg'}
                                alt="Dojo Interior"
                                fill
                                style={{ objectFit: 'cover' }}
                            />
                            <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 100px rgba(0,0,0,0.8)' }} />
                            <h3 style={{ position: 'absolute', bottom: '2rem', left: '2rem', margin: 0, fontFamily: 'var(--font-heading)', fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Community Learning
                            </h3>
                        </div>
                        <div style={{ padding: '2.5rem' }}>
                            <p style={{ fontSize: '1.05rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, marginBottom: '2rem' }}>
                                Experience the raw energy of collective progression. Our group classes follow the structured WKF syllabus led meticulously by {branch.sensei}. Test your skills in kumite sparring cycles and ascend the belt ranks alongside dedicated martial artists pursuing the same mastery.
                            </p>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <FaCheckCircle style={{ color: 'var(--gold)' }}/> WKF Syllabus
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <FaCheckCircle style={{ color: 'var(--gold)' }}/> Kata & Kumite
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <FaCheckCircle style={{ color: 'var(--gold)' }}/> Belt Graded
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Map & Location Glass Card */}
                    <div className="obs-glass-pane" style={{ padding: 0, display: 'flex', flexWrap: 'wrap' }}>
                        <div style={{ flex: '1 1 300px', padding: '2.5rem' }}>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1.5rem' }}>Navigate</h3>
                            
                            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                                <FaMapMarkerAlt style={{ color: 'var(--gold)', fontSize: '1.2rem', flexShrink: 0, marginTop: '0.2rem' }} />
                                <div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '0.3rem' }}>Address</div>
                                    <div style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, fontSize: '0.95rem' }}>{branch.address}</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <FaPhoneAlt style={{ color: 'var(--gold)', fontSize: '1.2rem', flexShrink: 0, marginTop: '0.2rem' }} />
                                <div>
                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700, marginBottom: '0.3rem' }}>Contact Desk</div>
                                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>
                                        <a href={`tel:${branch.phone}`} style={{ color: 'inherit', textDecoration: 'none' }}>{branch.phone}</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div style={{ flex: '1 1 300px', minHeight: '300px', position: 'relative' }}>
                            <iframe 
                                width="100%" 
                                height="100%" 
                                style={{ border: 0, position: 'absolute', inset: 0 }} 
                                loading="lazy" 
                                allowFullScreen 
                                referrerPolicy="no-referrer-when-downgrade"
                                src={`https://www.google.com/maps?q=${encodeURIComponent(branch.address)}&output=embed`}
                            ></iframe>
                        </div>
                    </div>

                </div>

                {/* ── RIGHT COLUMN (Sidebar Modules) ── */}
                <div className="obs-bdetail-aside">
                    
                    {/* Sensei Spotlight Card */}
                    <div className="obs-glass-pane obs-glass-pane--prime" style={{ position: 'relative', overflow: 'hidden' }}>
                        <GiBlackBelt style={{ fontSize: '8rem', color: 'var(--gold)', opacity: 0.1, position: 'absolute', top: '-1rem', right: '-1rem' }} />
                        <FaUserTie style={{ fontSize: '2rem', color: 'var(--gold)', marginBottom: '1.5rem' }} />
                        
                        <h4 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '1px', color: '#fff', margin: '0 0 0.2rem' }}>
                            {branch.sensei}
                        </h4>
                        <div style={{ color: 'var(--gold)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '1.5rem' }}>
                            {branch.senseiDan} · Lead Instructor
                        </div>
                        
                        <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: '2rem' }}>
                            "True martial arts mastery requires precise mechanical correction. We eliminate bad habits instantly and unlock your true physical potential."
                        </p>
                        
                        <a 
                            href={`https://wa.me/${branch.whatsapp}?text=Hi! I am interested in inquiring about exclusive Personal Training availability directly with Sensei ${branch.sensei}.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="obs-cta-btn"
                            style={{ width: '100%', justifyContent: 'center', background: 'transparent', borderColor: 'var(--gold)', color: '#fff' }}
                        >
                            <FaWhatsapp size={16} style={{ color: 'var(--gold)' }}/> Request 1-on-1 Training
                        </a>
                    </div>

                    {/* Obsidian Schedule Calendar Widget */}
                    <div className="obs-glass-pane">
                        <h4 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '1px', color: '#fff', margin: '0 0 1rem' }}>
                            Dojo Calendar
                        </h4>
                        
                        <p style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.95rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1.5rem' }}>
                            <FaClock style={{ color: 'var(--gold)' }}/> 
                            {formatClassDaysFull(branch.classDays)}
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                <div key={i} style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', paddingBottom: '0.5rem', fontWeight: 700 }}>{d}</div>
                            ))}
                            {calendarWeeks.flat().map((cell, i) => {
                                if (!cell.isCurrentMonth) return <div key={i} />
                                
                                const isClass = cell.isClassDay
                                const isToday = cell.isToday
                                
                                return (
                                    <div key={i} style={{
                                        aspectRatio: '1/1',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.85rem', borderRadius: '8px',
                                        background: isToday ? 'var(--gold)' : (isClass ? 'rgba(255,255,255,0.08)' : 'transparent'),
                                        color: isToday ? '#000' : (isClass ? '#fff' : 'rgba(255,255,255,0.2)'),
                                        fontWeight: (isClass || isToday) ? 700 : 400,
                                        border: isClass && !isToday ? '1px solid rgba(255,255,255,0.1)' : '1px solid transparent'
                                    }}>
                                        {cell.date}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Top Performers / Elite Roster Widget */}
                    {topPerformers && topPerformers.length > 0 && (
                        <div className="obs-glass-pane" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                                <FaTrophy style={{ color: 'var(--gold)' }} />
                                <h4 style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '1px', color: '#fff', margin: 0 }}>
                                    Elite Roster
                                </h4>
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {topPerformers.slice(0, 3).map((p, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px' }}>
                                        <div style={{ width: '40px', height: '40px', background: 'rgba(255,183,3,0.1)', color: 'var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                                            {i + 1}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem' }}>{p.name}</div>
                                            <div style={{ color: 'var(--gold)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>{p.points} PTS</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link href="/honours" style={{ display: 'block', textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '1.5rem', textDecoration: 'none' }}>
                                VIEW FULL BOARD &rarr;
                            </Link>
                        </div>
                    )}

                </div>
            </div>
            
        </div>
    )
}
