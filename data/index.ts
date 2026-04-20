/**
 * SKF Karate — Data Layer Barrel Export
 *
 * Single import point for all data: types, schemas, constants, seeds, factories.
 *
 * Usage:
 *   import { CONTACT, BELTS, instructors, createAthlete } from '@/data'
 */

/* ═══════ TYPES ═══════ */
export type {
  // Supabase
  AuthSession, Program, CertificateTemplate, Enrollment, CertificateEvent,
  CertificateView, VideoProgress, PushSubscription, OtpAttempt,
  StudentPoints, PointTransaction,
  // Local
  Athlete, Achievement, PointsHistoryEntry,
  TournamentRecord, TournamentWinner, TournamentParticipant, TournamentResultRecord,
  // Sheets
  Student, FeeRow, VideoRow, TournamentResult, TournamentRow,
  AttendanceRow, Announcement, ShopOrder, Sponsor, TechniqueVideo,
  // Session
  JWTPayload,
  // Enums
  ProgramType, EnrollmentStatus, BeltLevel, FieldAlignment, DownloadFormat,
  CertificateEventType, UserRole, Belt, Branch, SponsorTier, MedalType,
  TournamentLevel, TournamentStatus, EventCategory, AgeGroup,
  AthleteStatus, FeeStatus, AttendanceStatus, StudentStatus, PointTransactionType,
} from './types'

/* ═══════ CONSTANTS ═══════ */
export { BELTS, getBeltOrder } from './constants/belts'
export {
  EVENT_TYPES, EVENT_TYPES_LIST,
  GALLERY_CATEGORIES,
  PRODUCT_CATEGORIES, PRODUCT_CATEGORIES_LIST,
  ACHIEVEMENT_TYPES, TOURNAMENT_LEVELS, TOURNAMENT_LEVELS_LIST,
  SPONSOR_TIERS,
} from './constants/categories'
export { CONTACT } from './constants/contact'
export { PUBLIC_NAV_ITEMS, ADMIN_NAV_ITEMS, PORTAL_NAV_ITEMS } from './constants/navigation'
export {
  POINT_RULES, POINT_TIERS, TIER_THRESHOLDS, REDEMPTION_OPTIONS,
  LEGACY_ACHIEVEMENT_POINTS, TOURNAMENT_LEVEL_MULTIPLIERS,
  EVENT_TIER_WEIGHTS, RESULT_BASE_POINTS,
} from './constants/points'
export { ROLES, ROLES_LIST } from './constants/roles'
export { ROUTES } from './constants/routes'
export {
  ATHLETE_STATUSES, EVENT_STATUSES, ENROLLMENT_STATUSES,
  ORDER_STATUSES, FEE_STATUSES, STUDENT_STATUSES,
  TOURNAMENT_STATUSES, ATTENDANCE_STATUSES,
  CERTIFICATE_EVENT_TYPES, POINT_TRANSACTION_TYPES,
  PROGRAM_TYPES, BELT_EXAM_STATUSES, DOWNLOAD_FORMATS,
} from './constants/statuses'
export { SITE_CONFIG } from './constants/siteConfig'

/* ═══════ SCHEMAS ═══════ */
export {
  allSchemas, supabaseSchemas, localSchemas, sheetsSchemas,
  relationships,
} from './schema'

/* ═══════ SEED DATA ═══════ */
export { instructors } from './seed/instructors'
export { dojos } from './seed/dojos'
export { events } from './seed/events'
export { products } from './seed/products'
export { testimonials } from './seed/testimonials'
export { galleryPhotos } from './seed/gallery'
export { kyuBelts } from './seed/kyuBelts'
export { danGrades } from './seed/danGrades'
export { beltExaminations } from './seed/beltExaminations'

/* ═══════ FACTORIES ═══════ */
export { createInstructor } from './factories/createInstructor'
export { createAthlete } from './factories/createAthlete'
export { createEvent } from './factories/createEvent'
export { createProduct } from './factories/createProduct'
export { createTestimonial } from './factories/createTestimonial'

/* ═══════ MOCKS ═══════ */
export {
  mockGetAllProducts,
  mockGetAllPhotos,
  mockGetAllTestimonials,
} from './mocks'
