import Link from 'next/link'
import Image from 'next/image'
import {
    FaMapMarkerAlt,
    FaArrowRight,
    FaUsers,
    FaFistRaised,
    FaGraduationCap,
    FaWhatsapp,
    FaClock,
    FaStar,
    FaSchool,
} from 'react-icons/fa'
import { getAllCities } from '@/lib/classesData'
import './classes.css'

export const metadata = {
    title: 'Karate Classes Across Karnataka',
    description:
        'Find SKF Karate classes in Bangalore, Kunigal, Tumkur, and Udupi. Group classes and personal training available. Book a free trial today.',
}

export default function ClassesPage() {
    const cities = getAllCities()

    // Aggregate stats
    const totalBranches = cities.reduce((sum, c) => sum + c.branches.length, 0)
    const totalSchools = cities.reduce((sum, c) => sum + c.schools.length, 0)
    const totalCities = cities.length

    return (
        <div className="classes-page">
            {/* ═══════ HERO ═══════ */}
            <section className="classes-hero">
                <div className="classes-hero__bg" />
                <div className="glow glow-red classes-hero__glow-1" />
                <div className="glow glow-gold classes-hero__glow-2" />
                <div className="container classes-hero__content">
                    <span className="section-label">
                        <FaMapMarkerAlt /> Training Locations
                    </span>
                    <h1 className="classes-hero__title">
                        Find Your <span className="text-gradient">Dojo</span>
                    </h1>
                    <p className="classes-hero__subtitle">
                        World-class WKF karate training across Karnataka.
                        <br />
                        Group classes, personal training, and school programs.
                    </p>

                    {/* Quick Stats */}
                    <div className="classes-hero__stats">
                        <div className="classes-hero__stat">
                            <span className="classes-hero__stat-value">{totalCities}</span>
                            <span className="classes-hero__stat-label">Cities</span>
                        </div>
                        <div className="classes-hero__stat-divider" />
                        <div className="classes-hero__stat">
                            <span className="classes-hero__stat-value">{totalBranches}</span>
                            <span className="classes-hero__stat-label">Branches</span>
                        </div>
                        <div className="classes-hero__stat-divider" />
                        <div className="classes-hero__stat">
                            <span className="classes-hero__stat-value">{totalSchools}</span>
                            <span className="classes-hero__stat-label">Schools</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ CITY GRID ═══════ */}
            <section className="section section--tint-cool">
                <div className="container">
                    <div className="city-section-header">
                        <span className="section-label">
                            <FaFistRaised /> Choose Your City
                        </span>
                        <h2 className="section-title">
                            Our <span className="text-gradient">Locations</span>
                        </h2>
                    </div>

                    <div className="classes-grid classes-grid--enhanced">
                        {cities.map((city, index) => {
                            const branchCount = city.branches.length
                            const schoolCount = city.schools.length
                            const hasHQ = city.branches.some((b) => b.isHQ)

                            const href =
                                branchCount === 1 && schoolCount === 0
                                    ? `/classes/${city.slug}/${city.branches[0].slug}`
                                    : `/classes/${city.slug}`

                            return (
                                <Link
                                    key={city.slug}
                                    href={href}
                                    className="city-card city-card--enhanced"
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="city-card__image">
                                        <Image
                                            src={city.photo}
                                            alt={`SKF Karate ${city.name}`}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            className="city-card__img"
                                        />
                                        <div className="city-card__overlay" />
                                    </div>

                                    {/* Badges */}
                                    <div className="city-card__badges">
                                        {hasHQ && (
                                            <span className="city-card__badge city-card__badge--hq">
                                                <FaStar /> HQ
                                            </span>
                                        )}
                                        <span className="city-card__badge">
                                            <FaMapMarkerAlt /> {branchCount}{' '}
                                            {branchCount === 1 ? 'Branch' : 'Branches'}
                                        </span>
                                        {schoolCount > 0 && (
                                            <span className="city-card__badge">
                                                <FaSchool /> {schoolCount} Schools
                                            </span>
                                        )}
                                    </div>

                                    <div className="city-card__content">
                                        <span className="city-card__state">{city.state}</span>
                                        <h2 className="city-card__name">{city.name}</h2>
                                        <div className="city-card__meta-row">
                                            <span className="city-card__meta">
                                                <FaClock />{' '}
                                                {city.branches[0]?.classTime || 'See schedule'}
                                            </span>
                                        </div>
                                        <span className="city-card__explore">
                                            Explore <FaArrowRight />
                                        </span>
                                    </div>

                                    <div className="city-card__arrow">
                                        <FaArrowRight />
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════ PERSONAL TRAINING + CONTACT CTA ═══════ */}
            <section className="section section--tint-warm">
                <div className="container">
                    <div className="classes-cta-grid">
                        {/* Personal Training */}
                        <div className="classes-cta-card">
                            <div className="classes-cta-card__icon">
                                <FaUsers />
                            </div>
                            <h3 className="classes-cta-card__title">Personal Training</h3>
                            <p className="classes-cta-card__text">
                                One-on-one coaching with certified black belt instructors.
                                Tailored to your goals — technique, competition prep, fitness, or
                                self-defence.
                            </p>
                            <Link
                                href="/contact?subject=Personal%20Training"
                                className="btn btn-secondary classes-cta-card__btn"
                            >
                                Enquire Now <FaArrowRight />
                            </Link>
                        </div>

                        {/* Free Trial */}
                        <div className="classes-cta-card classes-cta-card--primary">
                            <div className="classes-cta-card__glow" />
                            <div className="classes-cta-card__icon classes-cta-card__icon--crimson">
                                <FaFistRaised />
                            </div>
                            <h3 className="classes-cta-card__title">Free Trial Class</h3>
                            <p className="classes-cta-card__text">
                                Never tried karate? Start with a free trial at any of our
                                branches. No experience needed — all ages welcome.
                            </p>
                            <div className="classes-cta-card__actions">
                                <Link
                                    href="/contact?subject=Free%20Trial%20Class"
                                    className="btn btn-primary classes-cta-card__btn"
                                >
                                    Book Free Trial <FaArrowRight />
                                </Link>
                                <a
                                    href="https://wa.me/919019971726?text=Hi,%20I'm%20interested%20in%20a%20free%20trial%20karate%20class"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="classes-cta-card__whatsapp"
                                >
                                    <FaWhatsapp /> WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
