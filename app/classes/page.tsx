import Link from 'next/link'
import Image from 'next/image'
import { FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa'
import { getAllCities } from '@/lib/classesData'
import './classes.css'

export const metadata = {
    title: 'Karate Classes Across India',
    description: 'Find SKF Karate classes in Bangalore, Pondicherry, Tumkur, and Udupi. Group classes and personal training available. Book a free trial today.',
}

export default function ClassesPage() {
    const cities = getAllCities()

    return (
        <div className="classes-page">
            {/* ═══════ HERO ═══════ */}
            <section className="page-hero">
                <div className="page-hero__bg"></div>
                <div className="glow glow-red page-hero__glow-1"></div>
                <div className="glow glow-gold page-hero__glow-2"></div>
                <div className="container page-hero__content">
                    <span className="section-label"><FaMapMarkerAlt /> Training Locations</span>
                    <h1 className="page-hero__title">
                        Karate Classes <span className="text-gradient">Across India</span>
                    </h1>
                    <p className="page-hero__subtitle">
                        Traditional WKF karate training · Group Classes & Personal Training
                    </p>
                </div>
            </section>

            {/* ═══════ CITY GRID ═══════ */}
            <section className="section section--tint-cool">
                <div className="container">
                    <div className="classes-grid">
                        {cities.map((city) => {
                            const branchCount = city.branches.length
                            const schoolCount = city.schools.length
                            let subtitle = `${branchCount} ${branchCount === 1 ? 'Branch' : 'Branches'}`
                            if (schoolCount > 0) subtitle += ` · ${schoolCount} Schools`

                            return (
                                <Link
                                    key={city.slug}
                                    href={`/classes/${city.slug}`}
                                    className="city-card"
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
                                    <div className="city-card__content">
                                        <h2 className="city-card__name">{city.name}</h2>
                                        <span className="city-card__state">{city.state}</span>
                                        <span className="city-card__meta">{subtitle}</span>
                                    </div>
                                    <div className="city-card__arrow">
                                        <FaArrowRight />
                                    </div>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Personal Training teaser */}
                    <div className="pt-teaser">
                        <div className="pt-teaser__content">
                            <h3>Personal Training</h3>
                            <p>One-on-one coaching with certified black belt instructors. Tailored to your goals — technique, competition prep, fitness, or self-defence.</p>
                        </div>
                        <Link href="/contact?subject=Personal%20Training" className="btn btn-secondary pt-teaser__btn">
                            Enquire About Personal Training <FaArrowRight />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
