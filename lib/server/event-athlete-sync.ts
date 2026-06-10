import { randomUUID } from 'node:crypto'

import { getBelt, getBeltOrder } from '@/data/constants/belts'
import { EVENT_TYPE_LABELS, isBeltExamType } from '@/lib/types/event'
import {
  AGE_GROUP_LABELS,
  EVENT_CATEGORY_LABELS,
  TOURNAMENT_LEVEL_LABELS,
} from '@/lib/types/tournament'
import { normaliseSkfId } from '@/lib/utils/registration'
import {
  calculateEventAchievementPoints,
  normaliseResult,
} from '@/lib/utils/points'

import {
  getAllAthletesLive,
  updateAthleteLive,
} from '@/lib/server/repositories/athletes-live'
import { captureRankingSnapshotLive } from '@/lib/server/repositories/ranking-snapshots'
import { revalidateAthleteSitePaths } from '@/lib/server/revalidation'

type EventResultRecord = {
  id?: string
  athleteId?: string
  skfId?: string
  medal?: string
  result?: string
  completed?: boolean
  attended?: boolean
  beltAwarded?: string
  promotion?: string
  promotionType?: string
  doublePromotion?: boolean
  notes?: string
  examiner?: string
  grade?: string
  score?: number | string
  daysAttended?: number
  specialAward?: string
  award?: string
  category?: string
  ageGroup?: string
  weightCategory?: string
  wins?: number | string | null
  difficultyLevel?: number | string | null
  position?: number | string
  participantId?: string
}

type AthleteAchievement = {
  id: string
  type: string
  date: string
  title: string
  description: string
  pointsAwarded: number
  sourceEventId?: string
  sourceEventSlug?: string
  sourceParticipantId?: string
  sourceEventType?: string
  sourceEventLevel?: string
  location?: string
  beltEarned?: string
  grade?: string
  examiner?: string
  result?: string
  tournamentName?: string
  tournamentLevel?: string
  eventCategory?: string
  ageGroup?: string
  weightCategory?: string
  competitionResult?: string
  position?: number | string
  difficultyLevel?: number | null
  wins?: number
  awardReason?: string
  awardedBy?: string
}

type AthleteRecord = {
  id?: string
  skfId?: string
  currentBelt?: string
  achievements?: AthleteAchievement[]
}

type EventRecord = {
  id?: string
  slug?: string
  name?: string
  type?: string
  level?: string
  venue?: string
  city?: string
  date?: string
  hostingBranch?: string
  results?: EventResultRecord[]
  winners?: EventResultRecord[]
}

function formatTitleCase(value: string) {
  return String(value || '')
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')
}

function formatEventTypeLabel(type: string) {
  return EVENT_TYPE_LABELS[type as keyof typeof EVENT_TYPE_LABELS] || formatTitleCase(type)
}

function formatTournamentLevel(level: string) {
  return TOURNAMENT_LEVEL_LABELS[level as keyof typeof TOURNAMENT_LEVEL_LABELS] || formatTitleCase(level)
}

function formatEventCategory(category: string) {
  return EVENT_CATEGORY_LABELS[category as keyof typeof EVENT_CATEGORY_LABELS] || formatTitleCase(category)
}

function formatAgeGroup(ageGroup: string) {
  return AGE_GROUP_LABELS[ageGroup as keyof typeof AGE_GROUP_LABELS] || formatTitleCase(ageGroup)
}

function formatBeltLabel(belt: string) {
  return getBelt(belt || 'white')?.label || formatTitleCase(belt)
}

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function toIsoDate(value: string) {
  if (!value) {
    return new Date().toISOString().split('T')[0]
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().split('T')[0]
  }

  return date.toISOString().split('T')[0]
}

function sortByDateDesc<T extends { date?: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const aTime = a.date ? new Date(a.date).getTime() : 0
    const bTime = b.date ? new Date(b.date).getTime() : 0
    return bTime - aTime
  })
}

function getLocationLabel(event: EventRecord) {
  return [event.venue, event.city].filter(Boolean).join(', ')
}

function getSourceMeta(event: EventRecord, participantId?: string) {
  return {
    sourceEventId: event.id,
    sourceEventSlug: event.slug || slugify(event.name || event.id || ''),
    sourceParticipantId: participantId || '',
    sourceEventType: event.type || '',
    sourceEventLevel: event.level || '',
    location: getLocationLabel(event),
  }
}

