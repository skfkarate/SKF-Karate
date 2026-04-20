import Link from 'next/link'
import { FaTrophy, FaArrowRight, FaMedal } from 'react-icons/fa'
import { getFeaturedAthletes } from '@/lib/server/repositories/athletes'

export default async function HomeTopAthletes() {
    // Fetch directly from the JSON DB repository
    const athletes = await Promise.resolve(getFeaturedAthletes())

    // Map and calculate medals based on achievements
    const topAthletes = athletes.map(athlete => {
        let gold = 0, silver = 0, bronze = 0;
        
        athlete.achievements?.forEach((ach: any) => {
            if (ach.type === 'tournament-gold') gold++
            if (ach.type === 'tournament-silver') silver++
            if (ach.type === 'tournament-bronze') bronze++
        })

        const totalPoints = (gold * 10) + (silver * 5) + (bronze * 2)

        return {
            name: `${athlete.firstName} ${athlete.lastName}`,
            category: athlete.currentBelt.toUpperCase() + ' BELT',
            branch: athlete.branchName,
            medals: { gold, silver, bronze },
            totalPoints,
            registrationNumber: athlete.registrationNumber
        }
    })
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 3) 
    .map((athlete, index) => ({ ...athlete, rank: index + 1 }))

    if (topAthletes.length === 0) {
        return null // Hide section if no featured athletes
    }

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
                        <Link href={`/athlete/${athlete.registrationNumber}`} key={athlete.rank} className="athlete-podium-card" style={{ textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'pointer' }}>
                            <div className={`athlete-podium-card__rank athlete-podium-card__rank--${athlete.rank}`}>
                                {athlete.rank}
                            </div>

                            <div className="athlete-podium-card__avatar">
                                {athlete.name.charAt(0)}
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
                        </Link>
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
