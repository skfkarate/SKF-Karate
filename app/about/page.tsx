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
            
            {/* ═══════ HEADER: LOGO & STATS ═══════ */}
            <section style={{ paddingTop: '8rem', paddingBottom: '2rem', position: 'relative' }}>
                <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
                    
                    {/* Official Crown Logo */}
                    <div style={{ marginBottom: '2rem' }}>
                        <Image src="/logo/SKF logo.png" alt="SKF Official Logo" width={120} height={120} style={{ objectFit: 'contain', margin: '0 auto', filter: 'drop-shadow(0 0 20px rgba(214,40,40,0.5))' }} priority />
                    </div>

                    {/* Headline */}
                    <div style={{ marginBottom: '4rem' }}>
                        <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#fff', margin: 0, letterSpacing: '-1px' }}>
                            15 Years of Excellence — Est. 2011
                        </h1>
                    </div>

                    {/* Floating Dashboard Stats */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', 
                        justifyContent: 'space-between', 
                        background: 'rgba(255,255,255,0.02)', 
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '24px',
                        padding: '2.5rem 4rem',
                        marginBottom: '4rem',
                        gap: '2rem',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ textAlign: 'center', flex: 1, minWidth: '150px' }}>
                            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem', lineHeight: 1 }}>5,100+</div>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}><FaUsers style={{ marginRight:'0.5rem', color: 'var(--gold)' }}/> Athletes</div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1, minWidth: '150px' }}>
                            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem', lineHeight: 1 }}>20+</div>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}><FaMedal style={{ marginRight:'0.5rem', color: 'var(--gold)' }}/> Black Belts</div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1, minWidth: '150px' }}>
                            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem', lineHeight: 1 }}>300+</div>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}><FaTrophy style={{ marginRight:'0.5rem', color: 'var(--gold)' }}/> Championships</div>
                        </div>
                        <div style={{ textAlign: 'center', flex: 1, minWidth: '150px' }}>
                            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#fff', marginBottom: '0.2rem', lineHeight: 1 }}>3</div>
                            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}><FaBuilding style={{ marginRight:'0.5rem', color: 'var(--gold)' }}/> Branches</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ CINEMATIC ZIG-ZAG: THE NARRATIVE FLOW ═══════ */}
            <section style={{ padding: '4rem 0 6rem 0', background: '#080c16', position: 'relative', overflow: 'hidden' }}>
                
                {/* Subtle Cinematic Background Watermark */}
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '80%', opacity: 0.02, pointerEvents: 'none', zIndex: 0 }}>
                     <Image src="/logo/SKF logo.png" alt="SKF Watermark" fill style={{ objectFit: 'contain' }} />
                </div>

                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    
                    {/* LOOK 1: THE ESTABLISHMENT (Text Left, Image Right) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '3rem', marginBottom: '8rem', alignItems: 'center' }}>
                        <div>
                            <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', color: 'var(--crimson-light)', textTransform: 'uppercase', marginBottom: '0.5rem', fontWeight: 800 }}>THE ESTABLISHMENT</h2>
                            <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600, marginBottom: '2rem' }}>
                                Founder & Technical Director: {founder.name}
                            </div>
                            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '1.5rem' }}>Founded in 2011, SKF Karate has carefully structured a world-class martial arts curriculum deeply rooted in authentic WKF (World Karate Federation) standards. What began as a single dojo has expanded into a premier coaching establishment dedicated to physical mastery, self-defense, and elite tournament performance.</p>
                                <p style={{ marginBottom: '1.5rem' }}>We operate strictly as an educational institution with verified coaching methodologies. Under elite guidance, technology and sports science play a crucial role in how our athletes prepare, engage, and dominate on the global stage.</p>
                                <p>More than just an academy, SKF reflects a commitment to innovation while preserving the classical values of WKF Karate in a modern, highly engaging environment.</p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Link href={`/instructors/${founder.slug}`} style={{ textDecoration: 'none', display: 'block', width: '100%' }}>
                                <div className="hover:-translate-y-1 transition-all duration-300" style={{ position: 'relative', width: '100%', maxWidth: '380px', margin: '0 auto', aspectRatio: '3/4', borderRadius: '8px', overflow: 'hidden', borderBottom: '5px solid var(--crimson-light)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
                                    <Image src={founder.image} alt={founder.name} fill style={{ objectFit: 'cover', objectPosition: 'center 10%' }} />
                                </div>
                            </Link>
                            <div style={{ marginTop: '2rem', maxWidth: '380px', margin: '0 auto', textAlign: 'center' }}>
                                <blockquote style={{ fontSize: '1.25rem', color: 'var(--crimson-light)', fontWeight: 600, lineHeight: 1.5, fontStyle: 'italic' }}>
                                    "Our singular mission is to build highly resilient, confident athletes equipped completely for the real world."
                                </blockquote>
                            </div>
                        </div>
                    </div>

                    {/* LOOK 2: THE LEGACY (Image Left, Text Right) - Flipping the layout */}
                    <div style={{ display: 'flex', flexWrap: 'wrap-reverse', gap: '4rem', alignItems: 'center', marginBottom: '8rem' }}>
                        <div style={{ flex: '1 1 400px' }}>
                            <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', borderRadius: '8px', overflow: 'hidden', borderBottom: '5px solid var(--gold)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                                <Image src="/gallery/In Dojo.jpeg" alt="SKF Karate Training Dojo" fill style={{ objectFit: 'cover', objectPosition: 'center 40%' }} />
                            </div>
                        </div>
                        
                        <div style={{ flex: '1 1 400px' }}>
                            <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: '2rem', fontWeight: 800 }}>THE LEGACY</h2>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                        <FaMedal style={{ color: 'var(--gold)', fontSize: '1.2rem' }}/> <span style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600 }}>Arjun Raghavendra — National Gold, Kumite Under 67kg, 2025</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                        <FaTrophy style={{ color: 'var(--gold)', fontSize: '1.2rem' }}/> <span style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600 }}>87 Official Black Belt Graduations to Date</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <FaCheckCircle style={{ color: 'var(--gold)', fontSize: '1.2rem' }}/> <span style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 600 }}>6 Consecutive State and National Championships Won</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* WKF Style Executive Committee Text & Photo */}
                    <div style={{ marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-heading)', color: 'var(--crimson-light)', textTransform: 'uppercase', marginBottom: '2rem', fontWeight: 800 }}>SKF EXECUTIVE COMMITTEE</h2>
                        
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'flex-start', marginBottom: '5rem' }}>
                            <div style={{ flex: '1 1 400px', color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem', lineHeight: 1.7 }}>
                                <p style={{ marginBottom: '1rem' }}>The Executive Committee is responsible for leading, managing, and administering all SKF activities by developing programs following the strict directives approved by the global certifying bodies.</p>
                                <p>Composed of our most senior Masters, the Executive Committee ensures an unparalleled standard of education, tactical mastery, and athlete safety across all official Dojo branches.</p>
                            </div>
                            <div style={{ flex: '1 1 500px' }}>
                                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', borderBottom: '5px solid var(--crimson-light)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                                    <Image src="/gallery/In Dojo.jpeg" alt="SKF Executive Committee" fill style={{ objectFit: 'cover' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* WKF 3-Column Roster Grid with Circular Avatars */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '5rem 2.5rem', marginBottom: '6rem' }}>
                        {activeCommittee.map((instructor, idx) => (
                            <Link key={idx} href={`/instructors/${instructor.slug}`} style={{ textDecoration: 'none', display: 'block', color: 'inherit' }} className="group">
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {/* Structural Title Above */}
                                    <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', color: '#fff', textTransform: 'uppercase', fontWeight: 800, marginBottom: '2rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        {instructor.title}
                                    </div>
                                    
                                    {/* Circular Avatar + Crimson Name Side-by-Side */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <div style={{ position: 'relative', width: '110px', height: '110px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '3px solid transparent' }} className="group-hover:border-[#d62828] transition-colors duration-300">
                                            <Image src={instructor.image} alt={instructor.name} fill style={{ objectFit: 'cover', objectPosition: 'center 15%' }} />
                                        </div>
                                        <div>
                                            <div className="group-hover:text-white transition-colors duration-300" style={{ color: 'var(--crimson-light)', fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem', lineHeight: 1.2 }}>
                                                {instructor.name}
                                            </div>
                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                                {instructor.branch} <br />
                                                <span style={{ fontSize: '0.8rem', marginTop: '0.4rem', display: 'inline-block', fontStyle: 'italic' }}>({instructor.rank || instructor.dan})</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Language / Spec Pills (Mimicking WKF ENG ESP FRA) */}
                                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: '2rem' }}>
                                        <div className="group-hover:bg-[#d62828] transition-colors duration-300" style={{ background: '#730000', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '0.4rem 1rem', borderRadius: '100px' }}>PROFILE</div>
                                        <div style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '0.4rem 1rem', borderRadius: '100px' }}>ACHIEVEMENTS</div>
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