function getEventResultValue(event: EventRecord, result: EventResultRecord) {
  if (event.type === 'tournament') {
    return String(result.medal || result.result || 'participation').toLowerCase()
  }

  if (event.type === 'grading' || isBeltExamType(event.type)) {
    if (result.result) return String(result.result).toLowerCase()
    if (result.beltAwarded || result.promotion) return 'pass'
    return 'fail'
  }

  if (result.result) return String(result.result).toLowerCase()
  if (result.completed) return 'completed'
  if (result.attended) return 'attended'
  return 'absent'
}

function getPromotionType(result: EventResultRecord) {
  const value = String(result.promotionType || '').toLowerCase()
  if (value === 'triple') return 'triple'
  if (value === 'double' || result.doublePromotion) return 'double'
  return 'normal'
}

function getPromotionLabel(result: EventResultRecord) {
  const promotionType = getPromotionType(result)
  if (promotionType === 'triple') return 'Triple Promotion'
  if (promotionType === 'double') return 'Double Promotion'
  return 'Promotion'
}

function getPromotionBonus(result: EventResultRecord) {
  const promotionType = getPromotionType(result)
  if (promotionType === 'triple') return 120
  if (promotionType === 'double') return 60
  return 0
}

function getPointsForEventOutcome(
  event: EventRecord,
  resultValue: string,
  options: {
    difficultyLevel?: number | null
    wins?: number | null
  } = {}
) {
  return Number(
    calculateEventAchievementPoints({
      eventType: event.type,
      level: event.level,
      tier: event.level,
      result: resultValue,
      difficultyLevel: options.difficultyLevel,
      wins: options.wins,
    }).toFixed(2)
  )
}

function getTournamentOutcomeLabel(resultValue: string) {
  if (resultValue === 'gold') return 'Gold Medal'
  if (resultValue === 'silver') return 'Silver Medal'
  if (resultValue === 'bronze') return 'Bronze Medal'
  if (resultValue === '5th-place') return '5th Place'
  if (resultValue === 'semifinalist') return 'Semifinalist'
  if (resultValue === 'quarterfinalist') return 'Quarterfinalist'
  if (resultValue === 'round-of-16') return 'Round of 16'
  if (resultValue === 'first-round') return 'First Round'
  return 'Participation'
}

function buildTournamentAchievement(event: EventRecord, tournamentResult: EventResultRecord): AthleteAchievement {
  const resultValue = normaliseResult(
    tournamentResult.medal || tournamentResult.result || 'participation'
  )
  const categoryLabel = formatEventCategory(tournamentResult.category)
  const ageGroupLabel = formatAgeGroup(tournamentResult.ageGroup)
  const weightLabel = tournamentResult.weightCategory ? ` ${tournamentResult.weightCategory}` : ''
  const normalizedWins =
    tournamentResult.wins === undefined || tournamentResult.wins === null || tournamentResult.wins === ''
      ? null
      : Number(tournamentResult.wins)
  const normalizedDifficulty =
    tournamentResult.difficultyLevel === undefined ||
    tournamentResult.difficultyLevel === null ||
    tournamentResult.difficultyLevel === ''
      ? null
      : Number(tournamentResult.difficultyLevel)

  const resultSummary = [
    categoryLabel,
    `${ageGroupLabel}${weightLabel}`,
    Number.isFinite(normalizedWins) && normalizedWins > 0
      ? `${normalizedWins} fight${normalizedWins === 1 ? '' : 's'} won`
      : '',
    Number.isFinite(normalizedDifficulty) && normalizedDifficulty > 0
      ? `Difficulty ${normalizedDifficulty}/5`
      : '',
  ]
    .filter(Boolean)
    .join(' • ')

  return {
    id: `ach_${randomUUID()}`,
    type: `tournament-${resultValue}`,
    date: toIsoDate(event.date),
    title: `${getTournamentOutcomeLabel(resultValue)} — ${event.name}`,
    description: resultSummary || `${formatTournamentLevel(event.level)} tournament result`,
    pointsAwarded: getPointsForEventOutcome(
      { ...event, type: 'tournament' },
      resultValue,
      {
        difficultyLevel: Number.isFinite(normalizedDifficulty) ? normalizedDifficulty : null,
        wins: Number.isFinite(normalizedWins) ? normalizedWins : null,
      }
    ),
    tournamentName: event.name,
    tournamentLevel: event.level || '',
    eventCategory: tournamentResult.category || '',
    ageGroup: tournamentResult.ageGroup || '',
    weightCategory: tournamentResult.weightCategory || '',
    competitionResult: resultValue,
    result: resultValue,
    position: tournamentResult.position || '',
    difficultyLevel: Number.isFinite(normalizedDifficulty) ? normalizedDifficulty : null,
    wins: Number.isFinite(normalizedWins) ? normalizedWins : 0,
    ...getSourceMeta(
      { ...event, type: 'tournament' },
      tournamentResult.participantId || tournamentResult.id
    ),
  }
}

