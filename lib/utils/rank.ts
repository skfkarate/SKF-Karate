import {
  buildCompetitionResultsFromAthletes,
  calculateRankingSnapshots,
} from "./rankings"

type RankAthlete = {
  id: string
}

type CompetitionResult = Record<string, unknown>

export function calculateRankScore(
  athlete: RankAthlete,
  athletes: RankAthlete[] = [],
  currentDate: Date = new Date()
): number {
  const snapshots = calculateAllRanks(athletes.length ? athletes : [athlete], currentDate)
  const entry = snapshots.find((item) => item.athleteId === athlete.id)
  return entry?.totalPoints ?? 0
}

export function calculateAllRanks(
  athletes: RankAthlete[],
  allResultsOrCurrentDate: CompetitionResult[] | Date = new Date(),
  maybeCurrentDate?: Date
) {
  const currentDate: Date =
    Array.isArray(allResultsOrCurrentDate) || !allResultsOrCurrentDate
      ? maybeCurrentDate || new Date()
      : allResultsOrCurrentDate

  const results: CompetitionResult[] = Array.isArray(allResultsOrCurrentDate)
    ? allResultsOrCurrentDate
    : buildCompetitionResultsFromAthletes(athletes)

  return calculateRankingSnapshots(athletes, results, currentDate)
}
