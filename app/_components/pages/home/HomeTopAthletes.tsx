import Link from 'next/link'
import { FaTrophy, FaArrowRight, FaMedal } from 'react-icons/fa'
import {
  getAllAthletesLive,
  getRankSnapshotsLive,
} from '@/lib/server/repositories/athletes-live'

export default async function HomeTopAthletes() {
    const [athletes, snapshots] = await Promise.all([
        getAllAthletesLive(),
        getRankSnapshotsLive(),
    ])
    const athleteMap = new Map(
        athletes
            .filter((athlete) => athlete.isPublic && athlete.status === 'active')
            .map((athlete) => [String(athlete.id), athlete])
    )

    const topAthletes = snapshots
        .filter((snapshot) => athleteMap.has(String(snapshot.athleteId)) && Number(snapshot.totalPoints || 0) > 0)
        .sort((a, b) => Number(b.totalPoints || 0) - Number(a.totalPoints || 0))
        .slice(0, 3)
        .map((snapshot, index) => {
            const athlete = athleteMap.get(String(snapshot.athleteId))
            if (!athlete) return null

            return {
                name: `${athlete.firstName} ${athlete.lastName}`,
                category: athlete.currentBelt.toUpperCase() + ' BELT',
                branch: athlete.branchName,
                medals: {
                    gold: snapshot.goldCount || 0,
                    silver: snapshot.silverCount || 0,
                    bronze: snapshot.bronzeCount || 0,
                },
                totalPoints: snapshot.totalPoints || 0,
                registrationNumber: athlete.registrationNumber,
                rank: index + 1,
            }
        })
        .filter(Boolean)

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
