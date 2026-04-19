import Image from 'next/image'
import Link from 'next/link'
import { FaMedal, FaStar } from 'react-icons/fa'
import { getAllAthletes, getRankSnapshots } from '@/lib/data/athletes'
import { getTournamentStats } from '@/lib/data/tournaments'
import '@/app/rankings/rankings.css'

export const metadata = {
  title: 'Honours Board | SKF Karate',
  description: 'Official SKF Karate honours board. Exploring our undisputed champions and medalists.',
}

function formatAchievementTitle(achievement: any) {
  return achievement.title.replace(/^(Gold|Silver|Bronze) Medal\s+[—-]\s+/i, '')
}

function getLatestAchievement(athlete: any, predicate: (ach: any) => boolean) {
  return [...(athlete.achievements || [])]
    .filter(predicate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null
}

function buildChampionEntry(athlete: any, achievement: any) {
  if (!achievement) return null

  return {
    athlete,
    achievement,
    label: formatAchievementTitle(achievement),
    date: new Date(achievement.date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  }
}

export default async function HonoursPage() {
  const athletes = getAllAthletes()
  const publicAthletes = athletes.filter((athlete) => athlete.isPublic)
  
  const snapshots = getRankSnapshots().filter((entry) => entry.totalPoints > 0)
  const tournamentStats = getTournamentStats()
  const rankings = snapshots.filter((entry) =>
    publicAthletes.some((athlete) => athlete.id === entry.athleteId)
  )

  const internationalHonours = publicAthletes
    .map((athlete) =>
      buildChampionEntry(
        athlete,
        getLatestAchievement(
          athlete,
          (achievement) =>
            achievement.type?.startsWith('tournament') &&
            achievement.tournamentLevel === 'international'
        )
      )
    )
    .filter((entry) => entry?.achievement)

  const nationalChampions = publicAthletes
    .map((athlete) =>
      buildChampionEntry(
        athlete,
        getLatestAchievement(
          athlete,
          (achievement) =>
            achievement.type === 'tournament-gold' &&
            achievement.tournamentLevel === 'national'
        )
      )
    )
    .filter((entry) => entry?.achievement)

  const stateChampions = publicAthletes
    .map((athlete) =>
      buildChampionEntry(
        athlete,
        getLatestAchievement(
          athlete,
          (achievement) =>
            achievement.type === 'tournament-gold' &&
            achievement.tournamentLevel === 'state'
        )
      )
    )
    .filter((entry) => entry?.achievement)

  const topRanked = rankings[0]
  const topRankedAthlete = publicAthletes.find((athlete) => athlete.id === topRanked?.athleteId) || null
  const highestLifetimeAthlete = [...publicAthletes].sort((a, b) => b.pointsLifetime - a.pointsLifetime)[0]
  const mostMedalledAthlete = [...publicAthletes]
    .map((athlete) => ({
      athlete,
      medals: (athlete.achievements || []).filter((achievement) =>
        ['tournament-gold', 'tournament-silver', 'tournament-bronze'].includes(achievement.type)
      ).length,
    }))
    .sort((a, b) => b.medals - a.medals)[0]

  const derivedAwards = [
    topRankedAthlete
      ? {
          title: 'Current #1 Ranked Athlete',
          recipient: `${topRankedAthlete.firstName} ${topRankedAthlete.lastName}`,
          detail: `${Number(topRanked?.totalPoints || 0).toFixed(0)} ranking points`,
          href: `/athlete/${topRankedAthlete.registrationNumber}`,
        }
      : null,
    highestLifetimeAthlete
      ? {
          title: 'Highest Lifetime Points',
          recipient: `${highestLifetimeAthlete.firstName} ${highestLifetimeAthlete.lastName}`,
          detail: `${highestLifetimeAthlete.pointsLifetime.toLocaleString()} academy points`,
          href: `/athlete/${highestLifetimeAthlete.registrationNumber}`,
        }
      : null,
    mostMedalledAthlete
      ? {
          title: 'Most Medals Recorded',
          recipient: `${mostMedalledAthlete.athlete.firstName} ${mostMedalledAthlete.athlete.lastName}`,
          detail: `${mostMedalledAthlete.medals} competition medals`,
          href: `/athlete/${mostMedalledAthlete.athlete.registrationNumber}`,
        }
      : null,
  ].filter(Boolean)

  const honoursSections = [
    {
      title: 'International Honours',
      description: 'Athletes who have medalled at international tournaments.',
      entries: internationalHonours,
    },
    {
      title: 'National Champions',
      description: 'Athletes with recorded national-level gold medals.',
      entries: nationalChampions,
    },
    {
      title: 'State Champions',
      description: 'Athletes with recorded state-level gold medals.',
      entries: stateChampions,
    },
  ]

  const stats = [
    { label: 'Total Tournaments', value: tournamentStats.totalTournaments },
    { label: 'Total Medals', value: tournamentStats.totalMedals },
    { label: 'National Champions', value: nationalChampions.length },
    { label: 'State Champions', value: stateChampions.length },
  ]

  return (
    <div className="rankings-page">
      <section className="rankings-hero">
          <div className="rankings-hero__bg">
              <div className="glow glow-red rankings-hero__glow-1"></div>
              <div className="glow glow-gold rankings-hero__glow-2"></div>
          </div>
          
          <div className="container rankings-hero__content">
              <span className="section-label"><FaMedal /> Worldwide Performance</span>
              <h1 className="rankings-hero__title">
                  Honours <span className="text-gradient">Board</span>
              </h1>
              <p className="rankings-hero__subtitle">
                  Celebrating our undisputed champions and exceptional athletes.
              </p>
          </div>
      </section>

      <div className="rankings-tab-content active honours-wrapper">
          {/* STATS */}
          <section className="hon-milestones-section" style={{ borderTop: 'none', background: 'transparent', padding: '3rem 0' }}>
              <div className="container">
                  <div className="hon-stats-row">
                      {stats.map((stat: any) => (
                          <div key={stat.label} className="hon-stat">
                              <p className="hon-stat__number">{stat.value}</p>
                              <p className="hon-stat__label">{stat.label}</p>
                          </div>
                      ))}
                  </div>
              </div>
          </section>

          {/* CHAMPIONS */}
          <section className="hon-champions-section" style={{ background: 'transparent' }}>
              <div className="container">
              {honoursSections.map((section: any) => (
                  <div key={section.title} className="hon-section-block">
                      <div className="text-center" style={{ marginBottom: '2.5rem' }}>
                          <h2 className="section-title">
                              {section.title.split(' ')[0]} <span className="text-gradient">{section.title.split(' ').slice(1).join(' ')}</span>
                          </h2>
                          <p className="hon-section-desc" style={{ color: 'var(--text-muted)' }}>{section.description}</p>
                      </div>

                      {section.entries.length === 0 ? (
                          <div className="hon-empty">No qualifying athlete records yet.</div>
                      ) : (
                          <div className="hon-champ-grid">
                          {section.entries.map(({ athlete, achievement, label, date }: any) => (
                              <div key={`${athlete.id}-${achievement.id}`} className="hon-champ-card">
                                  <div className="hon-champ-card__inner">
                                      <div className="hon-champ-card__avatar">
                                          {athlete.photoUrl ? (
                                              <Image
                                                  src={athlete.photoUrl}
                                                  alt={`${athlete.firstName} ${athlete.lastName}`}
                                                  width={80} height={80}
                                                  style={{ objectFit: 'cover', borderRadius: '50%' }}
                                              />
                                          ) : (
                                              <span>{athlete.firstName[0]}{athlete.lastName[0]}</span>
                                          )}
                                      </div>
                                      <h3 className="hon-champ-card__name">
                                          {athlete.firstName} {athlete.lastName}
                                      </h3>
                                      <p className="hon-champ-card__branch">SKF {athlete.branchName}</p>
                                      <p className="hon-champ-card__achievement" style={{ color: 'var(--gold)' }}>{label}</p>
                                      <p className="hon-champ-card__date">{date}</p>
                                      <div className="hon-champ-card__actions">
                                          <Link href={`/athlete/${athlete.registrationNumber}`} className="hon-link">
                                              View Athlete
                                          </Link>
                                      </div>
                                  </div>
                              </div>
                          ))}
                          </div>
                      )}
                  </div>
              ))}
              </div>
          </section>

          {/* DERIVED AWARDS */}
          <section className="hon-awards-section" style={{ background: 'var(--bg-card)', borderTop: 'var(--border-glass)', padding: '5rem 0' }}>
              <div className="container">
                  <div className="text-center" style={{ marginBottom: '3rem' }}>
                      <span className="section-label"><FaStar /> Highlights</span>
                      <h2 className="section-title">
                          Academy <span className="text-gradient">Records</span>
                      </h2>
                  </div>

                  <div className="hon-awards-grid">
                      {derivedAwards.map((award: any) => (
                          <Link key={award.title} href={award.href} className="hon-award-card">
                              <p className="hon-award-card__title">{award.title}</p>
                              <h3 className="hon-award-card__recipient">{award.recipient}</h3>
                              <p className="hon-award-card__detail" style={{ color: 'var(--gold)' }}>{award.detail}</p>
                          </Link>
                      ))}
                  </div>
              </div>
          </section>
      </div>
    </div>
  )
}
