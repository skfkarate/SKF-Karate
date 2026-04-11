import Link from 'next/link'
import Image from 'next/image'

import { getAllAthletes, getRankSnapshots } from '@/lib/data/athletes'
import { getTournamentStats } from '@/lib/data/tournaments'

import './honours.css'

export const dynamic = 'force-dynamic'

function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

function formatAchievementTitle(achievement) {
  return achievement.title.replace(/^(Gold|Silver|Bronze) Medal\s+[—-]\s+/i, '')
}

function getLatestAchievement(athlete, predicate) {
  return [...(athlete.achievements || [])]
    .filter(predicate)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] || null
}

function buildChampionEntry(athlete, achievement) {
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

function getPublicAthletes() {
  return getAllAthletes().filter((athlete) => athlete.isPublic)
}

export default function HonoursPage() {
  const athletes = getPublicAthletes()
  const tournamentStats = getTournamentStats()
  const rankings = getRankSnapshots().filter((entry) =>
    athletes.some((athlete) => athlete.id === entry.athleteId)
  )

  const internationalHonours = athletes
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

  const nationalChampions = athletes
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

  const stateChampions = athletes
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
  const topRankedAthlete = athletes.find((athlete) => athlete.id === topRanked?.athleteId) || null
  const highestLifetimeAthlete = [...athletes].sort((a, b) => b.pointsLifetime - a.pointsLifetime)[0]
  const mostMedalledAthlete = [...athletes]
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

  const sections = [
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
    <div className="honours-page">
      <section className="hon-hero">
        <div className="hon-hero__bg">
          <div className="hon-hero__glow hon-hero__glow--1" />
          <div className="hon-hero__glow hon-hero__glow--2" />
        </div>
        <div className="container hon-hero__content">
          <span className="hon-badge hon-badge--center">Honours Board</span>
          <h1 className="hon-hero__title">
            SKF <span className="hon-text-grad">Excellence</span>
          </h1>
          <p className="hon-hero__subtitle">
            State, national, and international achievements driven directly from athlete records and tournament outcomes.
          </p>
        </div>
      </section>

      <section className="hon-milestones-section">
        <div className="container">
          <div className="hon-stats-row">
            {stats.map((stat) => (
              <div key={stat.label} className="hon-stat">
                <p className="hon-stat__number">{stat.value}</p>
                <p className="hon-stat__label">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="hon-champions-section">
        <div className="container">
          {sections.map((section) => (
            <div key={section.title} className="hon-section-block">
              <div className="text-center">
                <span className="hon-badge hon-badge--center">{section.title}</span>
                <h2 className="section-title">
                  {section.title.split(' ')[0]} <span className="hon-text-grad">{section.title.split(' ').slice(1).join(' ')}</span>
                </h2>
                <p className="hon-section-desc">{section.description}</p>
              </div>

              {section.entries.length === 0 ? (
                <div className="hon-empty">No qualifying athlete records yet.</div>
              ) : (
                <div className="hon-champ-grid">
                  {section.entries.map(({ athlete, achievement, label, date }) => (
                    <div key={`${athlete.id}-${achievement.id}`} className="hon-champ-card">
                      <div className="hon-champ-card__inner">
                        <div className="hon-champ-card__avatar">
                          {athlete.photoUrl ? (
                            <Image
                              src={athlete.photoUrl}
                              alt={`${athlete.firstName} ${athlete.lastName}`}
                              className="hon-champ-card__avatar-img"
                              width={80}
                              height={80}
                              style={{ objectFit: 'cover', borderRadius: '50%' }}
                            />
                          ) : (
                            <span>{getInitials(athlete.firstName, athlete.lastName)}</span>
                          )}
                        </div>
                        <h3 className="hon-champ-card__name">
                          {athlete.firstName} {athlete.lastName}
                        </h3>
                        <p className="hon-champ-card__branch">SKF {athlete.branchName}</p>
                        <p className="hon-champ-card__achievement">{label}</p>
                        <p className="hon-champ-card__date">{date}</p>
                        <div className="hon-champ-card__actions">
                          <Link href={`/athlete/${athlete.registrationNumber}`} className="hon-link">
                            View Athlete
                          </Link>
                          {achievement.sourceEventSlug ? (
                            <Link href={`/results/${achievement.sourceEventSlug}`} className="hon-link hon-link--ghost">
                              View Result
                            </Link>
                          ) : null}
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

      <section className="hon-awards-section">
        <div className="container">
          <div className="text-center">
            <span className="hon-badge hon-badge--center">Academy Highlights</span>
            <h2 className="section-title">
              Derived <span className="hon-text-grad">Awards</span>
            </h2>
            <p className="hon-section-desc">
              Ranking-led highlights generated from the current athlete records.
            </p>
          </div>

          <div className="hon-awards-grid">
            {derivedAwards.map((award) => (
              <Link key={award.title} href={award.href} className="hon-award-card">
                <p className="hon-award-card__title">{award.title}</p>
                <h3 className="hon-award-card__recipient">{award.recipient}</h3>
                <p className="hon-award-card__detail">{award.detail}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