function buildStandaloneEventAchievements(event: EventRecord, result: EventResultRecord): AthleteAchievement[] {
  const resultValue = getEventResultValue(event, result)
  const sourceMeta = getSourceMeta(event, result.id)
  const pointsAwarded = getPointsForEventOutcome(event, resultValue)
  const achievements: AthleteAchievement[] = []

  if (event.type === 'grading') {
    const beltAwarded = String(result.beltAwarded || result.promotion || '').toLowerCase()
    const isPass = resultValue === 'pass' && beltAwarded
    const promotionLabel = getPromotionLabel(result)
    const promotionBonus = getPromotionBonus(result)

    achievements.push(
      isPass
        ? {
            id: `ach_${randomUUID()}`,
            type: 'belt-grading',
            date: toIsoDate(event.date),
            title: promotionLabel !== 'Promotion'
              ? `${promotionLabel} — ${event.name}`
              : `Passed ${event.name}`,
            description: promotionLabel !== 'Promotion'
              ? `Promoted to ${formatBeltLabel(beltAwarded)} with ${promotionLabel.toLowerCase()}${result.notes ? ` • ${result.notes}` : ''}`
              : result.notes || `Promoted to ${formatBeltLabel(beltAwarded)}`,
            pointsAwarded: Number((pointsAwarded + promotionBonus).toFixed(2)),
            beltEarned: beltAwarded,
            grade: promotionLabel,
            examiner: result.examiner || '',
            result: 'pass',
            ...sourceMeta,
          }
        : {
            id: `ach_${randomUUID()}`,
            type: 'grading-fail',
            date: toIsoDate(event.date),
            title: `Did Not Pass ${event.name}`,
            description: result.notes || 'Grading attempt recorded.',
            pointsAwarded: 0,
            grade: 'Grading Attempt',
            examiner: result.examiner || '',
            result: 'fail',
            ...sourceMeta,
          }
    )
  } else if (isBeltExamType(event.type)) {
    const beltAwarded = String(result.beltAwarded || result.promotion || '').toLowerCase()
    const isPass = resultValue === 'pass'
    const promotionLabel = getPromotionLabel(result)
    const promotionBonus = getPromotionBonus(result)
    achievements.push({
      id: `ach_${randomUUID()}`,
      type: resultValue === 'pass' ? 'belt-pass' : 'belt-fail',
      date: toIsoDate(event.date),
      title:
        isPass && promotionLabel !== 'Promotion'
          ? `${promotionLabel} — ${event.name}`
          : `${isPass ? 'Passed' : 'Attempted'} ${event.name}`,
      description: [
        isPass && beltAwarded ? `Promoted to ${formatBeltLabel(beltAwarded)}` : '',
        result.grade ? `Grade ${result.grade}` : '',
        result.score === 0 || result.score ? `Score ${result.score}` : '',
        result.notes || '',
      ]
        .filter(Boolean)
        .join(' • '),
      pointsAwarded: Number((pointsAwarded + (isPass ? promotionBonus : 0)).toFixed(2)),
      beltEarned: isPass ? beltAwarded : '',
      examiner: result.examiner || '',
      grade: result.grade || '',
      result: resultValue,
      ...sourceMeta,
    })
  } else {
    const typePrefix = event.type || 'event'
    const outcomeTitle =
      resultValue === 'completed'
        ? `Completed ${event.name}`
        : resultValue === 'attended'
          ? `Attended ${event.name}`
          : resultValue === 'absent'
            ? `Absent from ${event.name}`
            : `${formatEventTypeLabel(typePrefix)} Update — ${event.name}`

    achievements.push({
      id: `ach_${randomUUID()}`,
      type: `${typePrefix}-${resultValue}`,
      date: toIsoDate(event.date),
      title: outcomeTitle,
      description: [
        result.daysAttended ? `${result.daysAttended} day${result.daysAttended === 1 ? '' : 's'} attended` : '',
        result.notes || '',
      ]
        .filter(Boolean)
        .join(' • '),
      pointsAwarded,
      result: resultValue,
      ...sourceMeta,
    })
  }

  const specialAward = result.specialAward || result.award

  if (specialAward) {
    achievements.push({
      id: `ach_${randomUUID()}`,
      type: 'special-award',
      date: toIsoDate(event.date),
      title: `${specialAward} — ${event.name}`,
      description: result.notes || `${formatEventTypeLabel(event.type)} recognition`,
      pointsAwarded: 150,
      awardReason: specialAward,
      awardedBy: result.examiner || event.hostingBranch || 'SKF Karate',
      result: resultValue,
      ...sourceMeta,
    })
  }

  return achievements
}

