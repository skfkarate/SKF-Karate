import type { Athlete } from '@/data/types'
import { calculatePoints, calculateResultPoints, normaliseEventTier, normaliseResult } from "./points"
import { normaliseSkfId } from "./registration"
import { getBeltOrder } from "@/data/constants/belts"

type RankingOptions = {
  currentDate?: Date
  categoryKey?: string
}

function toDate(value: Date | string | null | undefined): Date | null {
  const date = value instanceof Date ? value : new Date(value ?? '')
  return Number.isNaN(date.getTime()) ? null : date
}

function getAgeOnDate(dateOfBirth: string, onDate: Date | string) {
  const dob = toDate(dateOfBirth)
  const date = toDate(onDate)
  if (!dob || !date) return null

  let age = date.getFullYear() - dob.getFullYear()
  const monthDiff = date.getMonth() - dob.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && date.getDate() < dob.getDate())) {
    age -= 1
  }

  return age
}

export function getAgeCategory(dateOfBirth: string, onDate: Date = new Date()) {
  const age = getAgeOnDate(dateOfBirth, onDate)

  if (age === null) return "senior"
  if (age < 14) return "cadet"
  if (age < 18) return "junior"
  return "senior"
}

export function normaliseAgeGroup(ageGroup: string | null | undefined, dateOfBirth: string, onDate: Date = new Date()) {
  if (ageGroup) {
    const normalized = String(ageGroup).trim().toLowerCase()
    if (["cadet", "sub-junior", "u14"].includes(normalized)) return "cadet"
    if (["junior", "u18"].includes(normalized)) return "junior"
    if (["senior", "open", "adult"].includes(normalized)) return "senior"
  }

  return getAgeCategory(dateOfBirth, onDate)
}

export function normaliseDiscipline(category: string | null | undefined) {
  if (!category) return "kata"
  const normalized = String(category).toLowerCase()
  return normalized.includes("kumite") ? "kumite" : "kata"
}

export function buildCompetitionResultsFromAthletes(athletes: Athlete[] = []) {
  return athletes.flatMap((athlete) => {
    const achievements = athlete.achievements || []

    return achievements
      .filter((achievement) => achievement.type?.startsWith("tournament"))
      .map((achievement) => {
        const result = normaliseResult(
          achievement.competitionResult ||
            achievement.result ||
            (achievement.type === "tournament-gold"
              ? "gold"
              : achievement.type === "tournament-silver"
                ? "silver"
                : achievement.type === "tournament-bronze"
                  ? "bronze"
                  : "participation")
        )

        return {
          id: achievement.id,
          athleteId: athlete.id,
          skfId: normaliseSkfId(athlete.skfId || ""),
          athleteName: `${athlete.firstName} ${athlete.lastName}`,
          date: achievement.date,
          tier: normaliseEventTier(achievement.tournamentLevel),
          result,
          category: achievement.eventCategory || "kata-individual",
          discipline: normaliseDiscipline(achievement.eventCategory),
          ageGroup: normaliseAgeGroup(
            achievement.ageGroup,
            athlete.dateOfBirth,
            new Date(achievement.date ?? '')
          ),
          gender: athlete.gender || "male",
          weightCategory: achievement.weightCategory || null,
          difficultyLevel: achievement.difficultyLevel ?? null,
          wins: achievement.wins ?? 0,
          tournamentName: achievement.tournamentName || achievement.title || "Tournament",
          eventSlug: achievement.sourceEventSlug || null,
          sourceType: "achievement",
        }
      })
  })
}

export function getAthleteCompetitionResults(athlete: Athlete, allResults: Array<{ athleteId?: string; date?: string; ageGroup?: string; level?: string; tier?: string; result?: string; difficultyLevel?: number | null; wins?: number | null; eventType?: string; gender?: string; discipline?: string; weightCategory?: string | null }> = [], currentDate: Date = new Date()) {
  const results = allResults.filter((result) => result.athleteId === athlete.id)

  const currentAgeCategory = getAgeCategory(athlete.dateOfBirth, currentDate)

  return results
    .filter((result) => {
      if (result.ageGroup !== "cadet") return true
      return currentAgeCategory === "cadet"
    })
    .map((result) => ({
      ...result,
      points: calculateResultPoints(result, currentDate),
    }))
}

/**
 * Check if an athlete is white-belt-only (enrollment-only, no grading or tournament achievements).
 * These athletes are excluded from rankings.
 */
