import { getAllAthletes, getRankSnapshots } from '@/lib/data/athletes'
import { getTournamentStats } from '@/lib/data/tournaments'
import { buildRankingBoards } from '@/app/_components/athlete/rankingBoardUtils'
import RankingsClient from './RankingsClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Global Rankings & Honours | SKF Karate',
  description: 'Official SKF Karate athlete rankings and honours board. View live standings, gold medalists, and search for athlete profiles.',
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
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

export default async function RankingsPage() {
  const athletes = getAllAthletes()
  const publicAthletes = athletes.filter((athlete) => athlete.isPublic)
  
  // Data for Rankings Tab
  const snapshots = getRankSnapshots().filter((entry) => entry.totalPoints > 0)
  const boards = buildRankingBoards(snapshots)
  const dojos = [...new Set(snapshots.map((s) => s.branchName).filter(Boolean))].sort()

  // Data for Honours Tab
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
    <RankingsClient
      rankingsData={{ boards, dojos, totalRanked: snapshots.length }}
      honoursData={{ sections: honoursSections, stats, derivedAwards }}
    />
  )
}
