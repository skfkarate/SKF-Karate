import Link from 'next/link'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import {
    FaArrowLeft,
    FaArrowRight,
    FaMapMarkerAlt,
    FaClock,
    FaSchool,
    FaUserTie,
    FaStar,
    FaWhatsapp,
    FaGraduationCap,
    FaFistRaised,
    FaCalendarAlt,
} from 'react-icons/fa'
import { getCityBySlug, getAllCities, formatClassDays } from '@/lib/classesData'
import '../obsidian.css' // Import Obsidian styles instead of legacy classes.css


export async function generateStaticParams() {
    return getAllCities().map((city) => ({ city: city.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
    const { city: citySlug } = await params
    const city = getCityBySlug(citySlug)
    if (!city) return {}
    return {
        title: `Karate Classes in ${city.name} | SKF`,
        description: `Find SKF Karate branches and class schedules in ${city.name}, ${city.state}. Group classes and personal training. Book a free trial.`,
    }
}

export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
    const { city: citySlug } = await params
    const city = getCityBySlug(citySlug)
    if (!city) notFound()

    if (city.branches.length === 1 && city.schools.length === 0) {
        redirect(`/classes/${citySlug}/${city.branches[0].slug}`)
    }

    const totalClassDays = new Set(city.branches.flatMap((b) => b.classDays)).size
    const hasHQ = city.branches.some((b) => b.isHQ)

    return (
        <div className="obs-page">
            <div className="obs-orb obs-orb--1" />
            <div className="obs-orb obs-orb--2" />
            <div className="obs-orb obs-orb--3" />
            <div className="obs-watermark">道場</div>

            {/* HERO */}
            <section className="obs-hero">
                <Link href="/classes" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2rem', textDecoration: 'none' }}>
                    <FaArrowLeft /> ALL LOCATIONS
                </Link>
                <div className="obs-hero__badge">
                    <div className="obs-hero__badge-dot" /> {city.state}
                </div>
                <h1 className="obs-hero__title" style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)' }}>
                    <span className="obs-hero__line1">{city.name}</span>
                </h1>
                <p className="obs-hero__sub">
                    Traditional WKF karate training across {city.branches.length} {city.branches.length === 1 ? 'location' : 'locations'}
                    {city.schools.length > 0 && ` and ${city.schools.length} school programs`}
                </p>

                {/* Hero Stats */}
                <div className="obs-hstats">
                    <div className="obs-hstat">
                        <span className="obs-hstat__val">{city.branches.length}</span>
                        <span className="obs-hstat__lbl">{city.branches.length === 1 ? 'Branch' : 'Branches'}</span>
                    </div>
                    <div className="obs-hstat">
                        <span className="obs-hstat__val">{totalClassDays}</span>
                        <span className="obs-hstat__lbl">Days / Week</span>
                    </div>
                    {city.schools.length > 0 && (
                        <div className="obs-hstat">
                            <span className="obs-hstat__val">{city.schools.length}</span>
                            <span className="obs-hstat__lbl">School Programs</span>
                        </div>
                    )}
                    {hasHQ && (
                        <div className="obs-hstat">
                            <span className="obs-hstat__val">HQ</span>
                            <span className="obs-hstat__lbl">Headquarters</span>
                        </div>
                    )}
                </div>
            </section>

            {/* BRANCHES (Bento Cards - 1 per row) */}
            <section className="obs-section">
                <div className="obs-sec-head">
                    <div className="obs-sec-head__bar" />
                    <h2>TRAINING CENTRES</h2>
                </div>

                <div className="obs-grid">
                    {city.branches.map((branch) => (
                        <div
                            key={branch.slug}
                            className="obs-card"
                            style={{ cursor: 'default' }}
                        >
                            <div className="obs-card__img-wrap">
                                <Image
                                    src={branch.photos[0] || '/gallery/In Dojo.jpeg'}
                                    alt={`SKF Karate ${branch.name}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="obs-card__img"
                                />
                                <div className="obs-card__img-overlay" />

                                <div className="obs-card__badges">
                                    {branch.isHQ && <span className="obs-badge obs-badge--hq"><FaStar size={10} /> Headquarters</span>}
                                    <span className="obs-badge"><FaClock size={10} /> {branch.classTime}</span>
                                </div>
                            </div>

                            <div className="obs-card__content">
                                <span className="obs-card__state">DOJO</span>
                                <h3 className="obs-card__name" style={{ fontSize: '1.6rem' }}>{branch.name}</h3>

                                <div className="obs-card-branch-info" style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                                        <FaUserTie style={{ color: 'var(--gold, #ffb703)' }} /> <strong>{branch.sensei}</strong> · {branch.senseiDan}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                                        <FaCalendarAlt style={{ color: 'var(--gold, #ffb703)' }} /> {formatClassDays(branch.classDays)}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)' }}>
                                        <FaMapMarkerAlt style={{ color: 'var(--gold, #ffb703)' }} /> {branch.address.split(',').slice(0, 2).join(',')}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.8rem', marginTop: 'auto' }}>
                                    <Link href={`/classes/${citySlug}/${branch.slug}`} className="obs-cta-btn" style={{flex: 1, justifyContent: 'center', background: 'rgba(255,255,255,0.05)'}}>
                                        View Details
                                    </Link>
                                    <Link 
                                        href={`/book-trial?branch=${branch.slug}`} 
                                        className="obs-cta-btn obs-cta-btn--prime" 
                                        style={{ flex: 1, justifyContent: 'center' }}
                                    >
                                        Book Trial
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SCHOOL PROGRAMS */}
            {city.schools.length > 0 && (
                <section className="obs-section">
                    <div className="obs-sec-head">
                        <div className="obs-sec-head__bar" />
                        <h2>SCHOOL PROGRAMS</h2>
                    </div>
                    <div className="obs-grid">
                        {city.schools.map((school) => (
                            <div key={school.name} className="obs-card" style={{ padding: '0', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,183,3,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold, #ffb703)' }}>
                                        <FaGraduationCap size={20} />
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontFamily: 'var(--font-heading), sans-serif', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{school.name}</h3>
                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.3rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <FaMapMarkerAlt /> {city.name}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* CTA SECTION */}
            <section className="obs-section obs-cta-wrapper">
                <div className="obs-cta-card obs-cta-card--prime" style={{ maxWidth: '850px', margin: '0 auto' }}>
                    <div className="obs-cta-card__glow" />
                    <div className="obs-cta-card__icon obs-cta-card__icon--prime"><FaFistRaised size={24} /></div>
                    <h3 className="obs-cta-card__title">Confused about which branch to choose?</h3>
                    <p className="obs-cta-card__text">Contact us to find the nearest branch and book your free trial classes.</p>
                    <div className="obs-cta-card__actions">
                        <Link href="/contact?subject=Free%20Trial%20Class" className="obs-cta-btn obs-cta-btn--prime">
                            Contact Us <FaArrowRight size={12} />
                        </Link>
                        <a href={`https://wa.me/${city.branches[0].whatsapp}?text=Hi,%20I'm%20interested%20in%20karate%20classes%20in%20${city.name}`} target="_blank" rel="noopener noreferrer" className="obs-cta-wa">
                            <FaWhatsapp size={16} /> WhatsApp Us
                        </a>
                    </div>
                </div>
            </section>
        </div>
    )
}