export function isWhiteBeltOnly(athlete: { currentBelt?: string; achievements?: Array<{ type?: string }> }) {
  const belt = String(athlete.currentBelt || 'white').toLowerCase()
  if (belt !== 'white') return false

  const achievements = athlete.achievements || []
  // Only has enrollment-type achievements (no belt-grading, no tournament results)
  return achievements.every((a) => {
    const type = String(a.type || '')
    return type === 'enrollment' || type === ''
  })
}

export function getAthleteRankingCategory(athlete: Athlete, allResults: Array<{ athleteId?: string; date?: string; ageGroup?: string; discipline?: string; gender?: string; weightCategory?: string | null; level?: string; tier?: string; result?: string; difficultyLevel?: number | null; wins?: number | null; eventType?: string }> = [], currentDate: Date = new Date()) {
  const athleteResults = getAthleteCompetitionResults(athlete, allResults, currentDate)
  const latestResult = [...athleteResults].sort(
    (a, b) => new Date(b.date ?? '').getTime() - new Date(a.date ?? '').getTime()
  )[0]

  // If the athlete has no tournament results, use a simple belt-progression category
  if (!latestResult) {
    return {
      ageGroup: getAgeCategory(athlete.dateOfBirth, currentDate),
      gender: athlete.gender || "male",
      discipline: "technical-ranking",
      weightCategory: null,
      key: "technical-ranking",
    }
  }

  const ageGroup = latestResult?.ageGroup || getAgeCategory(athlete.dateOfBirth, currentDate)
  const gender = athlete.gender || latestResult?.gender || "male"
  const discipline = latestResult?.discipline || "kata"
  const weightCategory = latestResult?.weightCategory || null

  return {
    ageGroup,
    gender,
    discipline,
    weightCategory,
    key: [ageGroup, gender, discipline, weightCategory || "open"].join(":"),
  }
}

export function compareRankingEntries(a: { currentBelt?: string; beltOrder?: number; totalPoints?: number; goldCount?: number; silverCount?: number; bronzeCount?: number; fightWinCount?: number; tournamentCount?: number; mostRecentResultAt?: string; athleteName?: string }, b: { currentBelt?: string; beltOrder?: number; totalPoints?: number; goldCount?: number; silverCount?: number; bronzeCount?: number; fightWinCount?: number; tournamentCount?: number; mostRecentResultAt?: string; athleteName?: string }) {
  // Primary: belt level (higher belt = higher rank)
  const aBeltOrder = a.beltOrder ?? getBeltOrder(a.currentBelt ?? 'white')
  const bBeltOrder = b.beltOrder ?? getBeltOrder(b.currentBelt ?? 'white')
  if (bBeltOrder !== aBeltOrder) return bBeltOrder - aBeltOrder

  // Secondary: tournament points
  if ((b.totalPoints ?? 0) !== (a.totalPoints ?? 0)) return (b.totalPoints ?? 0) - (a.totalPoints ?? 0)
  if ((b.goldCount ?? 0) !== (a.goldCount ?? 0)) return (b.goldCount ?? 0) - (a.goldCount ?? 0)
  if ((b.silverCount ?? 0) !== (a.silverCount ?? 0)) return (b.silverCount ?? 0) - (a.silverCount ?? 0)
  if ((b.bronzeCount ?? 0) !== (a.bronzeCount ?? 0)) return (b.bronzeCount ?? 0) - (a.bronzeCount ?? 0)
  if ((b.fightWinCount ?? 0) !== (a.fightWinCount ?? 0)) return (b.fightWinCount ?? 0) - (a.fightWinCount ?? 0)
  if ((b.tournamentCount ?? 0) !== (a.tournamentCount ?? 0)) return (b.tournamentCount ?? 0) - (a.tournamentCount ?? 0)

  const aRecent = a.mostRecentResultAt ? new Date(a.mostRecentResultAt).getTime() : 0
  const bRecent = b.mostRecentResultAt ? new Date(b.mostRecentResultAt).getTime() : 0
  if (bRecent !== aRecent) return bRecent - aRecent

  return (a.athleteName ?? '').localeCompare(b.athleteName ?? '')
}

