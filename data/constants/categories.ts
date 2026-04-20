/**
 * Category Constants — event types, gallery categories, shop categories, achievement types.
 */

/* ── Calendar Event Types ──
 * Canonical source: lib/types/event.ts
 * These are for calendar events displayed on the public site.
 * NOT the same as PROGRAM_TYPES (used for certificate programs in Supabase).
 */
import {
  EVENT_TYPES as CANONICAL_EVENT_TYPES,
  EVENT_TYPE_LABELS,
  EVENT_STATUSES as CANONICAL_EVENT_STATUSES,
} from '@/lib/types/event'

export const EVENT_TYPES = CANONICAL_EVENT_TYPES
export type EventType = typeof CANONICAL_EVENT_TYPES[number]
export const EVENT_TYPES_LIST = CANONICAL_EVENT_TYPES

/** Filter pill labels for the events page */
export const EVENT_FILTER_OPTIONS = ['All', 'Camp', 'Grading', 'Tournament', 'PELT Exam', 'Seminar', 'Fun'] as const

/** Badge CSS class mapping for event types */
export const EVENT_TYPE_BADGE_CLASS: Record<string, string> = {
  Camp: 'tag-camp',
  Grading: 'tag-grading',
  Tournament: 'tag-tournament',
  'pelt-exam': 'tag-seminar',
  Seminar: 'tag-seminar',
  Fun: 'tag-fun',
}

/** Human-readable label for event types */
export function getEventLabel(type: string): string {
  const map: Record<string, string> = {
    tournament: 'Tournament',
    seminar: 'Seminar',
    'pelt-exam': 'PELT Exam',
    grading: 'Grading',
    camp: 'Camp',
    fun: 'Fun',
  }
  return map[type] || type
}

/* ── Gallery Categories ── */
export const GALLERY_CATEGORIES = Object.freeze([
  'Demonstrations',
  'Tournaments',
  'Belt Exams',
  'In Dojo',
  'Camps',
  'Championships',
  'Seminars',
] as const)

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number]

/* ── Shop Product Categories ── */
export const PRODUCT_CATEGORIES = Object.freeze({
  UNIFORMS: 'uniforms',
  BELTS: 'belts',
  GEAR: 'gear',
  MERCHANDISE: 'merchandise',
} as const)

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[keyof typeof PRODUCT_CATEGORIES]
export const PRODUCT_CATEGORIES_LIST = Object.values(PRODUCT_CATEGORIES)

/** Shop filter tabs including 'all' */
export const SHOP_FILTER_TABS = Object.freeze([
  { id: 'all', label: 'All' },
  { id: 'uniforms', label: 'Uniforms' },
  { id: 'belts', label: 'Belts' },
  { id: 'gear', label: 'Gear' },
  { id: 'merchandise', label: 'Merchandise' },
])

/* ── Achievement Types ── */
export const ACHIEVEMENT_TYPES = Object.freeze({
  TOURNAMENT_GOLD: 'tournament-gold',
  TOURNAMENT_SILVER: 'tournament-silver',
  TOURNAMENT_BRONZE: 'tournament-bronze',
  TOURNAMENT_PARTICIPATION: 'tournament-participation',
  BELT_GRADING: 'belt-grading',
  BIRTHDAY_BONUS: 'birthday-bonus',
  ATTENDANCE_MILESTONE: 'attendance-milestone',
  ENROLLMENT: 'enrollment',
  REFERRAL_BONUS: 'referral-bonus',
  SPECIAL_AWARD: 'special-award',
} as const)

export type AchievementType = (typeof ACHIEVEMENT_TYPES)[keyof typeof ACHIEVEMENT_TYPES]

/* ── Tournament Levels ── */
export const TOURNAMENT_LEVELS = Object.freeze({
  DISTRICT: 'district',
  STATE: 'state',
  NATIONAL: 'national',
  CONTINENTAL: 'continental',
  INTERNATIONAL: 'international',
  PREMIER_LEAGUE: 'premier-league',
  OLYMPIC: 'olympic',
} as const)

export type TournamentLevel = (typeof TOURNAMENT_LEVELS)[keyof typeof TOURNAMENT_LEVELS]
export const TOURNAMENT_LEVELS_LIST = Object.values(TOURNAMENT_LEVELS)

/* ── Sponsor Tiers ── */
export const SPONSOR_TIERS = Object.freeze({
  GOLD: 'Gold',
  SILVER: 'Silver',
  BRONZE: 'Bronze',
} as const)

export type SponsorTier = (typeof SPONSOR_TIERS)[keyof typeof SPONSOR_TIERS]
