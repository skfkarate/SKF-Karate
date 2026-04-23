import { BELT_HEX_COLORS, getBelt } from '@/data/constants/belts'
import { DEFAULT_COUNTRY_FLAG, DEFAULT_PROFILE_PHOTO } from '@/data/seed/beltExaminations'
import { EVENT_TYPE_LABELS, canonicalizeEventType } from '@/lib/types/event'
import {
  AGE_GROUP_LABELS,
  EVENT_CATEGORY_LABELS,
  TOURNAMENT_LEVEL_LABELS,
} from '@/lib/types/tournament'
import { calculateResultPoints } from '@/lib/utils/points'

export const beltColors = {
  White: BELT_HEX_COLORS.White,
  'White Belt': BELT_HEX_COLORS.White,
  Yellow: BELT_HEX_COLORS.Yellow,
  'Yellow Belt': BELT_HEX_COLORS.Yellow,
  Orange: BELT_HEX_COLORS.Orange,
  'Orange Belt': BELT_HEX_COLORS.Orange,
  Green: BELT_HEX_COLORS.Green,
  'Green Belt': BELT_HEX_COLORS.Green,
  Blue: BELT_HEX_COLORS.Blue,
  'Blue Belt': BELT_HEX_COLORS.Blue,
  Brown: BELT_HEX_COLORS.Brown,
  'Brown Belt': BELT_HEX_COLORS.Brown,
  Black: BELT_HEX_COLORS.Black,
  'Black Belt': BELT_HEX_COLORS.Black,
  'Black Belt — 1st Dan': BELT_HEX_COLORS.Black,
  'Black Belt — 2nd Dan': BELT_HEX_COLORS.Black,
  'Black Belt — 3rd Dan': BELT_HEX_COLORS.Black,
  'Black Belt — 4th Dan': BELT_HEX_COLORS.Black,
  'Black Belt — 5th Dan': BELT_HEX_COLORS.Black,
} as Record<string, string>

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function formatTitleCase(value: string) {
  return String(value || '')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function formatLongDate(value: string) {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatShortDate(value: string) {
  if (!value) return ''
  return new Date(value).toISOString().split('T')[0]
}

function formatDateRange(startDate: string, endDate?: string) {
  if (!startDate) return ''

  const start = new Date(startDate)
  const end = endDate ? new Date(endDate) : null

  if (!end || Number.isNaN(end.getTime()) || startDate === endDate) {
    return start.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()} - ${end.getDate()} ${start.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`
  }

  return `${start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
}

function calculateAge(dateOfBirth: string) {
  if (!dateOfBirth) return 0
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1
  }

  return age
}

function formatBeltLabel(value: string) {
  return getBelt(value || 'white')?.label || formatTitleCase(value)
}

function getEventTypeLabel(type: string) {
  const canonicalType = canonicalizeEventType(type)
  return (
    EVENT_TYPE_LABELS[canonicalType as keyof typeof EVENT_TYPE_LABELS] ||
    formatTitleCase(canonicalType)
  )
}

function getCategoryLabel(category: string) {
  return EVENT_CATEGORY_LABELS[category as keyof typeof EVENT_CATEGORY_LABELS] || formatTitleCase(category || 'general')
}

function getTournamentLevelLabel(level: string) {
  return TOURNAMENT_LEVEL_LABELS[level as keyof typeof TOURNAMENT_LEVEL_LABELS] || formatTitleCase(level || 'local')
}

function getMedalRank(result: string) {
  if (result === 'gold') return 1
  if (result === 'silver') return 2
  if (result === 'bronze') return 3
  if (result === '5th-place') return 5
  return '*'
}

function getFallbackWinCount(result: string) {
  if (result === 'gold') return 3
  if (result === 'silver') return 2
  if (result === 'bronze') return 1
  return 0
}

function stripTournamentPrefix(title: string) {
  return String(title || '').replace(/^(Gold|Silver|Bronze) Medal\s+[—-]\s+/i, '')
}

function buildCompetitionEntries(athlete: any) {
  return (athlete.achievements || [])
    .filter((achievement: any) => achievement.type?.startsWith('tournament'))
    .map((achievement: any) => {
      const result = String(
        achievement.competitionResult ||
        achievement.result ||
        achievement.type.replace('tournament-', '')
      ).toLowerCase()
      const wins =
        achievement.wins === 0 || achievement.wins
          ? Number(achievement.wins)
          : getFallbackWinCount(result)
      const pointInfo = calculateResultPoints({
        date: achievement.date,
        level: achievement.sourceEventLevel || achievement.tournamentLevel,
        result,
        difficultyLevel: achievement.difficultyLevel,
        wins,
      })

      return {
        id: achievement.id,
        date: achievement.date,
        event: achievement.tournamentName || stripTournamentPrefix(achievement.title),
        type: getTournamentLevelLabel(achievement.sourceEventLevel || achievement.tournamentLevel),
        category: getCategoryLabel(achievement.eventCategory),
        categoryKey: achievement.eventCategory || 'general',
        ageGroup: achievement.ageGroup || '',
        weightCategory: achievement.weightCategory || '',
        rank: getMedalRank(result),
        wins,
        points: pointInfo.activePoints,
        actual: pointInfo.activePoints,
        medal: result,
        level: achievement.sourceEventLevel || achievement.tournamentLevel || '',
        difficultyLevel: achievement.difficultyLevel ?? null,
      }
    })
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function getPrimaryCategoryName(rankInfo: any, competitionEntries: any[]) {
  if (competitionEntries.length > 0) {
    return competitionEntries[0].category
  }

  const rankingCategory = rankInfo?.rankingCategory
  if (!rankingCategory) {
    return 'Competition'
  }

  if (rankingCategory.discipline === 'kumite' && rankingCategory.weightCategory) {
    return `Kumite Individual ${rankingCategory.weightCategory}`
  }

  return rankingCategory.discipline === 'kumite' ? 'Kumite Individual' : 'Kata Individual'
}

function buildCompetitionCategories(athlete: any, rankInfo: any) {
  const competitionEntries = buildCompetitionEntries(athlete)
  const grouped = new Map<string, any[]>()

  for (const entry of competitionEntries) {
    const bucket = grouped.get(entry.categoryKey) || []
    bucket.push(entry)
    grouped.set(entry.categoryKey, bucket)
  }

  const categories = [...grouped.entries()].map(([categoryKey, entries]) => {
    const honoursByLevel = new Map<string, { gold: number; silver: number; bronze: number; name: string }>()

    for (const entry of entries) {
      const honourKey = entry.level || 'local'
      const honour = honoursByLevel.get(honourKey) || {
        gold: 0,
        silver: 0,
        bronze: 0,
        name: getTournamentLevelLabel(entry.level),
      }

      if (entry.medal === 'gold') honour.gold += 1
      if (entry.medal === 'silver') honour.silver += 1
      if (entry.medal === 'bronze') honour.bronze += 1
      honoursByLevel.set(honourKey, honour)
    }

    return {
      name: entries[0]?.category || getCategoryLabel(categoryKey),
      categoryKey,
      isPrimary: false,
      rank: null,
      points: Number(entries.reduce((sum, entry) => sum + Number(entry.actual || 0), 0).toFixed(2)),
      honours: [...honoursByLevel.values()],
      results: entries.map((entry) => ({
        date: formatShortDate(entry.date),
        event: entry.event,
        type: entry.type,
        category: entry.category,
        rank: entry.rank,
        wins: entry.wins,
        points: Number(entry.points.toFixed(2)),
        actual: entry.actual,
      })),
    }
  })

  const primaryCategoryName = getPrimaryCategoryName(rankInfo, competitionEntries)
  const primaryCategory =
    categories.find((category) => category.name === primaryCategoryName) ||
    categories.sort((a, b) => Number(b.points || 0) - Number(a.points || 0))[0] ||
    {
      name: primaryCategoryName,
      categoryKey: 'general',
      isPrimary: true,
      rank: null,
      points: Number(rankInfo?.totalPoints ?? athlete.pointsBalance ?? 0),
      honours: [],
      results: [],
    }

  const normalizedPrimary = {
    ...primaryCategory,
    isPrimary: true,
    rank: rankInfo?.overallRank || primaryCategory.rank || null,
    points: Number(rankInfo?.totalPoints ?? primaryCategory.points ?? athlete.pointsBalance ?? 0),
  }

  const secondaryCategories = categories
    .filter((category) => category.categoryKey !== normalizedPrimary.categoryKey)
    .sort((a, b) => Number(b.points || 0) - Number(a.points || 0))

  return [normalizedPrimary, ...secondaryCategories]
}

function buildUpcomingEvents(athlete: any, allEvents: any[]) {
  const now = Date.now()
  return (allEvents || [])
    .filter((event: any) => new Date(event.date).getTime() >= now)
    .filter((event: any) =>
      Array.isArray(event.participants) &&
      event.participants.some((participant: any) => participant.registrationNumber === athlete.registrationNumber)
    )
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4)
    .map((event: any) => ({
      id: event.id,
      dateRange: formatDateRange(event.date, event.endDate),
      name: event.name,
    }))
}

function buildBeltExaminations(athlete: any) {
  const achievements = (athlete.achievements || []).filter((achievement: any) =>
    ['belt-grading', 'grading-fail', 'enrollment', 'belt-pass', 'belt-fail'].includes(achievement.type)
  )

  return achievements
    .map((achievement: any) => ({
      id: achievement.id,
      date: formatShortDate(achievement.date),
      belt:
        achievement.type === 'belt-pass' || achievement.type === 'belt-fail'
          ? achievement.beltEarned
            ? formatBeltLabel(achievement.beltEarned)
            : 'Belt Exam'
          : formatBeltLabel(achievement.beltEarned || athlete.currentBelt || 'white'),
      grade:
        achievement.grade ||
        (achievement.type === 'enrollment'
          ? 'Enrollment'
          : achievement.type === 'belt-pass'
            ? 'Belt Examination'
            : achievement.type === 'belt-fail'
              ? 'Belt Examination Attempt'
          : achievement.type === 'grading-fail'
            ? 'Grading Attempt'
            : 'Promotion'),
      examiner: achievement.examiner || achievement.awardedBy || 'SKF Examination Panel',
      result:
        achievement.type === 'grading-fail' || achievement.type === 'belt-fail'
          ? 'Fail'
          : 'Pass',
      dojo: achievement.location || athlete.branchName || 'SKF Karate',
    }))
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function getSpecialEventType(achievement: any) {
  const normalizedType = canonicalizeEventType(achievement.type || '')
  if (achievement.type === 'special-award') return 'Recognition'
  if (achievement.sourceEventType) return getEventTypeLabel(achievement.sourceEventType)
  if (achievement.type?.startsWith('camp')) return 'Training Camp'
  if (achievement.type?.startsWith('seminar')) return 'Seminar'
  if (achievement.type?.startsWith('fun')) return 'Fun Event'
  if (normalizedType.startsWith('belt')) return 'Belt Exam'
  return formatTitleCase(normalizedType || 'Event')
}

function buildSpecialEvents(athlete: any) {
  return (athlete.achievements || [])
    .filter((achievement: any) => {
      if (achievement.type?.startsWith('tournament')) return false
      if (
        achievement.type === 'belt-grading' ||
        achievement.type === 'enrollment' ||
        achievement.type === 'grading-fail' ||
        achievement.type === 'belt-pass' ||
        achievement.type === 'belt-fail'
      ) {
        return false
      }
      return true
    })
    .map((achievement: any) => ({
      id: achievement.id,
      date: formatShortDate(achievement.date),
      title: achievement.title,
      type: getSpecialEventType(achievement),
      location: achievement.location || athlete.branchName || 'SKF Karate',
      description: achievement.description || achievement.awardReason || '',
    }))
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function buildTotals(categories: any[]) {
  const totalGolds = categories.reduce((sum: number, category: any) => (
    sum + category.honours.reduce((inner: number, honour: any) => inner + honour.gold, 0)
  ), 0)
  const totalSilvers = categories.reduce((sum: number, category: any) => (
    sum + category.honours.reduce((inner: number, honour: any) => inner + honour.silver, 0)
  ), 0)
  const totalBronzes = categories.reduce((sum: number, category: any) => (
    sum + category.honours.reduce((inner: number, honour: any) => inner + honour.bronze, 0)
  ), 0)

  return {
    totalGolds,
    totalSilvers,
    totalBronzes,
    totalMedals: totalGolds + totalSilvers + totalBronzes,
    totalEvents: categories.reduce((sum: number, category: any) => sum + category.results.length, 0),
  }
}

export function buildAthleteProfileData(
  athlete: any,
  rankInfo: any,
  allEvents: any[] = [],
  branchCoachMap: Record<string, string> = {}
) {
  const categories = buildCompetitionCategories(athlete, rankInfo)
  const totals = buildTotals(categories)
  const primaryCategory = categories[0]
  const activePoints = Number(rankInfo?.totalPoints ?? primaryCategory?.points ?? athlete.pointsBalance ?? 0)
  const lifetimePoints = Number(
    (athlete.achievements || []).reduce((sum: number, achievement: any) => (
      sum + Number(achievement.pointsAwarded || 0)
    ), 0)
  )
  const competitionResults = categories.flatMap((category: any) => category.results || [])
  const totalWins = competitionResults.reduce(
    (sum: number, result: any) => sum + Number(result.wins || 0),
    0
  )
  const totalBouts = competitionResults.reduce((sum: number, result: any) => {
    const wins = Number(result.wins || 0)
    const rank = typeof result.rank === 'number' ? result.rank : 0

    if (rank === 1) return sum + Math.max(wins, 3)
    if (rank === 2) return sum + Math.max(wins, 2)
    if (rank === 3) return sum + Math.max(wins, 1)
    if (rank > 3) return sum + Math.max(wins, 1)

    return sum + Math.max(wins, 1)
  }, 0)
  const winRate = totalBouts > 0
    ? `${Math.round((totalWins / totalBouts) * 100)}%`
    : '0%'

  return {
    athlete: {
      name: `${athlete.firstName} ${athlete.lastName}`.trim().toUpperCase(),
      shortName: `${athlete.firstName} ${athlete.lastName}`.trim(),
      photo: athlete.photoUrl || DEFAULT_PROFILE_PHOTO || (athlete.gender?.toLowerCase() === 'female' ? '/no-profile/no profile female.png' : '/no-profile/no profile male.png'),
      country: 'INDIA',
      countryFlag: DEFAULT_COUNTRY_FLAG,
      id: athlete.registrationNumber,
      age: calculateAge(athlete.dateOfBirth),
      totalBouts,
      winRate,
      branchName: athlete.branchName,
      currentBelt: formatBeltLabel(athlete.currentBelt),
      status: formatTitleCase(athlete.status || 'active'),
      joinedOn: formatLongDate(athlete.joinDate),
      dateOfBirth: formatLongDate(athlete.dateOfBirth),
      overallRank: rankInfo?.overallRank || primaryCategory?.rank || null,
      branchRank: rankInfo?.branchRank || null,
      activePoints,
      lifetimePoints,
      totalMedals: totals.totalMedals,
      coachName: branchCoachMap[athlete.branchName] || 'Sensei SKF',
      biography:
        totals.totalEvents > 0
          ? `${athlete.firstName} trains at SKF ${athlete.branchName} and has ${totals.totalMedals} podium finish${totals.totalMedals === 1 ? '' : 'es'} recorded across ${totals.totalEvents} competition result${totals.totalEvents === 1 ? '' : 's'}.`
          : `${athlete.firstName} trains at SKF ${athlete.branchName}. Published event participation, gradings, and recognitions will appear here as they are updated by the admin team.`,
    },
    primaryCategory,
    categories,
    nextEvents: buildUpcomingEvents(athlete, allEvents),
    beltExaminations: buildBeltExaminations(athlete),
    specialEvents: buildSpecialEvents(athlete),
    totals,
  }
}

export function buildRestoredAthleteProfileData(
  athlete: any,
  rankInfo: any,
  allEvents: any[] = [],
  branchCoachMap: Record<string, string> = {}
) {
  const profile = buildAthleteProfileData(athlete, rankInfo, allEvents, branchCoachMap)

  return {
    athleteInfo: {
      name: profile.athlete.name,
      photo: profile.athlete.photo,
      country: profile.athlete.country,
      countryFlag: profile.athlete.countryFlag,
      id: profile.athlete.id,
      age: profile.athlete.age,
      totalBouts: profile.athlete.totalBouts,
      winRate: profile.athlete.winRate,
      branchName: profile.athlete.branchName,
      branchSlug: slugify(profile.athlete.branchName) || 'mp-sports-club',
      publicProfileHref: athlete?.registrationNumber ? `/athlete/${athlete.registrationNumber}` : '',
    },
    categories: profile.categories,
    nextEvents: profile.nextEvents,
    beltExaminations: profile.beltExaminations,
    specialEvents: profile.specialEvents,
    beltColors,
  }
}
