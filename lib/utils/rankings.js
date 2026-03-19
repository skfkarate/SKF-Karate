import { calculatePoints, calculateResultPoints, normaliseEventTier, normaliseResult } from "./points"

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

export function buildCompetitionResultsFromStudents(students = []) {
  return students.flatMap((student) => {
    const achievements = student.achievements || []

    return achievements
      .filter((achievement) => achievement.type?.startsWith("tournament"))
      .map((achievement) => {
        const result =
          achievement.type === "tournament-gold"
            ? "gold"
            : achievement.type === "tournament-silver"
              ? "silver"
              : achievement.type === "tournament-bronze"
                ? "bronze"
                : "participation"

        return {
          id: achievement.id,
          studentId: student.id,
          registrationNumber: student.registrationNumber,
          studentName: `${student.firstName} ${student.lastName}`,
          date: achievement.date,
          tier: normaliseEventTier(achievement.tournamentLevel),
          result,
          category: achievement.eventCategory || "kata-individual",
          discipline: normaliseDiscipline(achievement.eventCategory),
          ageGroup: normaliseAgeGroup(
            achievement.ageGroup,
            student.dateOfBirth,
            achievement.date
          ),
          gender: student.gender || "male",
          weightCategory: achievement.weightCategory || null,
          tournamentName: achievement.tournamentName || achievement.title || "Tournament",
          sourceType: "achievement",
        }
      })
  })
}

export function getStudentCompetitionResults(student, allResults = [], currentDate = new Date()) {
  const results = allResults.filter((result) => result.studentId === student.id)

  const currentAgeCategory = getAgeCategory(student.dateOfBirth, currentDate)

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

export function getStudentRankingCategory(student, allResults = [], currentDate = new Date()) {
  const studentResults = getStudentCompetitionResults(student, allResults, currentDate)
  const latestResult = [...studentResults].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )[0]

  const ageGroup = latestResult?.ageGroup || getAgeCategory(student.dateOfBirth, currentDate)
  const gender = student.gender || latestResult?.gender || "male"
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

  return a.studentName.localeCompare(b.studentName)
}

export function getRankedStudents(students = [], allResults = [], options = {}) {
  const currentDate = options.currentDate || new Date()
  const activeStudents = students.filter((student) => student.status === "active")

  const ranked = activeStudents.map((student) => {
    const results = getStudentCompetitionResults(student, allResults, currentDate)
    const totalPoints = calculatePoints(student.id, results, currentDate)
    const rankingCategory = getStudentRankingCategory(student, allResults, currentDate)

    const goldCount = results.filter((result) => normaliseResult(result.result) === "gold").length
    const silverCount = results.filter((result) => normaliseResult(result.result) === "silver").length
    const bronzeCount = results.filter((result) => normaliseResult(result.result) === "bronze").length

    return {
      studentId: student.id,
      registrationNumber: student.registrationNumber,
      studentName: `${student.firstName} ${student.lastName}`,
      branchName: student.branchName,
      currentBelt: student.currentBelt,
      totalPoints,
      goldCount,
      silverCount,
      bronzeCount,
      totalMedals: goldCount + silverCount + bronzeCount,
      tournamentCount: results.length,
      mostRecentResultAt: results
        .map((result) => result.date)
        .sort((a, b) => new Date(b) - new Date(a))[0] || null,
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
      rankMap.set(entry.studentId, index + 1)
    })
  }

  return rankMap
}

export function calculateRankingSnapshots(students = [], allResults = [], currentDate = new Date()) {
  const ranked = getRankedStudents(students, allResults, { currentDate })
  const branchRankMap = getBranchRankMap(ranked)

  return ranked.map((entry) => ({
    ...entry,
    branchRank: branchRankMap.get(entry.studentId) ?? 0,
    rankScore: entry.totalPoints,
  }))
}

export function getStudentRankEntry(studentId, students = [], allResults = [], currentDate = new Date()) {
  return calculateRankingSnapshots(students, allResults, currentDate).find(
    (entry) => entry.studentId === studentId
  ) || null
}
