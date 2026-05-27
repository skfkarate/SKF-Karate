import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { FaCheckCircle, FaTrophy, FaBuilding, FaUsers, FaMedal, FaShieldAlt, FaCertificate, FaMapMarkerAlt } from 'react-icons/fa'
import { getPublicExecutiveCommitteeLive } from '@/lib/server/repositories/senseis-live'
import type { SenseiBranchAssignment, SenseiProfile } from '@/lib/types/sensei'
import JsonLdScript from '@/components/JsonLdScript'
import { buildBreadcrumbJsonLd, buildSeoMetadata } from '@/data/constants/seo'

export const revalidate = 300

export const metadata: Metadata = buildSeoMetadata(
    '/about',
    'Learn about SKF Karate, a Karnataka karate association training students in traditional karate, self-defense, kata, kumite, and black belt discipline.'
)

import { buildOrgJsonLd, ORG_STATS, LEGACY_HIGHLIGHTS, AFFILIATIONS, SITE_CONFIG } from '@/data/constants/siteConfig'
import './about.css'

function formatAssignmentLabel(assignments: SenseiBranchAssignment[] = []) {
    const branchNames = Array.from(
        new Set(assignments.map((assignment) => assignment.branchName.trim()).filter(Boolean))
    )

    return branchNames.join(', ')
}

function hasDisplayRank(instructor: SenseiProfile) {
    const rank = String(instructor.dan || '').trim()
    if (!rank) return false

    return rank !== 'Lead Instructor' || instructor.isFounder || /^sensei\b/i.test(instructor.name)
}

