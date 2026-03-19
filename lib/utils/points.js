// Legacy academy points remain for the existing admin/student form flows.
export const DEFAULT_POINTS = {
  enrollment: 50,
  "belt-grading": 200,
  "tournament-participation": 50,
  "tournament-bronze": 300,
  "tournament-silver": 400,
  "tournament-gold": 500,
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
  national: 1.0,
  state: 0.6,
  district: 0.35,
  invitational: 0.2,
  "inter-dojo": 0.2,
  open: 0.2,
  international: 2.0,
}

export const RESULT_BASE_POINTS = {
  gold: 100,
  silver: 70,
  bronze: 50,
  "5th-place": 35,
  semifinalist: 35,
  quarterfinalist: 20,
  "round-of-16": 12,
  "first-round": 5,
  participation: 2,
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

export function calculateResultPoints(entry, currentDate = new Date()) {
  const rawPoints = calculateRawPoints(entry)
  const decayFactor = calculateTimeDecayFactor(entry.date, currentDate)
  const finalPoints = rawPoints * decayFactor

  return {
    rawPoints: Number(rawPoints.toFixed(2)),
    decayFactor,
    finalPoints: Number(finalPoints.toFixed(2)),
    activePoints: Number(finalPoints.toFixed(2)),
  }
}

export function calculatePoints(studentId, allResults, currentDate = new Date()) {
  const results = (allResults || []).filter((entry) => entry.studentId === studentId)
  const total = results.reduce((sum, entry) => {
    return sum + calculateResultPoints(entry, currentDate).finalPoints
  }, 0)

  return Number(total.toFixed(2))
}
