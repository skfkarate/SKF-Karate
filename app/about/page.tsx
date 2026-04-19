import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { FaCheckCircle, FaTrophy, FaBuilding, FaUsers, FaMedal, FaArrowRight } from 'react-icons/fa'
import { leadershipData } from '@/lib/leadershipData'
import BookTrialCTAButton from './_components/BookTrialCTAButton'

export const metadata: Metadata = {
    title: "About SKF Karate — Bangalore's WKF-Affiliated Academy Since 2011",
    description: "SKF Karate has trained over 5,100 students in Bangalore since 2011. Meet our instructors, view our affiliations, and learn about our 15-year legacy.",
}

const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: 'SKF Karate',
    url: 'https://skfkarate.com',
    logo: 'https://skfkarate.com/logo/SKF logo.png',
    foundingDate: '2011',
    address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bangalore',
        addressRegion: 'Karnataka',
        addressCountry: 'IN'
    },
    sameAs: [
        'https://www.instagram.com/skf_karate/',
        'https://www.facebook.com/share/1DG1UZ3vKp/?mibextid=wwXIfr',
        'https://www.youtube.com/@skfkarate'
    ]
}

export default function AboutPage() {
    const founder = leadershipData[0]
    const activeCommittee = leadershipData.slice(1)

    return (
        <div style={{ background: '#05080f', minHeight: '100vh', paddingBottom: '4rem' }}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            
            {/* ═══════ SECTION 1: THE STORY (TRUST ANCHOR) ═══════ */}
            <section style={{ paddingTop: '8rem', paddingBottom: '4rem', background: 'radial-gradient(circle at 50% 0%, rgba(214,40,40,0.05) 0%, transparent 70%)' }}>
                <div className="container">
                    
                    {/* Compact Hero Header */}
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#fff', margin: 0, letterSpacing: '-1px' }}>
                            15 Years of Excellence — Est. 2011
                        </h1>
                    </div>

                    {/* Stats Bar */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', 
                        justifyContent: 'space-between', 
                        background: 'rgba(255,255,255,0.03)', 
                        borderTop: '1px solid rgba(255,255,255,0.1)', 
                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                        padding: '2rem 4rem',
                        marginBottom: '4rem',
                        gap: '2rem'
                    }}>
                        <div style={{ textAlign: 'center', flex: 1, minWidth: '150px' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>5,100+</div>
                            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}><FaUsers style={{ marginRight:'0.5rem', color: 'var(--gold)' }}/> Athletes</div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1, minWidth: '150px' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>20+</div>
                            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}><FaMedal style={{ marginRight:'0.5rem', color: 'var(--gold)' }}/> Black Belts</div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1, minWidth: '150px' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>300+</div>
                            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}><FaTrophy style={{ marginRight:'0.5rem', color: 'var(--gold)' }}/> Championships</div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1, minWidth: '150px' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem' }}>3</div>
                            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}><FaBuilding style={{ marginRight:'0.5rem', color: 'var(--gold)' }}/> Branches</div>
                        </div>
                    </div>

                    {/* Story & Specifics */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '4rem', alignItems: 'center' }}>
                        <div>
                            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.2rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
                                Founded in 2011, SKF Karate has carefully structured a world-class martial arts curriculum deeply rooted in authentic WKF (World Karate Federation) standards. What began as a single dojo has expanded into a premier coaching establishment dedicated to physical mastery, self-defense, and elite tournament performance.
                            </p>
                            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', lineHeight: 1.7 }}>
                                We operate strictly as an educational institution with verified coaching methodologies. Our singular mission is to build highly resilient, confident athletes equipped completely for the real world—whether that means excelling on international tatami mats or maintaining unparalleled physical discipline in daily life.
                            </p>
                        </div>
                        
                        <div>
                            <div style={{ position: 'relative', width: '100%', height: '350px', borderRadius: '16px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                                <Image src="/gallery/In Dojo.jpeg" alt="SKF Karate Training Dojo" fill style={{ objectFit: 'cover', objectPosition: 'center 40%' }} />
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
                                    <FaMedal style={{ color: 'var(--gold)' }}/> <span style={{ color: '#fff', fontSize: '0.95rem' }}>Arjun Raghavendra — National Gold, Kumite Under 67kg, 2025</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem', marginBottom: '0.8rem' }}>
                                    <FaCheckCircle style={{ color: 'var(--gold)' }}/> <span style={{ color: '#fff', fontSize: '0.95rem' }}>87 Official Black Belt Graduations to Date</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <FaTrophy style={{ color: 'var(--gold)' }}/> <span style={{ color: '#fff', fontSize: '0.95rem' }}>6 Consecutive State and National Championships Won</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ SECTION 2: OFFICIAL HIERARCHY & CREDENTIALS ═══════ */}
            <section style={{ padding: '6rem 0', background: '#080c16', borderTop: '1px solid rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden' }}>
                
                {/* Subtle Cinematic Background Watermark */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', opacity: 0.02, pointerEvents: 'none', zIndex: 0 }}>
                     <Image src="/logo/SKF logo.png" alt="SKF Watermark" fill style={{ objectFit: 'contain' }} />
                </div>

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-heading)', color: '#fff', textAlign: 'center', marginBottom: '3rem' }}>
                        Executive Committee & Verified Instructors
                    </h2>

                    {/* Featured Founder Card */}
                    <Link href={`/instructors/${founder.slug}`} style={{ textDecoration: 'none' }}>
                        <div style={{ background: '#111', border: '1px solid rgba(214,40,40,0.3)', borderRadius: '24px', overflow: 'hidden', display: 'flex', flexWrap: 'wrap', marginBottom: '2rem', transition: 'transform 0.3s ease, border-color 0.3s ease' }} 
                            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(214,40,40,0.8)' }}
                            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(214,40,40,0.3)' }}
                        >
                            <div style={{ flex: '1 1 300px', position: 'relative', minHeight: '300px' }}>
                                <Image src={founder.image} alt={founder.name} fill style={{ objectFit: 'cover', objectPosition: 'center top' }} />
                            </div>
                            <div style={{ flex: '2 1 400px', padding: '3rem', display: 'flex', flexDirection: 'column' }}>
                                <h3 style={{ fontSize: '2.5rem', color: '#fff', marginBottom: '0.5rem', fontFamily: 'var(--font-heading)' }}>{founder.name}</h3>
                                <div style={{ color: 'var(--crimson-light)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.2rem' }}>{founder.title}</div>
                                <div style={{ color: 'var(--gold)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '1.5rem' }}>{founder.dan}</div>
                                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>{founder.desc}</p>
                                <div style={{ marginTop: 'auto', fontWeight: 700, color: 'var(--crimson-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    View Full Profile <FaArrowRight />
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Supporting Curriculum Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '5rem' }}>
                        {activeCommittee.map((instructor, idx) => (
                            <Link key={idx} href={`/instructors/${instructor.slug}`} style={{ textDecoration: 'none' }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.3s ease, border-color 0.3s ease' }}
                                    onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.borderColor = 'rgba(255,183,3,0.4)' }}
                                    onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)' }}
                                >
                                    <div style={{ position: 'relative', width: '100%', height: '260px' }}>
                                        <Image src={instructor.image} alt={instructor.name} fill style={{ objectFit: 'cover', objectPosition: 'center 20%', filter: 'grayscale(20%)' }} />
                                    </div>
                                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                                        <h4 style={{ fontSize: '1.3rem', color: '#fff', marginBottom: '0.2rem' }}>{instructor.name}</h4>
                                        <div style={{ color: 'var(--gold)', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.2rem' }}>{instructor.rank || instructor.dan}</div>
                                        <div style={{ color: 'var(--crimson-light)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, marginBottom: '1rem' }}>{instructor.title}</div>
                                        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, marginBottom: '1.5rem' }}>{instructor.desc}</p>
                                        <div style={{ marginTop: 'auto', fontWeight: 700, color: 'var(--gold)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            View Profile <FaArrowRight />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Affiliations & Safety Block */}
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                            <Image src="/affliciation/wkf.png" alt="WKF Logo" width={120} height={120} style={{ objectFit: 'contain' }} />
                            <Image src="/affliciation/akska.png" alt="AKSKA Logo" width={110} height={110} style={{ objectFit: 'contain' }} />
                            <Image src="/affliciation/kio.png" alt="KIO Logo" width={120} height={120} style={{ objectFit: 'contain' }} />
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4rem' }}>
                            WKF-Affiliated Karate Academy Since 2011
                        </p>

                        <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ background: 'rgba(46, 204, 113, 0.05)', color: '#2ecc71', border: '1px solid rgba(46, 204, 113, 0.2)', padding: '1.2rem 2rem', borderRadius: '12px', fontSize: '1rem', lineHeight: 1.5, textAlign: 'left' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontWeight: 700, marginBottom: '0.3rem' }}>
                                    <FaCheckCircle /> Safety Standard Verified
                                </div>
                                <span style={{ color: 'rgba(255,255,255,0.8)' }}>All SKF Karate instructors hold government-verified background clearances and current first aid certifications.</span>
                            </div>
                            
                            <div style={{ background: 'rgba(255, 255, 255, 0.02)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '1.2rem 2rem', borderRadius: '12px', fontSize: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                                <span style={{ color: 'rgba(255,255,255,0.8)' }}>All SKF certificates are digitally verifiable.</span> 
                                <Link href="/verify" style={{ color: 'var(--gold)', fontWeight: 600, textDecoration: 'none' }}>Verify a certificate →</Link>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* ═══════ SECTION 3: CALL TO ACTION (Minimal) ═══════ */}
            <section style={{ padding: '6rem 0 2rem', background: 'transparent', textAlign: 'center' }}>
                <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.8rem', color: '#fff', fontWeight: 500, fontFamily: 'var(--font-heading)' }}>Ready to join the SKF Karate family?</h3>
                    <BookTrialCTAButton />
                </div>
            </section>

        </div>
    )
}
