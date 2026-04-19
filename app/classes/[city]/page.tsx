import Link from 'next/link'
import Image from 'next/image'
import { notFound, redirect } from 'next/navigation'
import { FaArrowLeft, FaArrowRight, FaMapMarkerAlt, FaClock, FaPhoneAlt, FaSchool } from 'react-icons/fa'
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

    return (
        <div className="classes-page">
            {/* ═══════ HERO ═══════ */}
            <section className="page-hero">
                <div className="page-hero__bg"></div>
                <div className="glow glow-red page-hero__glow-1"></div>
                <div className="glow glow-gold page-hero__glow-2"></div>
                <div className="container page-hero__content">
                    <Link href="/classes" className="city-back"><FaArrowLeft /> All Locations</Link>
                    <h1 className="page-hero__title">
                        <span className="text-gradient">{city.name}</span>
                    </h1>
                    <p className="page-hero__subtitle">{city.state} · {city.branches.length} {city.branches.length === 1 ? 'Branch' : 'Branches'}</p>
                </div>
            </section>

            {/* ═══════ BRANCHES ═══════ */}
            <section className="section section--tint-cool">
                <div className="container">
                    <div className="branch-grid">
                        {city.branches.map((branch) => (
                            <Link
                                key={branch.slug}
                                href={`/classes/${citySlug}/${branch.slug}`}
                                className="branch-card"
                            >
                                <div className="branch-card__image">
                                    <Image
                                        src={branch.photos[0] || '/gallery/In Dojo.jpeg'}
                                        alt={`SKF Karate ${branch.name}`}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                    {branch.isHQ && <span className="branch-card__hq-badge">Headquarters</span>}
                                </div>

                                <div className="branch-card__body">
                                    <h2 className="branch-card__name">{branch.name}</h2>

                                    <div className="branch-card__info">
                                        <div className="branch-card__info-item">
                                            <FaClock className="branch-card__info-icon" />
                                            <span>{formatClassDays(branch.classDays)} · {branch.classTime}</span>
                                        </div>
                                        <div className="branch-card__info-item">
                                            <FaMapMarkerAlt className="branch-card__info-icon" />
                                            <span>{branch.address}</span>
                                        </div>
                                        <div className="branch-card__info-item">
                                            <FaPhoneAlt className="branch-card__info-icon" />
                                            <span>{branch.phone}</span>
                                        </div>
                                    </div>

                                    <div className="branch-card__actions">
                                        <span className="btn btn-primary">
                                            View Details <FaArrowRight />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* School Programs (only if schools exist) */}
                    {city.schools.length > 0 && (
                        <div className="schools-section">
                            <h3 className="schools-section__title"><FaSchool /> School Programs</h3>
                            <div className="schools-list">
                                {city.schools.map((school) => (
                                    <div key={school.name} className="school-chip">
                                        <FaSchool className="school-chip__icon" />
                                        {school.name}
                                    </div>
                                ))}
                            </div>
                            <p className="schools-contact">
                                Interested in our school programs? <Link href="/contact?subject=School%20Programs">Contact us for details →</Link>
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}
