import { calculatePoints, calculateResultPoints, normaliseEventTier, normaliseResult } from "./points"

type RankingOptions = {
  currentDate?: Date
  categoryKey?: string
}

function toDate(value) {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function getAgeOnDate(dateOfBirth, onDate) {
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

export function getAgeCategory(dateOfBirth, onDate = new Date()) {
  const age = getAgeOnDate(dateOfBirth, onDate)

  if (age === null) return "senior"
  if (age < 14) return "cadet"
  if (age < 18) return "junior"
  return "senior"
}

export function normaliseAgeGroup(ageGroup, dateOfBirth, onDate = new Date()) {
  if (ageGroup) {
    const normalized = String(ageGroup).trim().toLowerCase()
    if (["cadet", "sub-junior", "u14"].includes(normalized)) return "cadet"
    if (["junior", "u18"].includes(normalized)) return "junior"
    if (["senior", "open", "adult"].includes(normalized)) return "senior"
  }

  return getAgeCategory(dateOfBirth, onDate)
}

export function normaliseDiscipline(category) {
  if (!category) return "kata"
  const normalized = String(category).toLowerCase()
  return normalized.includes("kumite") ? "kumite" : "kata"
}

export function buildCompetitionResultsFromAthletes(athletes = []) {
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
          registrationNumber: athlete.registrationNumber,
          athleteName: `${athlete.firstName} ${athlete.lastName}`,
          date: achievement.date,
          tier: normaliseEventTier(achievement.tournamentLevel),
          result,
          category: achievement.eventCategory || "kata-individual",
          discipline: normaliseDiscipline(achievement.eventCategory),
          ageGroup: normaliseAgeGroup(
            achievement.ageGroup,
            athlete.dateOfBirth,
            achievement.date
          ),
          gender: athlete.gender || "male",
          weightCategory: achievement.weightCategory || null,
          tournamentName: achievement.tournamentName || achievement.title || "Tournament",
          eventSlug: achievement.sourceEventSlug || null,
          sourceType: "achievement",
        }
      })
  })
}

export function getAthleteCompetitionResults(athlete, allResults = [], currentDate = new Date()) {
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

export function getAthleteRankingCategory(athlete, allResults = [], currentDate = new Date()) {
  const athleteResults = getAthleteCompetitionResults(athlete, allResults, currentDate)
  const latestResult = [...athleteResults].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )[0]

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

export function compareRankingEntries(a, b) {
  if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints
  if (b.goldCount !== a.goldCount) return b.goldCount - a.goldCount
  if (b.silverCount !== a.silverCount) return b.silverCount - a.silverCount
  if (b.bronzeCount !== a.bronzeCount) return b.bronzeCount - a.bronzeCount
  if (b.tournamentCount !== a.tournamentCount) return b.tournamentCount - a.tournamentCount

  const aRecent = a.mostRecentResultAt ? new Date(a.mostRecentResultAt).getTime() : 0
  const bRecent = b.mostRecentResultAt ? new Date(b.mostRecentResultAt).getTime() : 0
  if (bRecent !== aRecent) return bRecent - aRecent

  return a.athleteName.localeCompare(b.athleteName)
}

export function getRankedAthletes(
  athletes = [],
  allResults = [],
  options: RankingOptions = {}
) {
  const currentDate = options.currentDate || new Date()
  const activeAthletes = athletes.filter((athlete) => athlete.status === "active")

  const ranked = activeAthletes.map((athlete) => {
    const results = getAthleteCompetitionResults(athlete, allResults, currentDate)
    const totalPoints = calculatePoints(athlete.id, results, currentDate)
    const rankingCategory = getAthleteRankingCategory(athlete, allResults, currentDate)

    const goldCount = results.filter((result) => normaliseResult(result.result) === "gold").length
    const silverCount = results.filter((result) => normaliseResult(result.result) === "silver").length
    const bronzeCount = results.filter((result) => normaliseResult(result.result) === "bronze").length

    return {
      athleteId: athlete.id,
      registrationNumber: athlete.registrationNumber,
      athleteName: `${athlete.firstName} ${athlete.lastName}`,
      branchName: athlete.branchName,
      currentBelt: athlete.currentBelt,
      totalPoints,
      goldCount,
      silverCount,
      bronzeCount,
      totalMedals: goldCount + silverCount + bronzeCount,
      tournamentCount: results.length,
      mostRecentResultAt: results
        .map((result) => result.date)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || null,
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

  return filtered.sort(compareRankingEntries).map((entry, index) => ({
    ...entry,
    overallRank: index + 1,
  }))
}

export function getBranchRankMap(entries = []) {
  const branchBuckets = new Map()

  for (const entry of entries) {
    const bucket = branchBuckets.get(entry.branchName) || []
    bucket.push(entry)
    branchBuckets.set(entry.branchName, bucket)
  }

  const rankMap = new Map()

  for (const bucket of branchBuckets.values()) {
    bucket.sort(compareRankingEntries).forEach((entry, index) => {
      rankMap.set(entry.athleteId, index + 1)
    })
  }

  return rankMap
}

export function calculateRankingSnapshots(athletes = [], allResults = [], currentDate = new Date()) {
  const ranked = getRankedAthletes(athletes, allResults, { currentDate })
  const branchRankMap = getBranchRankMap(ranked)

  return ranked.map((entry) => ({
    ...entry,
    branchRank: branchRankMap.get(entry.athleteId) ?? 0,
    rankScore: entry.totalPoints,
  }))
}

export function getAthleteRankEntry(athleteId, athletes = [], allResults = [], currentDate = new Date()) {
  return calculateRankingSnapshots(athletes, allResults, currentDate).find(
    (entry) => entry.athleteId === athleteId
  ) || null
}