export default async function AboutPage() {
    const committee = await getPublicExecutiveCommitteeLive()
    const founder = committee.find((instructor) => instructor.isFounder) || committee[0]
    const activeCommittee = committee.filter((instructor) => instructor.id !== founder.id)
    const jsonLd = buildOrgJsonLd()
    const breadcrumbJsonLd = buildBreadcrumbJsonLd('About', '/about')

    return (
        <div className="abt-page">
            <JsonLdScript data={jsonLd} />
            <JsonLdScript data={breadcrumbJsonLd} />
            
            {/* ── AMBIENT ORBS ── */}
            <div className="abt-orb abt-orb--1" />
            <div className="abt-orb abt-orb--2" />
            <div className="abt-orb abt-orb--3" />
            
            <div className="abt-watermark">伝統</div>

            {/* ═══════ HERO ═══════ */}
            <header className="abt-hero">
                <Image 
                    src={SITE_CONFIG.LOGO_PATH} 
                    alt="SKF Official Logo" 
                    width={100} 
                    height={100} 
                    className="abt-hero__logo"
                    priority 
                />
                
                <div className="abt-hero__badge">
                    <span className="abt-hero__badge-dot"></span>
                    Est. {SITE_CONFIG.FOUNDED_YEAR}
                </div>

                <h1 className="abt-hero__title">
                    <span className="abt-hero__title-line">15 Years Of</span>
                    <span className="abt-hero__title-accent">Excellence</span>
                </h1>
                
                <p className="abt-hero__subtitle">
                    Forging elite martial artists through rigorous WKF-certified discipline. SKF Karate has become Karnataka’s standard for combative excellence.
                </p>

                {/* ── STATS BENTO ── */}
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

            {/* ═══════ THE ESTABLISHMENT ═══════ */}
            <section className="abt-section">
                <div className="abt-legacy-grid">
                    <div className="abt-legacy-text">
                        <div className="abt-section__tag">Our History</div>
                        <h2 className="abt-section__title">The Establishment</h2>
                        <h3>Founder & Technical Director: {founder.name}</h3>
                        <p>
                            Founded in {SITE_CONFIG.FOUNDED_YEAR}, SKF Karate has carefully structured a world-class martial arts curriculum deeply rooted in authentic WKF standards. What began as a single dojo has rapidly expanded into a premier coaching establishment dedicated to tactical mastery, self-defense, and elite tournament performance.
                        </p>
                        <p>
                            We operate strictly as an educational institution with verified coaching methodologies. Under elite guidance, we prioritize bio-mechanics and fight intelligence, ensuring our athletes dominate on the competitive stage.
                        </p>
                        
                        <div className="abt-quote">
                            <div className="abt-quote__text">
                                &quot;Our singular mission is to build highly resilient, confident athletes equipped completely for the real world.&quot;
                            </div>
                            <div className="abt-quote__author">— {founder.name}</div>
                        </div>
                    </div>
                    
                    <div className="abt-focus-image">
	                        <Image
	                            src={founder.imageUrl}
	                            alt={founder.name}
	                            fill
	                            sizes="(max-width: 900px) 100vw, 50vw"
	                            style={{ objectFit: 'cover', objectPosition: founder.objectPosition || 'center' }}
	                            priority
	                        />
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

            {/* ═══════ THE LEGACY ═══════ */}
            <section className="abt-section">
                <div className="abt-legacy-grid abt-legacy-grid--reverse">
                    <div className="abt-legacy-text">
                        <div className="abt-section__tag">Results</div>
                        <h2 className="abt-section__title">The Champions&apos; Legacy</h2>
                        <p>
                            Over a decade of rigorous training has yielded unparalleled results cross multiple national and state platforms. Our athletes consistently break barriers and redefine combat excellence.
                        </p>
                        
                        <div className="abt-plaque-list">
                            {LEGACY_HIGHLIGHTS.map((hl, i) => (
                                <div className="abt-plaque" key={i}>
                                    <FaTrophy className="abt-plaque-icon" />
                                    <div className="abt-plaque-text">{hl}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="abt-focus-image" style={{ borderColor: 'rgba(255,183,3,0.2)' }}>
	                        <Image src="/gallery/In Dojo.jpeg" alt="SKF Training" fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectPosition: 'center 40%' }} />
                    </div>
                </div>
            </section>

            {/* ═══════ EXECUTIVE COMMITTEE ═══════ */}
            <section className="abt-section">
                <div className="abt-section__header">
                    <div className="abt-section__tag">Leadership</div>
                    <h2 className="abt-section__title">Executive Committee</h2>
                    <p className="abt-section__sub">
                        Composed of our most senior Masters, the Executive Committee ensures an unparalleled standard of education, tactical mastery, and athlete safety.
                    </p>
                </div>

                <div className="abt-roster-grid">
                    {activeCommittee.map((instructor, idx) => (
                        <Link key={instructor.id || idx} href={`/instructors/${instructor.slug}`} className="abt-roster-card">
                            <div className="abt-roster-card__imgwrap">
	                                <Image
	                                    src={instructor.imageUrl}
	                                    alt={instructor.name}
	                                    fill
	                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
	                                    style={{
                                        objectPosition: instructor.hidePhoto ? 'center 25%' : (instructor.objectPosition || 'center'),
                                        objectFit: instructor.hidePhoto ? 'contain' : 'cover',
                                        opacity: instructor.hidePhoto ? 0.3 : 1,
                                        inset: instructor.hidePhoto ? '2rem' : '0'
                                    }}
                                />
                            </div>
                            <div className="abt-roster-card__gradient" />
                            
                            <div className="abt-roster-card__content">
                                <div className="abt-roster-title">{instructor.title}</div>
                                <div className="abt-roster-name">{instructor.name}</div>
                                
                                <div className="abt-roster-meta">
                                    {hasDisplayRank(instructor) && (
                                        <div className="abt-roster-pill"><FaCertificate style={{ color: 'var(--gold)' }} /> {instructor.dan}</div>
                                    )}
                                    {formatAssignmentLabel(instructor.assignments) && (
                                        <div className="abt-roster-pill"><FaMapMarkerAlt style={{ color: 'var(--crimson-light)' }} /> {formatAssignmentLabel(instructor.assignments)}</div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ═══════ AFFILIATIONS & TRUST CENTER ═══════ */}
            <section className="abt-section" style={{ paddingTop: '2rem' }}>
                <div className="abt-trust-center">
                    <h2 className="abt-section__title" style={{ fontSize: '1.8rem', marginBottom: '3rem' }}>Global & National Affiliates</h2>
                    
                    <div className="abt-affil-grid">
                        {AFFILIATIONS.map((logo, i) => (
                            <Image key={i} src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} />
                        ))}
                    </div>

                    <div className="abt-trust-badges">
                        <div className="abt-trust-badge">
                            <FaShieldAlt />
                            <div className="abt-trust-badge__title">Verified Safety</div>
                            <div className="abt-trust-badge__desc">All instructors hold government background clearances & First Aid certs.</div>
                        </div>
                        <div className="abt-trust-badge">
                            <FaCheckCircle />
                            <div className="abt-trust-badge__title">Digital Integrity</div>
                            <div className="abt-trust-badge__desc">All issued SKF certificates are strictly and digitally cross-verifiable online.</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ CALL TO ACTION ═══════ */}
            <section className="abt-section abt-cta-section">
                <div className="abt-cta-card">
                    <div className="abt-cta-glow"></div>
                    <div className="abt-cta-content">
                        <div className="abt-section__tag" style={{ marginBottom: '1rem' }}>Take Action</div>
                        <h3 className="abt-cta-title">Ready To Join The Legacy?</h3>
                        <p className="abt-cta-desc">
                            Step onto the tatami. Forge unparalleled discipline, tactical mastery, and resilience with Karnataka&apos;s premier WKF academy.
                        </p>
                        <Link href="/book-trial" className="abt-cta-btn">
                            <span>Book Your Free Trial</span>
                            <span className="abt-cta-btn-icon">→</span>
                        </Link>
                    </div>
                </div>
            </section>

        </div>
    )
}