function deriveCurrentBelt(athlete: AthleteRecord, achievements: AthleteAchievement[]) {
  const latestBeltAchievement = sortByDateDesc(
    achievements.filter((achievement) =>
      (achievement.type === 'belt-grading' || achievement.type === 'belt-pass') && achievement.beltEarned
    )
  ).sort((a, b) => {
    const beltDiff = getBeltOrder(b.beltEarned || '') - getBeltOrder(a.beltEarned || '')
    if (beltDiff !== 0) return beltDiff
    return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
  })[0]

  return latestBeltAchievement?.beltEarned || athlete.currentBelt || 'white'
}

async function syncAchievementsForSource(
  sourceEventId: string,
  buildArtifacts: (
    athletesById: Map<string, AthleteRecord>,
    athletesBySkfId: Map<string, AthleteRecord>
  ) => Map<string, AthleteAchievement[]>
) {
  const athletes = (await getAllAthletesLive()) as unknown as AthleteRecord[]
  const athletesById = new Map<string, AthleteRecord>()
  const athletesBySkfId = new Map<string, AthleteRecord>()

  for (const athlete of athletes) {
    athletesById.set(String(athlete.id), athlete)
    athletesBySkfId.set(
      normaliseSkfId(String(athlete.skfId || '')).toUpperCase(),
      athlete
    )
  }

  const nextAchievementsByAthlete = buildArtifacts(athletesById, athletesBySkfId)
  const athleteIdsWithExistingSourceData = athletes
    .filter((athlete) =>
      Array.isArray(athlete.achievements) &&
      athlete.achievements.some((achievement) => achievement.sourceEventId === sourceEventId)
    )
    .map((athlete) => String(athlete.id))

  const affectedAthleteIds = new Set<string>([
    ...athleteIdsWithExistingSourceData,
    ...nextAchievementsByAthlete.keys(),
  ])

  const updatedSkfIds: string[] = []

  for (const athleteId of affectedAthleteIds) {
    const athlete = athletesById.get(athleteId)
    if (!athlete) continue

    const preservedAchievements = Array.isArray(athlete.achievements)
      ? athlete.achievements.filter((achievement) => achievement.sourceEventId !== sourceEventId)
      : []
    const nextAchievements = nextAchievementsByAthlete.get(athleteId) || []
    const mergedAchievements = sortByDateDesc([...nextAchievements, ...preservedAchievements])
    const currentBelt = deriveCurrentBelt(athlete, mergedAchievements)

    const existingSerialized = JSON.stringify(sortByDateDesc(Array.isArray(athlete.achievements) ? athlete.achievements : []))
    const mergedSerialized = JSON.stringify(mergedAchievements)

    if (existingSerialized === mergedSerialized && currentBelt === athlete.currentBelt) {
      continue
    }

    await updateAthleteLive(athlete.id, {
      achievements: mergedAchievements,
      currentBelt,
    })

    if (athlete.skfId) {
      updatedSkfIds.push(athlete.skfId)
    }
  }

  for (const skfId of updatedSkfIds) {
    revalidateAthleteSitePaths(skfId)
  }

  return {
    updatedAthletes: updatedSkfIds.length,
  }
}

