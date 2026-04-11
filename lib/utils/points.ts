// Legacy academy points remain for the existing admin/athlete form flows.
export const DEFAULT_POINTS = {
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
  "pelt-pass": 180,
  "pelt-fail": 0,
  "grading-fail": 0,
  "attendance-milestone": 100,
  "special-award": 150,
  "birthday-bonus": 100,
  "referral-bonus": 150,
}

export const TOURNAMENT_LEVEL_MULTIPLIER = {
  "inter-dojo": 0.5,
  district: 1.0,
  state: 2.0,
  national: 4.0,
  international: 6.0,
}

export const POINTS_EXPIRY_MONTHS = 12

// Competition ranking points from the implementation plan.
export const EVENT_TIER_WEIGHTS = {
  international: 12,
  national: 8,
  state: 5,
  district: 3,
  invitational: 2,
  "inter-dojo": 2,
  open: 2,
}

export const EVENT_TYPE_FACTORS = {
  seminar: 1,
  camp: 1.5,
  grading: 4,
  "pelt-exam": 3,
  fun: 1,
}

export const RESULT_BASE_POINTS = {
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

function toDate(value) {
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function normaliseEventTier(level) {
  if (!level) return "invitational"

  const normalized = String(level).trim().toLowerCase()

  if (normalized === "national championship") return "national"
  if (normalized === "state championship") return "state"
  if (normalized === "district championship") return "district"
  if (normalized === "wkf") return "international"
  if (normalized === "open") return "open"

  return EVENT_TIER_WEIGHTS[normalized] ? normalized : "invitational"
}

export function normaliseEventTypeFactor(eventType) {
  if (!eventType) return "seminar"
  const normalized = String(eventType).trim().toLowerCase()
  return EVENT_TYPE_FACTORS[normalized] ? normalized : "seminar"
}

export function normaliseResult(result) {
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

export function calculateTournamentPoints(type, level) {
  const base = DEFAULT_POINTS[type] ?? 0
  const multiplier = TOURNAMENT_LEVEL_MULTIPLIER[level] ?? 1
  return Math.round(base * multiplier)
}

export function calculateTimeDecayFactor(resultDate, currentDate = new Date()) {
  const eventDate = toDate(resultDate)
  const now = toDate(currentDate)

  if (!eventDate || !now) return 0

  const diffMonths =
    (now.getFullYear() - eventDate.getFullYear()) * 12 +
    (now.getMonth() - eventDate.getMonth())

  if (diffMonths < 12) return 1.0
  if (diffMonths < 24) return 0.75
  if (diffMonths < 36) return 0.5
  if (diffMonths < 48) return 0.25
  return 0
}

export function calculateRawPoints({ level, tier, result }) {
  const normalizedTier = normaliseEventTier(level || tier)
  const normalizedResult = normaliseResult(result)
  const basePoints = RESULT_BASE_POINTS[normalizedResult] ?? 0
  const multiplier = EVENT_TIER_WEIGHTS[normalizedTier] ?? EVENT_TIER_WEIGHTS.invitational

  return basePoints * multiplier
}

export function calculateEventAchievementPoints({
  eventType = "seminar",
  level,
  tier,
  result,
}) {
  const normalizedResult = normaliseResult(result)
  const basePoints = RESULT_BASE_POINTS[normalizedResult] ?? 0

  if (eventType === "tournament") {
    const normalizedTier = normaliseEventTier(level || tier)
    const multiplier = EVENT_TIER_WEIGHTS[normalizedTier] ?? EVENT_TIER_WEIGHTS.invitational
    return Number((basePoints * multiplier).toFixed(2))
  }

  const normalizedType = normaliseEventTypeFactor(eventType)
  const multiplier = EVENT_TYPE_FACTORS[normalizedType] ?? 1
  return Number((basePoints * multiplier).toFixed(2))
}

export function calculateResultPoints(entry, currentDate = new Date()) {
  const rawPoints =
    entry?.eventType && entry.eventType !== "tournament"
      ? calculateEventAchievementPoints(entry)
      : calculateRawPoints(entry)
  const decayFactor = calculateTimeDecayFactor(entry.date, currentDate)
  const finalPoints = rawPoints * decayFactor

  return {
    rawPoints: Number(rawPoints.toFixed(2)),
    decayFactor,
    finalPoints: Number(finalPoints.toFixed(2)),
    activePoints: Number(finalPoints.toFixed(2)),
  }
}

export function calculatePoints(athleteId, allResults, currentDate = new Date()) {
  const results = (allResults || []).filter((entry) => entry.athleteId === athleteId)
  const total = results.reduce((sum, entry) => {
    return sum + calculateResultPoints(entry, currentDate).finalPoints
  }, 0)

  return Number(total.toFixed(2))
}
