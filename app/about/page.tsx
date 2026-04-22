import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { FaCheckCircle, FaTrophy, FaBuilding, FaUsers, FaMedal, FaShieldAlt, FaCertificate, FaMapMarkerAlt } from 'react-icons/fa'
import { getExecutiveCommittee } from '@/data/seed/instructors'
import BookTrialCTAButton from './_components/BookTrialCTAButton'

export const metadata: Metadata = {
    title: "About SKF Karate — Bangalore's WKF-Affiliated Academy Since 2011",
    description: "SKF Karate has trained over 5,100 students in Bangalore since 2011. Meet our instructors, view our affiliations, and learn about our 15-year legacy.",
}

import { buildOrgJsonLd, ORG_STATS, LEGACY_HIGHLIGHTS, AFFILIATIONS, SITE_CONFIG } from '@/data/constants/siteConfig'
import './about.css'

export default function AboutPage() {
    const committee = getExecutiveCommittee()
    const founder = committee[0]
    const activeCommittee = committee.slice(1)
    const jsonLd = buildOrgJsonLd()

    return (
        <div className="abt-page">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            
            {/* AMBIENT EFFECTS */}
            <div className="abt-orb abt-orb--1" />
            <div className="abt-orb abt-orb--2" />
            <div className="abt-watermark">伝統</div>

            {/* ═══════ HERO & DASHBOARD ═══════ */}
            <header className="abt-hero">
                <Image 
                    src={SITE_CONFIG.LOGO_PATH} 
                    alt="SKF Official Logo" 
                    width={100} 
                    height={100} 
                    className="abt-hero__logo"
                    priority 
                />
                <h1 className="abt-hero__title">15 Years of Excellence</h1>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                    Established in {SITE_CONFIG.FOUNDED_YEAR}. Forging elite martial artists through rigorous WKF-certified discipline.
                </p>

                {/* Floating Fast-Stats Bento */}
                <div className="abt-stats-bento">
                    <div className="abt-stat-card">
                        <div className="abt-stat-val">{ORG_STATS.TOTAL_ATHLETES}</div>
                        <div className="abt-stat-lbl"><FaUsers style={{ color: 'var(--gold)' }}/> Athletes</div>
                    </div>
                    <div className="abt-stat-card">
                        <div className="abt-stat-val">{ORG_STATS.BLACK_BELTS}</div>
                        <div className="abt-stat-lbl"><FaMedal style={{ color: 'var(--gold)' }}/> Black Belts</div>
                    </div>
                    <div className="abt-stat-card">
                        <div className="abt-stat-val">{ORG_STATS.CHAMPIONSHIPS}</div>
                        <div className="abt-stat-lbl"><FaTrophy style={{ color: 'var(--gold)' }}/> Championships</div>
                    </div>
                    <div className="abt-stat-card">
                        <div className="abt-stat-val">{ORG_STATS.BRANCHES}</div>
                        <div className="abt-stat-lbl"><FaBuilding style={{ color: 'var(--gold)' }}/> Branches</div>
                    </div>
                </div>
            </header>

            {/* ═══════ THE ESTABLISHMENT (Cinematic Dual-Column) ═══════ */}
            <section className="abt-section" style={{ marginTop: '2rem' }}>
                <div className="abt-legacy-grid">
                    <div className="abt-legacy-text">
                        <h2>The Establishment</h2>
                        <h3>Founder & Technical Director: {founder.name}</h3>
                        <p>
                            Founded in {SITE_CONFIG.FOUNDED_YEAR}, SKF Karate has carefully structured a world-class martial arts curriculum deeply rooted in authentic WKF standards. What began as a single dojo has rapidly expanded into a premier coaching establishment dedicated to tactical mastery, self-defense, and elite tournament performance.
                        </p>
                        <p>
                            We operate strictly as an educational institution with verified coaching methodologies. Under elite guidance, we prioritize bio-mechanics and fight intelligence, ensuring our athletes dominate on the competitive stage.
                        </p>
                        <div style={{ marginTop: '3rem', borderLeft: '4px solid var(--crimson-light)', paddingLeft: '1.5rem' }}>
                            <div style={{ fontSize: '1.4rem', color: '#fff', fontStyle: 'italic', fontWeight: 600, lineHeight: 1.4, marginBottom: '0.8rem' }}>
                                "Our singular mission is to build highly resilient, confident athletes equipped completely for the real world."
                            </div>
                            <div style={{ color: 'var(--crimson-light)', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', fontWeight: 800 }}>
                                — {founder.name}
                            </div>
                        </div>
                    </div>
                    
                    <div className="abt-focus-image">
                        <Image src={founder.image} alt={founder.name} fill priority />
                        <div className="abt-focus-overlay">
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ color: 'var(--gold)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem', marginBottom: '0.3rem' }}>{founder.title}</div>
                                <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.5rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>{founder.name}</div>
                                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FaCertificate style={{ color: 'var(--gold)' }} /> {founder.dan}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ THE LEGACY (Accolades & Plaque Cards) ═══════ */}
            <section className="abt-section">
                <div className="abt-legacy-grid" style={{ direction: 'rtl' }}>
                    <div className="abt-legacy-text" style={{ direction: 'ltr' }}>
                        <h2 style={{ color: 'var(--gold)' }}>The Champions' Legacy</h2>
                        <p>
                            Over a decade of rigorous training has yielded unparalleled results cross multiple national and state platforms. Our athletes consistently break barriers and redefine combat excellence.
                        </p>
                        
                        <div className="abt-plaque-list">
                            {LEGACY_HIGHLIGHTS.map((hl, i) => (
                                <div className="abt-plaque" key={i}>
                                    <FaTrophy style={{ color: 'var(--gold)', fontSize: '1.5rem', flexShrink: 0 }} />
                                    <div className="abt-plaque-text">{hl}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="abt-focus-image" style={{ borderColor: 'rgba(255,183,3,0.2)' }}>
                        <Image src="/gallery/In Dojo.jpeg" alt="SKF Training" fill style={{ objectPosition: 'center 40%' }} />
                    </div>
                </div>
            </section>

            {/* ═══════ EXECUTIVE COMMITTEE ═══════ */}
            <section className="abt-section">
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 4vw, 3rem)', textTransform: 'uppercase', color: '#fff', margin: 0 }}>Executive Committee</h2>
                    <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '600px', margin: '1rem auto 0', fontSize: '1.1rem' }}>
                        Composed of our most senior Masters, the Executive Committee ensures an unparalleled standard of education, tactical mastery, and athlete safety.
                    </p>
                </div>

                <div className="abt-roster-grid">
                    {activeCommittee.map((instructor, idx) => (
                        <Link key={idx} href={`/instructors/${instructor.slug}`} style={{ textDecoration: 'none' }}>
                            <div className="abt-roster-card">
                                <div className="abt-roster-card__imgwrap">
                                    <Image src={instructor.image} alt={instructor.name} fill />
                                </div>
                                <div className="abt-roster-card__gradient" />
                                
                                <div className="abt-roster-card__content">
                                    <div className="abt-roster-title">{instructor.title}</div>
                                    <div className="abt-roster-name">{instructor.name}</div>
                                    
                                    <div className="abt-roster-meta">
                                        <div className="abt-roster-pill"><FaCertificate style={{ color: 'var(--gold)' }} /> {instructor.rank || instructor.dan}</div>
                                        <div className="abt-roster-pill"><FaMapMarkerAlt style={{ color: 'var(--crimson-light)' }} /> {instructor.branch}</div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ═══════ AFFILIATIONS & TRUST CENTER ═══════ */}
            <section className="abt-section" style={{ paddingTop: '2rem' }}>
                <div className="abt-trust-center">
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: '#fff', textTransform: 'uppercase', marginBottom: '3rem' }}>Global & National Affiliates</h3>
                    
                    <div className="abt-affil-grid">
                        {AFFILIATIONS.map((logo, i) => (
                            <Image key={i} src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} />
                        ))}
                    </div>

                    <div className="abt-trust-badges">
                        <div className="abt-trust-badge">
                            <FaShieldAlt />
                            <div style={{ color: '#fff', fontWeight: 700 }}>VERIFIED SAFETY</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>All instructors hold government background clearances & First Aid certs.</div>
                        </div>
                        <div className="abt-trust-badge">
                            <FaCheckCircle />
                            <div style={{ color: '#fff', fontWeight: 700 }}>DIGITAL INTEGRITY</div>
                            <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>All issued SKF certificates are strictly and digitally cross-verifiable online.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ CALL TO ACTION ═══════ */}
            <section style={{ padding: '4rem 0 6rem', textAlign: 'center', position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>READY TO JOIN THE LEGACY?</h3>
                    <BookTrialCTAButton />
                </div>
            </section>

        </div>
    )
}