function resolveAthlete(
  entry: EventResultRecord,
  athletesById: Map<string, AthleteRecord>,
  athletesBySkfId: Map<string, AthleteRecord>
) {
  if (entry.athleteId && athletesById.has(String(entry.athleteId))) {
    return athletesById.get(String(entry.athleteId)) || null
  }

  const skfId = normaliseSkfId(String(entry.skfId || '')).toUpperCase()
  if (skfId && athletesBySkfId.has(skfId)) {
    return athletesBySkfId.get(skfId) || null
  }

  return null
}

export async function clearSyncedEventArtifactsFromAthletes(sourceEventId: string) {
  await captureRankingSnapshotLive({
    reason: 'before_event_results_cleared',
    sourceType: 'event',
    sourceId: sourceEventId,
  })
  const summary = await syncAchievementsForSource(sourceEventId, () => new Map())
  await captureRankingSnapshotLive({
    reason: 'event_results_cleared',
    sourceType: 'event',
    sourceId: sourceEventId,
  })
  return summary
}

export async function syncStandaloneEventResultsToAthletes(event: EventRecord) {
  await captureRankingSnapshotLive({
    reason: 'before_event_results_published',
    sourceType: String(event.type || 'event'),
    sourceId: String(event.id || ''),
  })
  const summary = await syncAchievementsForSource(String(event.id), (athletesById, athletesBySkfId) => {
    const achievementsByAthlete = new Map<string, AthleteAchievement[]>()

    for (const result of Array.isArray(event.results) ? event.results : []) {
      const athlete = resolveAthlete(result, athletesById, athletesBySkfId)
      if (!athlete) continue

      const nextAchievements = buildStandaloneEventAchievements(event, result)
      const bucket = achievementsByAthlete.get(String(athlete.id)) || []
      bucket.push(...nextAchievements)
      achievementsByAthlete.set(String(athlete.id), bucket)
    }

    return achievementsByAthlete
  })

  await captureRankingSnapshotLive({
    reason: 'event_results_published',
    sourceType: String(event.type || 'event'),
    sourceId: String(event.id || ''),
  })

  return summary
}

export async function syncTournamentResultsToAthletes(tournament: EventRecord) {
  await captureRankingSnapshotLive({
    reason: 'before_tournament_results_published',
    sourceType: 'tournament',
    sourceId: String(tournament.id || ''),
  })
  const summary = await syncAchievementsForSource(String(tournament.id), (athletesById, athletesBySkfId) => {
    const achievementsByAthlete = new Map<string, AthleteAchievement[]>()
    const sourceEntries =
      Array.isArray(tournament.results) && tournament.results.length > 0
        ? tournament.results
        : Array.isArray(tournament.winners)
          ? tournament.winners
          : []

    for (const entry of sourceEntries) {
      const athlete = resolveAthlete(entry, athletesById, athletesBySkfId)
      if (!athlete) continue

      const nextAchievement = buildTournamentAchievement(tournament, entry)
      const bucket = achievementsByAthlete.get(String(athlete.id)) || []
      bucket.push(nextAchievement)
      const specialAward = entry.specialAward || entry.award
      if (specialAward) {
        bucket.push({
          id: `ach_${randomUUID()}`,
          type: 'special-award',
          date: toIsoDate(tournament.date),
          title: `${specialAward} — ${tournament.name}`,
          description: entry.notes || `${formatTournamentLevel(tournament.level || '')} tournament recognition`,
          pointsAwarded: 150,
          awardReason: specialAward,
          awardedBy: tournament.hostingBranch || 'SKF Karate',
          result: normaliseResult(entry.medal || entry.result || 'participation'),
          ...getSourceMeta(
            { ...tournament, type: 'tournament' },
            entry.participantId || entry.id
          ),
        })
      }
      achievementsByAthlete.set(String(athlete.id), bucket)
    }

    return achievementsByAthlete
  })

  await captureRankingSnapshotLive({
    reason: 'tournament_results_published',
    sourceType: 'tournament',
    sourceId: String(tournament.id || ''),
  })

  return summary
}
