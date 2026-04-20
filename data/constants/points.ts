/**
 * Points System Constants
 *
 * Extracted from two sources:
 *   1. lib/points/pointsService.ts (POINT_RULES, TIERS, REDEMPTION_OPTIONS)
 *   2. lib/utils/points.ts (DEFAULT_POINTS, TOURNAMENT_LEVEL_MULTIPLIER, result-based calculations)
 *
 * Two points systems co-exist:
 *   1. Supabase-backed points (pointsService.ts) — student_points + point_transactions tables
 *   2. Legacy local points (utils/points.ts) — calculated from achievement arrays, used for rankings
 */

/* ═══════ SYSTEM 1: Supabase Points (pointsService.ts) ═══════ */

/** Points awarded per action — triggers in awardPoints() */
export const POINT_RULES = Object.freeze({
  ATTENDANCE: 10,
  PERFECT_MONTH: 100,
  GRADING_PASS: 200,
  TOURNAMENT_GOLD: 500,
  TOURNAMENT_SILVER: 300,
  TOURNAMENT_BRONZE: 200,
  TOURNAMENT_PARTICIPATION: 100,
  BIRTHDAY: 50,
  REFERRAL: 300,
  WATCH_VIDEO: 20,
  LOGIN_BONUS: 10,
  PRACTICE_LOG: 5,
  TESTIMONIAL: 50,
  PROFILE_COMPLETE: 25,
  ANNIVERSARY: 500,
} as const)

export type PointRuleKey = keyof typeof POINT_RULES
export const POINT_RULE_KEYS = Object.keys(POINT_RULES) as PointRuleKey[]

/** Membership tiers — computed from total_earned in student_points table */
export const POINT_TIERS = Object.freeze([
  { name: 'white',  label: 'White Belt Member',  min: 0,     color: '#e0e0e0' },
  { name: 'yellow', label: 'Yellow Belt Member',  min: 1000,  color: '#f1c40f' },
  { name: 'orange', label: 'Orange Belt Member',  min: 2500,  color: '#e67e22' },
  { name: 'green',  label: 'Green Belt Member',   min: 5000,  color: '#27ae60' },
  { name: 'blue',   label: 'Blue Belt Member',    min: 10000, color: '#2980b9' },
  { name: 'brown',  label: 'Brown Belt Member',   min: 20000, color: '#8B4513' },
  { name: 'black',  label: 'Black Belt Member',   min: 40000, color: '#1a1a1a' },
] as const)

export type PointTierName = typeof POINT_TIERS[number]['name']

/** Thresholds in { min, max } format for schema documentation */
export const TIER_THRESHOLDS = Object.freeze({
  WHITE:  { min: 0,     max: 999 },
  YELLOW: { min: 1000,  max: 2499 },
  ORANGE: { min: 2500,  max: 4999 },
  GREEN:  { min: 5000,  max: 9999 },
  BLUE:   { min: 10000, max: 19999 },
  BROWN:  { min: 20000, max: 39999 },
  BLACK:  { min: 40000, max: 999999 },
} as const)

/** Redemption options available to students */
export const REDEMPTION_OPTIONS = Object.freeze([
  { id: 'disc5',   label: '5% discount on shop order',   cost: 100,  type: 'discount',   value: 5 },
  { id: 'disc10',  label: '10% discount on shop order',  cost: 200,  type: 'discount',   value: 10 },
  { id: 'item500', label: 'Free item (up to ₹500 value)', cost: 500,  type: 'free_item',  value: 500 },
  { id: 'belt',    label: 'Free standard belt',          cost: 800,  type: 'free_item',  value: 0 },
  { id: 'badge',   label: 'Champion badge on profile',   cost: 1000, type: 'badge',      value: 0 },
  { id: 'fee200',  label: '₹200 off next month fee',     cost: 2000, type: 'fee_credit', value: 200 },
] as const)

/* ═══════ SYSTEM 2: Legacy Ranking Points (utils/points.ts) ═══════ */

/** Legacy academy points per achievement type */
export const LEGACY_ACHIEVEMENT_POINTS = Object.freeze({
  'enrollment': 50,
  'belt-grading': 200,
  'tournament-participation': 50,
  'tournament-bronze': 300,
  'tournament-silver': 400,
  'tournament-gold': 500,
  'seminar-attended': 10,
  'seminar-completion': 30,
  'camp-attended': 10,
  'camp-completion': 30,
  'pelt-pass': 180,
  'pelt-fail': 0,
  'grading-fail': 0,
  'attendance-milestone': 100,
  'special-award': 150,
  'birthday-bonus': 100,
  'referral-bonus': 150,
} as const)

/** Tournament level multipliers for legacy point calculations */
export const TOURNAMENT_LEVEL_MULTIPLIERS = Object.freeze({
  'inter-dojo': 0.5,
  'district': 1.0,
  'state': 2.0,
  'national': 4.0,
  'international': 6.0,
} as const)

/** Points expiry period */
export const POINTS_EXPIRY_MONTHS = 12

/** Event tier weights for ranking calculations */
export const EVENT_TIER_WEIGHTS = Object.freeze({
  international: 12,
  national: 8,
  state: 5,
  district: 3,
  invitational: 2,
  'inter-dojo': 2,
  open: 2,
} as const)

/** Result base points for ranking calculations */
export const RESULT_BASE_POINTS = Object.freeze({
  gold: 100,
  silver: 70,
  bronze: 50,
  '5th-place': 30,
  semifinalist: 30,
  quarterfinalist: 20,
  'round-of-16': 12,
  'first-round': 5,
  participation: 10,
  pass: 60,
  fail: 0,
  completed: 30,
  attended: 10,
  absent: 0,
} as const)
