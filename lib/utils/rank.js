import {
  buildCompetitionResultsFromStudents,
  calculateRankingSnapshots,
} from "./rankings"

export function calculateRankScore(student, students = [], currentDate = new Date()) {
  const snapshots = calculateAllRanks(students.length ? students : [student], currentDate)
  const entry = snapshots.find((item) => item.studentId === student.id)
  return entry?.totalPoints ?? 0
}

export function calculateAllRanks(students, allResultsOrCurrentDate = new Date(), maybeCurrentDate) {
  const currentDate =
    Array.isArray(allResultsOrCurrentDate) || !allResultsOrCurrentDate
      ? maybeCurrentDate || new Date()
      : allResultsOrCurrentDate

  const results = Array.isArray(allResultsOrCurrentDate)
    ? allResultsOrCurrentDate
    : buildCompetitionResultsFromStudents(students)

  return calculateRankingSnapshots(students, results, currentDate)
}
