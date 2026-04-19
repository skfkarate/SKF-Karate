'use client'

import Link from 'next/link'
import Image from 'next/image'
import { FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa'
import { getAllCities } from '@/lib/classesData'

export default function HomeClassesPreview() {
    const cities = getAllCities()

    return (
        <section className="home-classes-preview section section--tint-cool">
            <div className="container">
                <div className="home-classes-preview__header">
                    <span className="section-label"><FaMapMarkerAlt /> Training Locations</span>
                    <h2 className="section-title">
                        Find Classes <span className="text-gradient">Near You</span>
                    </h2>
                    <p className="section-subtitle">
                        Group classes and personal training across 4 cities.
                    </p>
                </div>

                <div className="home-classes-preview__grid">
                    {cities.map((city) => (
                        <Link
                            key={city.slug}
                            href={`/classes/${city.slug}`}
                            className="home-city-card"
                        >
                            <div className="home-city-card__image">
                                <Image
                                    src={city.photo}
                                    alt={`SKF Karate ${city.name}`}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 25vw"
                                    style={{ objectFit: 'cover' }}
                                />
                                <div className="home-city-card__overlay" />
                            </div>
                            <div className="home-city-card__content">
                                <h3 className="home-city-card__name">{city.name}</h3>
                                <span className="home-city-card__count">
                                    {city.branches.length} {city.branches.length === 1 ? 'Branch' : 'Branches'}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="home-classes-preview__cta">
                    <Link href="/classes" className="btn btn-secondary">
                        View All Classes <FaArrowRight />
                    </Link>
                </div>
            </div>
        </section>
    )
}
