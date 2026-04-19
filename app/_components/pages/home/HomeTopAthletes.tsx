'use client'

import Link from 'next/link'
import { FaTrophy, FaArrowRight, FaMedal } from 'react-icons/fa'

/* ── Top 3 athletes — will be dynamic from admin later ── */
const topAthletes = [
    {
        name: 'Athlete Name',
        category: 'Junior Kata',
        branch: 'Koramangala',
        medals: { gold: 3, silver: 2, bronze: 1 },
        rank: 1,
        profileSlug: 'athlete-1',
    },
    {
        name: 'Athlete Name',
        category: 'Cadet Kumite',
        branch: 'Whitefield',
        medals: { gold: 2, silver: 3, bronze: 0 },
        rank: 2,
        profileSlug: 'athlete-2',
    },
    {
        name: 'Athlete Name',
        category: 'Senior Kata',
        branch: 'Koramangala',
        medals: { gold: 2, silver: 1, bronze: 2 },
        rank: 3,
        profileSlug: 'athlete-3',
    },
]

export default function HomeTopAthletes() {
    return (
        <section className="home-top-athletes section section--tint-mid">
            <div className="container">
                <div className="home-top-athletes__header">
                    <span className="section-label"><FaTrophy /> Champions</span>
                    <h2 className="section-title">
                        Our Top <span className="text-gradient">Athletes</span>
                    </h2>
                    <p className="section-subtitle">
                        The highest-ranked competitors across all SKF Karate branches.
                    </p>
                </div>

                <div className="home-top-athletes__grid">
                    {topAthletes.map((athlete) => (
                        <div key={athlete.rank} className="athlete-podium-card">
                            <div className={`athlete-podium-card__rank athlete-podium-card__rank--${athlete.rank}`}>
                                {athlete.rank}
                            </div>

                            <div className="athlete-podium-card__avatar">
                                {athlete.name[0]}
                            </div>

                            <h3 className="athlete-podium-card__name">{athlete.name}</h3>
                            <span className="athlete-podium-card__category">{athlete.category}</span>
                            <span className="athlete-podium-card__branch">{athlete.branch}</span>

                            <div className="athlete-podium-card__medals">
                                {athlete.medals.gold > 0 && (
                                    <span className="medal medal--gold">
                                        <FaMedal /> {athlete.medals.gold}
                                    </span>
                                )}
                                {athlete.medals.silver > 0 && (
                                    <span className="medal medal--silver">
                                        <FaMedal /> {athlete.medals.silver}
                                    </span>
                                )}
                                {athlete.medals.bronze > 0 && (
                                    <span className="medal medal--bronze">
                                        <FaMedal /> {athlete.medals.bronze}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="home-top-athletes__cta">
                    <Link href="/rankings" className="btn btn-secondary">
                        View Full Rankings <FaArrowRight />
                    </Link>
                </div>
            </div>
        </section>
    )
}
