import {
  buildCompetitionResultsFromAthletes,
  calculateRankingSnapshots,
} from "./rankings"

export function calculateRankScore(athlete, athletes = [], currentDate = new Date()) {
  const snapshots = calculateAllRanks(athletes.length ? athletes : [athlete], currentDate)
  const entry = snapshots.find((item) => item.athleteId === athlete.id)
  return entry?.totalPoints ?? 0
}

export function calculateAllRanks(athletes, allResultsOrCurrentDate = new Date(), maybeCurrentDate) {
  const currentDate =
    Array.isArray(allResultsOrCurrentDate) || !allResultsOrCurrentDate
      ? maybeCurrentDate || new Date()
      : allResultsOrCurrentDate

  const results = Array.isArray(allResultsOrCurrentDate)
    ? allResultsOrCurrentDate
    : buildCompetitionResultsFromAthletes(athletes)

  return calculateRankingSnapshots(athletes, results, currentDate)
}
