import { BELT_HEX_COLORS, getBelt } from '@/data/constants/belts'
import { DEFAULT_COUNTRY_FLAG } from '@/data/seed/beltExaminations'
import { EVENT_TYPE_LABELS, canonicalizeEventType } from '@/lib/types/event'
import { findClassBranchByName } from '@/lib/classes/catalog'
import { getAllCities } from '@/lib/classesData'
import { resolveAthleteProfilePhoto } from '@/lib/profile-photos'
import {
  EVENT_CATEGORY_LABELS,
  TOURNAMENT_LEVEL_LABELS,
} from '@/lib/types/tournament'
import { calculateResultPoints } from '@/lib/utils/points'
import { normaliseSkfId } from '@/lib/utils/registration'
import {
  getAssignedPortalEvents,
  getPortalEventHref,
  isUpcomingPortalEvent,
} from '@/lib/utils/portal-events'

type AthleteAchievement = {
  id?: string
  type?: string
  competitionResult?: string
  result?: string
  wins?: number | string
  date?: string
  sourceEventLevel?: string
  tournamentLevel?: string
  difficultyLevel?: number | string | null
  tournamentName?: string
  title?: string
  eventCategory?: string
  ageGroup?: string
  weightCategory?: string
  beltEarned?: string
  grade?: string
  examiner?: string
  awardedBy?: string
  location?: string
  sourceEventType?: string
  description?: string
  awardReason?: string
  pointsAwarded?: number | string
}

type AthleteProfileSource = {
  skfId?: string
  achievements?: AthleteAchievement[]
  pointsBalance?: number | string
  firstName?: string
  lastName?: string
  photoUrl?: string
  gender?: string
  dateOfBirth?: string
  branchName?: string
  currentBelt?: string
  status?: string
  joinDate?: string
}

type EventParticipant = {
  skfId?: string
}

type AthleteEventSource = {
  id?: string
  slug?: string
  date?: string
  endDate?: string
  name?: string
  type?: string
  sourceKind?: string
  venue?: string
  city?: string
  isPublished?: boolean
  participants?: EventParticipant[]
}

type RankInfo = {
  overallRank?: number | null
  branchRank?: number | null
  totalPoints?: number | string
  rankingCategory?: {
    discipline?: string
    weightCategory?: string
  }
}

type CompetitionEntry = {
  id?: string
  date: string
  event: string
  type: string
  category: string
  categoryKey: string
  ageGroup: string
  weightCategory: string
  rank: number | '*'
  wins: number
  points: number
  actual: number
  medal: string
  level: string
  difficultyLevel: number | string | null
}

type CompetitionHonour = {
  gold: number
  silver: number
  bronze: number
  name: string
}

type CompetitionCategory = {
  name: string
  categoryKey: string
  isPrimary: boolean
  rank: number | null
  points: number
  honours: CompetitionHonour[]
  results: Array<{
    date: string
    event: string
    type: string
    category: string
    rank: number | '*'
    wins: number
    points: number
    actual: number
  }>
}

