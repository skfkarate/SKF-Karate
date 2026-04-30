import Link from 'next/link'
import Image from 'next/image'
import { FaTrophy, FaArrowRight, FaMedal } from 'react-icons/fa'
import {
  getAllAthletesLive,
  getRankSnapshotsLive,
} from '@/lib/server/repositories/athletes-live'
import ScrollReveal from '@/app/_components/ScrollReveal'

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
                profileImageUrl: athlete.photoConsent ? athlete.photoUrl : '',
            }
        })
        .filter(Boolean)

    // Fallback data for development if DB is empty
    let displayAthletes = topAthletes
    if (displayAthletes.length === 0) {
        if (process.env.NODE_ENV === 'development') {
            displayAthletes = [
                { name: 'John Doe', category: 'BLACK BELT', branch: 'Main Dojo', medals: { gold: 5, silver: 2, bronze: 1 }, totalPoints: 1200, registrationNumber: 'SKF001', rank: 1, profileImageUrl: null },
                { name: 'Jane Smith', category: 'BROWN BELT', branch: 'West Side', medals: { gold: 3, silver: 4, bronze: 0 }, totalPoints: 950, registrationNumber: 'SKF002', rank: 2, profileImageUrl: null },
                { name: 'Mike Ross', category: 'PURPLE BELT', branch: 'North Dojo', medals: { gold: 1, silver: 5, bronze: 3 }, totalPoints: 800, registrationNumber: 'SKF003', rank: 3, profileImageUrl: null },
            ]
        } else {
            return null
        }
    }

    // Reorder for podium display: [2nd, 1st, 3rd]
    const podiumOrder = []
    if (displayAthletes[1]) podiumOrder.push(displayAthletes[1])
    if (displayAthletes[0]) podiumOrder.push(displayAthletes[0])
    if (displayAthletes[2]) podiumOrder.push(displayAthletes[2])

    return (
        <section className="home-top-athletes section section--tint-mid">
            <div className="container">
                <ScrollReveal>
                    <div className="home-top-athletes__header">
                        <span className="section-label"><FaTrophy /> Champions</span>
                        <h2 className="section-title">
                            Our Top <span className="text-gradient">Athletes</span>
                        </h2>
                        <p className="section-subtitle">
                            The highest-ranked competitors across all SKF Karate branches.
                        </p>
                    </div>
                </ScrollReveal>

                <div className="home-top-athletes__grid">
                    {podiumOrder.map((athlete, i) => (
                        <ScrollReveal key={athlete.rank} delay={i * 0.1}>
                            <Link
                                href={`/athlete/${athlete.registrationNumber}`}
                                className={`athlete-podium-card athlete-podium-card--rank-${athlete.rank}`}
                                aria-label={`View profile for ${athlete.name}, ranked #${athlete.rank}`}
                            >
                                <div className={`athlete-podium-card__rank athlete-podium-card__rank--${athlete.rank}`}>
                                    {athlete.rank}
                                </div>

                                <div className="athlete-podium-card__avatar">
                                    {athlete.profileImageUrl ? (
                                        <Image
                                            src={athlete.profileImageUrl}
                                            alt={athlete.name}
                                            fill
                                            sizes="72px"
                                            className="athlete-podium-card__image"
                                        />
                                    ) : (
                                        <span>{athlete.name.charAt(0)}</span>
                                    )}
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
                        </ScrollReveal>
                    ))}
                </div>

                <ScrollReveal delay={0.4}>
                    <div className="home-top-athletes__cta">
                        <Link href="/rankings" className="btn btn-secondary">
                            View Full Rankings <FaArrowRight />
                        </Link>
                    </div>
                </ScrollReveal>
            </div>
        </section>
    )
}