export function getRankedAthletes(
  athletes: Athlete[] = [],
  allResults: Array<{ athleteId?: string; date?: string; ageGroup?: string; discipline?: string; gender?: string; weightCategory?: string | null; level?: string; tier?: string; result?: string; difficultyLevel?: number | null; wins?: number | null; eventType?: string }> = [],
  options: RankingOptions = {}
) {
  const currentDate = options.currentDate || new Date()
  const activeAthletes = athletes.filter(
    (athlete) => athlete.status === "active" && !isWhiteBeltOnly(athlete)
  )

  const ranked = activeAthletes.map((athlete: Athlete) => {
    const results = getAthleteCompetitionResults(athlete, allResults, currentDate)
    const totalPoints = calculatePoints(athlete.id, results, currentDate)
    const rankingCategory = getAthleteRankingCategory(athlete, allResults, currentDate)
    const beltOrder = getBeltOrder(athlete.currentBelt || 'white')

    const goldCount = results.filter((result) => normaliseResult(result.result) === "gold").length
    const silverCount = results.filter((result) => normaliseResult(result.result) === "silver").length
    const bronzeCount = results.filter((result) => normaliseResult(result.result) === "bronze").length
    const fightWinCount = results.reduce((sum, result) => sum + Number(result.wins || 0), 0)

    return {
      athleteId: athlete.id,
      skfId: normaliseSkfId(athlete.skfId || ""),
      athleteName: `${athlete.firstName} ${athlete.lastName}`,
      branchName: athlete.branchName,
      currentBelt: athlete.currentBelt,
      joinDate: athlete.joinDate,
      beltOrder,
      totalPoints,
      goldCount,
      silverCount,
      bronzeCount,
      fightWinCount,
      totalMedals: goldCount + silverCount + bronzeCount,
      tournamentCount: results.length,
      mostRecentResultAt: results
        .map((result) => result.date)
        .sort((a, b) => new Date(b ?? '').getTime() - new Date(a ?? '').getTime())[0] || null,
      rankingCategory,
      pointsBreakdown: results.map((result) => ({
        ...result,
        ...calculateResultPoints(result, currentDate),
      })),
      updatedAt: new Date().toISOString(),
    }
  })

  const filtered = options.categoryKey
    ? ranked.filter((entry) => entry.rankingCategory.key === options.categoryKey)
    : ranked

  return filtered.sort(compareRankingEntries as (a: typeof filtered[0], b: typeof filtered[0]) => number).map((entry, index) => ({
    ...entry,
    overallRank: index + 1,
  }))
}

export function getBranchRankMap(entries: { branchName?: string; athleteId?: string; currentBelt?: string; beltOrder?: number; totalPoints?: number; goldCount?: number; silverCount?: number; bronzeCount?: number; fightWinCount?: number; tournamentCount?: number; mostRecentResultAt?: string; athleteName?: string }[] = []) {
  const branchBuckets = new Map<string, { branchName?: string; athleteId?: string; currentBelt?: string; beltOrder?: number; totalPoints?: number; goldCount?: number; silverCount?: number; bronzeCount?: number; fightWinCount?: number; tournamentCount?: number; mostRecentResultAt?: string; athleteName?: string }[]>()

  for (const entry of entries) {
    const branchName = entry.branchName ?? ''
    const bucket = branchBuckets.get(branchName) || []
    bucket.push(entry)
    branchBuckets.set(branchName, bucket)
  }

  const rankMap = new Map()

  for (const bucket of branchBuckets.values()) {
    bucket.sort(compareRankingEntries as (a: typeof bucket[0], b: typeof bucket[0]) => number).forEach((entry, index) => {
      rankMap.set(entry.athleteId, index + 1)
    })
  }

  return rankMap
}

export function calculateRankingSnapshots(athletes: Athlete[] = [], allResults: Array<{ athleteId?: string; date?: string; ageGroup?: string; discipline?: string; gender?: string; weightCategory?: string | null; level?: string; tier?: string; result?: string; difficultyLevel?: number | null; wins?: number | null; eventType?: string }> = [], currentDate: Date = new Date()) {
  const ranked = getRankedAthletes(athletes, allResults, { currentDate })
  const branchRankMap = getBranchRankMap(ranked as Parameters<typeof getBranchRankMap>[0])

  return ranked.map((entry) => ({
    ...entry,
    branchRank: branchRankMap.get(entry.athleteId) ?? 0,
    rankScore: entry.totalPoints,
  }))
}

export function getAthleteRankEntry(athleteId: string, athletes: Athlete[] = [], allResults: Array<{ athleteId?: string; date?: string; ageGroup?: string; discipline?: string; gender?: string; weightCategory?: string | null; level?: string; tier?: string; result?: string; difficultyLevel?: number | null; wins?: number | null; eventType?: string }> = [], currentDate: Date = new Date()) {
  return calculateRankingSnapshots(athletes, allResults, currentDate).find(
    (entry) => entry.athleteId === athleteId
  ) || null
}