export const beltColors = {
  White: BELT_HEX_COLORS.White,
  'White Belt': BELT_HEX_COLORS.White,
  Yellow: BELT_HEX_COLORS.Yellow,
  'Yellow Belt': BELT_HEX_COLORS.Yellow,
  Orange: BELT_HEX_COLORS.Orange,
  'Orange Belt': BELT_HEX_COLORS.Orange,
  'Green II': BELT_HEX_COLORS['Green II'],
  'Green II Belt': BELT_HEX_COLORS['Green II'],
  'Green I': BELT_HEX_COLORS['Green I'],
  'Green I Belt': BELT_HEX_COLORS['Green I'],
  Blue: BELT_HEX_COLORS.Blue,
  'Blue Belt': BELT_HEX_COLORS.Blue,
  Purple: BELT_HEX_COLORS.Purple,
  'Purple Belt': BELT_HEX_COLORS.Purple,
  'Brown III': BELT_HEX_COLORS['Brown III'],
  'Brown III Belt': BELT_HEX_COLORS['Brown III'],
  'Brown II': BELT_HEX_COLORS['Brown II'],
  'Brown II Belt': BELT_HEX_COLORS['Brown II'],
  'Brown I': BELT_HEX_COLORS['Brown I'],
  'Brown I Belt': BELT_HEX_COLORS['Brown I'],
  Black: BELT_HEX_COLORS.Black,
  'Black Belt': BELT_HEX_COLORS.Black,
  'Black Belt — Dan 1': BELT_HEX_COLORS.Black,
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

function getMedalRank(result: string): number | '*' {
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

function buildCompetitionEntries(athlete: AthleteProfileSource): CompetitionEntry[] {
  return (athlete.achievements || [])
    .filter((achievement) => achievement.type?.startsWith('tournament'))
    .map((achievement) => {
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
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function getPrimaryCategoryName(rankInfo: RankInfo | null | undefined, competitionEntries: CompetitionEntry[]) {
  if (competitionEntries.length > 0) {
    return competitionEntries[0].category
  }

  const rankingCategory = rankInfo?.rankingCategory
  if (!rankingCategory) {
    return 'Technical Ranking'
  }

  // If no tournaments, show "Technical Ranking" instead of Kata/Kumite
  if (rankingCategory.discipline === 'technical-ranking') {
    return 'Technical Ranking'
  }

  if (rankingCategory.discipline === 'kumite' && rankingCategory.weightCategory) {
    return `Kumite Individual ${rankingCategory.weightCategory}`
  }

  return rankingCategory.discipline === 'kumite' ? 'Kumite Individual' : 'Kata Individual'
}

function buildCompetitionCategories(
  athlete: AthleteProfileSource,
  rankInfo: RankInfo | null | undefined
): CompetitionCategory[] {
  const competitionEntries = buildCompetitionEntries(athlete)
  const grouped = new Map<string, CompetitionEntry[]>()

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

function buildUpcomingEvents(athlete: AthleteProfileSource, allEvents: AthleteEventSource[]) {
  const athleteSkfId = normaliseSkfId(String(athlete.skfId || '')).toUpperCase()
  return getAssignedPortalEvents(allEvents || [], athleteSkfId)
    .filter((event) => isUpcomingPortalEvent(event))
    .sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime())
    .slice(0, 4)
    .map((event) => ({
      id: event.id,
      dateRange: formatDateRange(event.date || '', event.endDate),
      name: event.name,
      href: getPortalEventHref(event),
      type: event.type,
      venue: event.venue,
      city: event.city,
    }))
}

function buildBeltExaminations(athlete: AthleteProfileSource) {
  const achievements = (athlete.achievements || []).filter((achievement) =>
    ['belt-grading', 'grading-fail', 'enrollment', 'belt-pass', 'belt-fail'].includes(achievement.type)
  )

  return achievements
    .map((achievement) => ({
      id: achievement.id,
      date: formatShortDate(achievement.date || ''),
      belt:
        achievement.type === 'belt-pass' || achievement.type === 'belt-fail'
          ? achievement.beltEarned
            ? formatBeltLabel(achievement.beltEarned)
            : 'Belt Exam'
          : achievement.type === 'enrollment'
            ? formatBeltLabel(achievement.beltEarned || 'white')
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
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function getSpecialEventType(achievement: AthleteAchievement) {
  const normalizedType = canonicalizeEventType(achievement.type || '')
  if (achievement.type === 'special-award') return 'Recognition'
  if (achievement.sourceEventType) return getEventTypeLabel(achievement.sourceEventType)
  if (achievement.type?.startsWith('camp')) return 'Training Camp'
  if (achievement.type?.startsWith('seminar')) return 'Seminar'
  if (achievement.type?.startsWith('fun')) return 'Fun Event'
  if (normalizedType.startsWith('belt')) return 'Belt Exam'
  return formatTitleCase(normalizedType || 'Event')
}

function buildSpecialEvents(athlete: AthleteProfileSource) {
  return (athlete.achievements || [])
    .filter((achievement) => {
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
    .map((achievement) => ({
      id: achievement.id,
      date: formatShortDate(achievement.date || ''),
      title: achievement.title,
      type: getSpecialEventType(achievement),
      location: achievement.location || athlete.branchName || 'SKF Karate',
      description: achievement.description || achievement.awardReason || '',
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function buildTotals(categories: CompetitionCategory[]) {
  const totalGolds = categories.reduce((sum, category) => (
    sum + category.honours.reduce((inner, honour) => inner + honour.gold, 0)
  ), 0)
  const totalSilvers = categories.reduce((sum, category) => (
    sum + category.honours.reduce((inner, honour) => inner + honour.silver, 0)
  ), 0)
  const totalBronzes = categories.reduce((sum, category) => (
    sum + category.honours.reduce((inner, honour) => inner + honour.bronze, 0)
  ), 0)

  return {
    totalGolds,
    totalSilvers,
    totalBronzes,
    totalMedals: totalGolds + totalSilvers + totalBronzes,
    totalEvents: categories.reduce((sum, category) => sum + category.results.length, 0),
  }
}

export function buildAthleteProfileData(
  athlete: AthleteProfileSource,
  rankInfo: RankInfo | null | undefined,
  allEvents: AthleteEventSource[] = [],
  branchCoachMap: Record<string, string> = {}
) {
  const categories = buildCompetitionCategories(athlete, rankInfo)
  const totals = buildTotals(categories)
  const primaryCategory = categories[0]
  const activePoints = Number(rankInfo?.totalPoints ?? primaryCategory?.points ?? athlete.pointsBalance ?? 0)
  const lifetimePoints = Number(
    (athlete.achievements || []).reduce((sum, achievement) => (
      sum + Number(achievement.pointsAwarded || 0)
    ), 0)
  )
  const competitionResults = categories.flatMap((category) => category.results || [])
  const totalWins = competitionResults.reduce(
    (sum, result) => sum + Number(result.wins || 0),
    0
  )
  const totalBouts = competitionResults.reduce((sum, result) => {
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
  const branchRecord = findClassBranchByName(getAllCities(), athlete.branchName)
  const fallbackPhoto = athlete.gender?.toLowerCase() === 'female'
    ? '/no-profile/no profile female.png'
    : '/no-profile/no profile male.png'
  const profilePhoto = resolveAthleteProfilePhoto({
    skfId: athlete.skfId,
    photoUrl: athlete.photoUrl,
    gender: athlete.gender,
  })

  return {
    athlete: {
      name: `${athlete.firstName} ${athlete.lastName}`.trim().toUpperCase(),
      shortName: `${athlete.firstName} ${athlete.lastName}`.trim(),
      fallbackPhoto,
      photo: profilePhoto || fallbackPhoto,
      country: 'INDIA',
      countryFlag: DEFAULT_COUNTRY_FLAG,
      id: athlete.skfId,
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
      branchHref: branchRecord ? `/classes/${branchRecord.citySlug}/${branchRecord.slug}` : '/classes',
      biography:
        totals.totalEvents > 0
          ? `${athlete.firstName} trains at SKF ${athlete.branchName} and has ${totals.totalMedals} podium finish${totals.totalMedals === 1 ? '' : 'es'} recorded across ${totals.totalEvents} competition result${totals.totalEvents === 1 ? '' : 's'}.`
          : `${athlete.firstName} trains at SKF ${athlete.branchName}. Belt progression, event participation, and training achievements will appear here as they are updated.`,
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
  athlete: AthleteProfileSource,
  rankInfo: RankInfo | null | undefined,
  allEvents: AthleteEventSource[] = [],
  branchCoachMap: Record<string, string> = {}
) {
  const profile = buildAthleteProfileData(athlete, rankInfo, allEvents, branchCoachMap)

  return {
    athleteInfo: {
      name: profile.athlete.name,
      photo: profile.athlete.photo,
      fallbackPhoto: profile.athlete.fallbackPhoto,
      country: profile.athlete.country,
      countryFlag: profile.athlete.countryFlag,
      id: profile.athlete.id,
      age: profile.athlete.age,
      totalBouts: profile.athlete.totalBouts,
      winRate: profile.athlete.winRate,
      branchName: profile.athlete.branchName,
      branchSlug: slugify(profile.athlete.branchName) || 'mp-sports-club',
      branchHref: profile.athlete.branchHref,
      publicProfileHref: athlete?.skfId ? `/athlete/${athlete.skfId}` : '',
      currentBelt: profile.athlete.currentBelt,
    },
    categories: profile.categories,
    nextEvents: profile.nextEvents,
    beltExaminations: profile.beltExaminations,
    specialEvents: profile.specialEvents,
    beltColors,
  }
}
