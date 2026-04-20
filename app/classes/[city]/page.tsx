import Link from 'next/link'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import {
    FaArrowLeft,
    FaArrowRight,
    FaMapMarkerAlt,
    FaClock,
    FaPhoneAlt,
    FaSchool,
    FaUserTie,
    FaStar,
    FaWhatsapp,
    FaGraduationCap,
    FaFistRaised,
    FaUsers,
    FaCalendarAlt,
} from 'react-icons/fa'
import { getCityBySlug, getAllCities, formatClassDays } from '@/lib/classesData'
import '../classes.css'

export async function generateStaticParams() {
    return getAllCities().map((city) => ({ city: city.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }) {
    const { city: citySlug } = await params
    const city = getCityBySlug(citySlug)
    if (!city) return {}
    return {
        title: `Karate Classes in ${city.name}`,
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
        <div className="classes-page">
            {/* ═══════ HERO WITH CITY PHOTO ═══════ */}
            <section className="city-hero">
                <div className="city-hero__bg">
                    <Image
                        src={city.photo}
                        alt={`SKF Karate training in ${city.name}`}
                        fill
                        sizes="100vw"
                        priority
                        className="city-hero__bg-img"
                    />
                    <div className="city-hero__overlay" />
                </div>
                <div className="glow glow-red city-hero__glow-1" />
                <div className="glow glow-gold city-hero__glow-2" />

                <div className="container city-hero__content">
                    <Link href="/classes" className="city-back">
                        <FaArrowLeft /> All Locations
                    </Link>

                    <span className="section-label">
                        <FaMapMarkerAlt /> {city.state}
                    </span>
                    <h1 className="city-hero__title">
                        Karate Classes in{' '}
                        <span className="text-gradient">{city.name}</span>
                    </h1>
                    <p className="city-hero__subtitle">
                        Traditional WKF karate training across {city.branches.length}{' '}
                        {city.branches.length === 1 ? 'location' : 'locations'}
                        {city.schools.length > 0 && ` and ${city.schools.length} school programs`}
                    </p>
                </div>
            </section>

            {/* ═══════ STATS RIBBON ═══════ */}
            <section className="city-stats-ribbon">
                <div className="container">
                    <div className="city-stats-ribbon__grid">
                        <div className="city-stat">
                            <div className="city-stat__icon">
                                <FaMapMarkerAlt />
                            </div>
                            <div className="city-stat__content">
                                <span className="city-stat__value">{city.branches.length}</span>
                                <span className="city-stat__label">
                                    {city.branches.length === 1 ? 'Branch' : 'Branches'}
                                </span>
                            </div>
                        </div>
                        <div className="city-stat">
                            <div className="city-stat__icon city-stat__icon--gold">
                                <FaCalendarAlt />
                            </div>
                            <div className="city-stat__content">
                                <span className="city-stat__value">{totalClassDays}</span>
                                <span className="city-stat__label">Days / Week</span>
                            </div>
                        </div>
                        <div className="city-stat">
                            <div className="city-stat__icon city-stat__icon--crimson">
                                <FaGraduationCap />
                            </div>
                            <div className="city-stat__content">
                                <span className="city-stat__value">{city.schools.length}</span>
                                <span className="city-stat__label">School Programs</span>
                            </div>
                        </div>
                        {hasHQ && (
                            <div className="city-stat">
                                <div className="city-stat__icon city-stat__icon--hq">
                                    <FaStar />
                                </div>
                                <div className="city-stat__content">
                                    <span className="city-stat__value">HQ</span>
                                    <span className="city-stat__label">Headquarters</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ═══════ BRANCHES ═══════ */}
            <section className="section section--tint-cool">
                <div className="container">
                    <div className="city-section-header">
                        <span className="section-label">
                            <FaFistRaised /> Training Centres
                        </span>
                        <h2 className="section-title">
                            Our <span className="text-gradient">Dojos</span>
                        </h2>
                        <p className="section-subtitle">
                            Each branch features certified black belt instructors and structured
                            WKF-standard training programs.
                        </p>
                    </div>

                    <div className="branch-grid branch-grid--enhanced">
                        {city.branches.map((branch, index) => (
                            <Link
                                key={branch.slug}
                                href={`/classes/${citySlug}/${branch.slug}`}
                                className="branch-card branch-card--enhanced"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Card Image */}
                                <div className="branch-card__image branch-card__image--tall">
                                    <Image
                                        src={branch.photos[0] || '/gallery/In Dojo.jpeg'}
                                        alt={`SKF Karate ${branch.name}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                    <div className="branch-card__image-overlay" />
                                    {branch.isHQ && (
                                        <span className="branch-card__hq-badge">
                                            <FaStar /> Headquarters
                                        </span>
                                    )}
                                    {/* Floating class time badge */}
                                    <div className="branch-card__time-badge">
                                        <FaClock />
                                        <span>{branch.classTime}</span>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="branch-card__body">
                                    <h2 className="branch-card__name">{branch.name}</h2>
                                    <p className="branch-card__description">{branch.description}</p>

                                    <div className="branch-card__info">
                                        <div className="branch-card__info-item">
                                            <FaUserTie className="branch-card__info-icon" />
                                            <span>
                                                <strong>{branch.sensei}</strong> · {branch.senseiDan}
                                            </span>
                                        </div>
                                        <div className="branch-card__info-item">
                                            <FaCalendarAlt className="branch-card__info-icon" />
                                            <span>{formatClassDays(branch.classDays)}</span>
                                        </div>
                                        <div className="branch-card__info-item">
                                            <FaMapMarkerAlt className="branch-card__info-icon" />
                                            <span>{branch.address.split(',').slice(0, 2).join(',')}</span>
                                        </div>
                                    </div>

                                    <div className="branch-card__footer">
                                        <span className="branch-card__cta">
                                            View Details & Schedule <FaArrowRight />
                                        </span>
                                        <span className="branch-card__whatsapp-hint">
                                            <FaWhatsapp /> Quick Enquiry
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ SCHOOL PROGRAMS ═══════ */}
            {city.schools.length > 0 && (
                <section className="section section--tint-warm">
                    <div className="container">
                        <div className="city-section-header">
                            <span className="section-label">
                                <FaSchool /> Partnered Institutions
                            </span>
                            <h2 className="section-title">
                                School <span className="text-gradient">Programs</span>
                            </h2>
                            <p className="section-subtitle">
                                We bring world-class karate training directly to educational institutions,
                                building discipline, fitness, and confidence in students.
                            </p>
                        </div>

                        <div className="school-programs-grid">
                            {city.schools.map((school, index) => (
                                <div
                                    key={school.name}
                                    className="school-program-card"
                                    style={{ animationDelay: `${index * 0.08}s` }}
                                >
                                    <div className="school-program-card__icon">
                                        <FaGraduationCap />
                                    </div>
                                    <div className="school-program-card__content">
                                        <h3 className="school-program-card__name">{school.name}</h3>
                                        <span className="school-program-card__city">
                                            <FaMapMarkerAlt /> {city.name}
                                        </span>
                                    </div>
                                    <div className="school-program-card__accent" />
                                </div>
                            ))}
                        </div>

                        <div className="school-programs-cta">
                            <p>
                                Want to bring SKF Karate to your school?{' '}
                                <Link href="/contact?subject=School%20Programs" className="school-programs-cta__link">
                                    Get in touch with us <FaArrowRight />
                                </Link>
                            </p>
                        </div>
                    </div>
                </section>
            )}

            {/* ═══════ BOTTOM CTA ═══════ */}
            <section className="city-cta-section">
                <div className="city-cta-section__bg" />
                <div className="container">
                    <div className="city-cta-card">
                        <div className="city-cta-card__glow" />
                        <div className="city-cta-card__content">
                            <h2 className="city-cta-card__title">
                                Ready to Start Your{' '}
                                <span className="text-gradient">Karate Journey</span>?
                            </h2>
                            <p className="city-cta-card__text">
                                Book a free trial class at any of our {city.name} branches.
                                No experience needed — all ages welcome.
                            </p>
                            <div className="city-cta-card__actions">
                                <Link
                                    href="/contact?subject=Free%20Trial%20Class"
                                    className="btn btn-primary"
                                >
                                    Book Free Trial <FaArrowRight />
                                </Link>
                                <a
                                    href={`https://wa.me/${city.branches[0].whatsapp}?text=Hi,%20I'm%20interested%20in%20karate%20classes%20in%20${city.name}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary"
                                >
                                    <FaWhatsapp /> WhatsApp Us
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
