// Legacy academy points remain for the existing admin/athlete form flows.
export const DEFAULT_POINTS: Record<string, number> = {
  enrollment: 50,
  "belt-grading": 200,
  "tournament-participation": 50,
  "tournament-bronze": 300,
  "tournament-silver": 400,
  "tournament-gold": 500,
  "seminar-attended": 10,
  "seminar-completion": 30,
  "camp-attended": 10,
  "camp-completion": 30,
  "belt-pass": 180,
  "belt-fail": 0,
  "grading-fail": 0,
  "attendance-milestone": 100,
  "special-award": 150,
  "birthday-bonus": 100,
  "referral-bonus": 150,
}

export const TOURNAMENT_LEVEL_MULTIPLIER: Record<string, number> = {
  "inter-dojo": 0.5,
  district: 1.0,
  state: 2.0,
  national: 4.0,
  international: 6.0,
}

export const POINTS_EXPIRY_MONTHS = 0

// Competition ranking points from the implementation plan.
export const EVENT_TIER_WEIGHTS: Record<string, number> = {
  international: 12,
  national: 8,
  state: 5,
  district: 3,
  invitational: 2,
  "inter-dojo": 2,
  open: 2,
}

export const EVENT_TYPE_FACTORS: Record<string, number> = {
  seminar: 1,
  camp: 1.5,
  grading: 4,
  fun: 1,
}

export const RESULT_BASE_POINTS: Record<string, number> = {
  gold: 100,
  silver: 70,
  bronze: 50,
  "5th-place": 30,
  semifinalist: 30,
  quarterfinalist: 20,
  "round-of-16": 12,
  "first-round": 5,
  participation: 10,
  pass: 60,
  fail: 0,
  completed: 30,
  attended: 10,
  absent: 0,
}

export const TOURNAMENT_DIFFICULTY_FACTORS: Record<number, number> = {
  1: 1,
  2: 1.15,
  3: 1.3,
  4: 1.45,
  5: 1.6,
}

export function normaliseEventTier(level: string | null | undefined) {
  if (!level) return "invitational"

  const normalized = String(level).trim().toLowerCase()

  if (normalized === "national championship") return "national"
  if (normalized === "state championship") return "state"
  if (normalized === "district championship") return "district"
  if (normalized === "wkf") return "international"
  if (normalized === "open") return "open"

  return EVENT_TIER_WEIGHTS[normalized] ? normalized : "invitational"
}

export function normaliseEventTypeFactor(eventType: string | null | undefined) {
  if (!eventType) return "seminar"
  const raw = String(eventType).trim().toLowerCase()
  const normalized = raw === "pelt-exam" || raw === "belt-exam" ? "grading" : raw
  return EVENT_TYPE_FACTORS[normalized] ? normalized : "seminar"
}

export function normaliseResult(result: string | null | undefined) {
  if (!result) return "participation"

  const normalized = String(result).trim().toLowerCase()

  if (["gold", "gold medal", "1", "1st", "first"].includes(normalized)) return "gold"
  if (["silver", "silver medal", "2", "2nd", "second"].includes(normalized)) return "silver"
  if (["bronze", "bronze medal", "3", "3rd", "third"].includes(normalized)) return "bronze"
  if (["5th", "5th place", "semi-finalist", "semifinalist"].includes(normalized)) return "5th-place"
  if (["quarter-final", "quarter-finalist", "quarterfinalist"].includes(normalized)) return "quarterfinalist"
  if (["round of 16", "round-of-16", "r16"].includes(normalized)) return "round-of-16"
  if (["first round", "first-round"].includes(normalized)) return "first-round"
  if (["pass", "passed", "qualified"].includes(normalized)) return "pass"
  if (["fail", "failed", "not-qualified"].includes(normalized)) return "fail"
  if (["completed", "complete"].includes(normalized)) return "completed"
  if (["attended", "attendance"].includes(normalized)) return "attended"
  if (["absent", "missed", "no-show"].includes(normalized)) return "absent"

  return "participation"
}

export function normaliseDifficultyLevel(value: string | number | null | undefined) {
  if (value === undefined || value === null || value === '') return null

  const numeric = Math.trunc(Number(value))
  if (!Number.isFinite(numeric)) return null

  if (numeric < 1) return 1
  if (numeric > 5) return 5
  return numeric
}

export function normaliseWinCount(value: string | number | null | undefined) {
  if (value === undefined || value === null || value === '') return 0

  const numeric = Math.trunc(Number(value))
  if (!Number.isFinite(numeric) || numeric < 0) return 0

  return numeric
}

export function calculateTournamentPoints(type: string, level: string) {
  const normalizedType =
    String(type).trim().toLowerCase() === "pelt-pass"
      ? "belt-pass"
      : String(type).trim().toLowerCase() === "pelt-fail"
        ? "belt-fail"
        : type
  const base = DEFAULT_POINTS[normalizedType] ?? 0
  const multiplier = TOURNAMENT_LEVEL_MULTIPLIER[level] ?? 1
  return Math.round(base * multiplier)
}

export function calculateTimeDecayFactor(_resultDate?: unknown, _currentDate: Date = new Date()) {
  void _currentDate
  return 1
}

export function calculateRawPoints({ level, tier, result, difficultyLevel, wins }: { level?: string; tier?: string; result?: string; difficultyLevel?: number | null; wins?: number | null }) {
  const normalizedTier = normaliseEventTier(level || tier)
  const normalizedResult = normaliseResult(result)
  const basePoints = RESULT_BASE_POINTS[normalizedResult] ?? 0
  const multiplier = EVENT_TIER_WEIGHTS[normalizedTier] ?? EVENT_TIER_WEIGHTS.invitational
  const normalizedDifficulty = normaliseDifficultyLevel(difficultyLevel)
  const normalizedWins = normaliseWinCount(wins)
  const difficultyFactor =
    normalizedDifficulty === null
      ? 1
      : TOURNAMENT_DIFFICULTY_FACTORS[normalizedDifficulty] ?? 1
  const winsBonus = normalizedWins * Math.max(4, Math.round(multiplier * 2))

  return Number(((basePoints * multiplier * difficultyFactor) + winsBonus).toFixed(2))
}

export function calculateEventAchievementPoints({
  eventType = "seminar",
  level,
  tier,
  result,
  difficultyLevel,
  wins,
}: {
  eventType?: string
  level?: string
  tier?: string
  result?: string
  difficultyLevel?: number | null
  wins?: number | null
}) {
  const normalizedResult = normaliseResult(result)
  const basePoints = RESULT_BASE_POINTS[normalizedResult] ?? 0

  if (eventType === "tournament") {
    return calculateRawPoints({
      level,
      tier,
      result: normalizedResult,
      difficultyLevel,
      wins,
    })
  }

  const normalizedType = normaliseEventTypeFactor(eventType)
  const multiplier = EVENT_TYPE_FACTORS[normalizedType] ?? 1
  return Number((basePoints * multiplier).toFixed(2))
}

export function calculateResultPoints(entry: { eventType?: string; level?: string; tier?: string; result?: string; difficultyLevel?: number | null; wins?: number | null; date?: string }, currentDate: Date = new Date()) {
  const rawPoints =
    entry?.eventType && entry.eventType !== "tournament"
      ? calculateEventAchievementPoints(entry)
      : calculateRawPoints(entry)
  const decayFactor = calculateTimeDecayFactor(entry?.date, currentDate)
  const finalPoints = rawPoints

  return {
    rawPoints: Number(rawPoints.toFixed(2)),
    decayFactor,
    finalPoints: Number(finalPoints.toFixed(2)),
    activePoints: Number(finalPoints.toFixed(2)),
  }
}

export function calculatePoints(athleteId: string, allResults: Array<{ athleteId?: string; level?: string; tier?: string; result?: string; difficultyLevel?: number | null; wins?: number | null; date?: string; eventType?: string }>, currentDate: Date = new Date()) {
  const results = (allResults || []).filter((entry) => entry.athleteId === athleteId)
  const total = results.reduce((sum, entry) => {
    return sum + calculateResultPoints(entry, currentDate).finalPoints
  }, 0)

  return Number(total.toFixed(2))
}
