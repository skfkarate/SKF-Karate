/**
 * Schema Index — Aggregates ALL entity schemas across ALL storage layers.
 *
 * Storage layers: supabase | local | sheets
 */

/* ── Type System ── */
export type { EntitySchema, SchemaField, RelationshipDef } from './types'

/* ── Supabase Table Schemas ── */
export { authSessionSchema } from './authSession'
export { programSchema } from './program'
export { certificateTemplateSchema } from './certificateTemplate'
export { enrollmentSchema } from './enrollment'
export { certificateEventSchema } from './certificateEvent'
export { certificateViewSchema } from './certificateView'
export { videoProgressSchema } from './videoProgress'
export { pushSubscriptionSchema, otpAttemptSchema } from './pushAndOtp'
export { studentPointsSchema, pointTransactionSchema } from './points'

/* ── Local JSON Store Schemas ── */
export { athleteSchema } from './athlete'
export { dojoSchema } from './dojo'
export { instructorSchema } from './instructor'
export { eventSchema } from './event'
export { tournamentSchema } from './tournament'
export {
  productSchema,
  testimonialSchema,
  galleryPhotoSchema,
  kyuBeltSchema,
  danGradeSchema,
  beltExaminationSchema,
} from './localEntities'

/* ── Google Sheets Schemas ── */
export {
  studentSchema,
  feeRowSchema,
  videoRowSchema,
  announcementSchema,
  shopOrderSchema,
  sponsorSchema,
  techniqueVideoSchema,
  attendanceSchema,
} from './sheetsEntities'

/* ── Special Schemas ── */
export { portalSessionSchema } from './portalSession'

/* ── Relationship Map ── */
export { relationships } from './_relationships'

/* ── Sheets Sync Documentation ── */
export {
  STUDENTS_COLUMN_MAP,
  FEES_COLUMN_MAP,
  VIDEOS_COLUMN_MAP,
  TOURNAMENTS_COLUMN_MAP,
  ATTENDANCE_COLUMN_MAP,
  ANNOUNCEMENTS_COLUMN_MAP,
  TECHNIQUES_COLUMN_MAP,
  TIMETABLES_COLUMN_MAP,
  SPONSORS_COLUMN_MAP,
  ORDERS_COLUMN_MAP,
  LEADS_COLUMN_MAP,
  SHEETS_DATA_FLOW,
} from './sheetsSync'

/* ── Aggregate ── */
import { authSessionSchema } from './authSession'
import { programSchema } from './program'
import { certificateTemplateSchema } from './certificateTemplate'
import { enrollmentSchema } from './enrollment'
import { certificateEventSchema } from './certificateEvent'
import { certificateViewSchema } from './certificateView'
import { videoProgressSchema } from './videoProgress'
import { pushSubscriptionSchema, otpAttemptSchema } from './pushAndOtp'
import { studentPointsSchema, pointTransactionSchema } from './points'
import { athleteSchema } from './athlete'
import { dojoSchema } from './dojo'
import { instructorSchema } from './instructor'
import { eventSchema } from './event'
import { tournamentSchema } from './tournament'
import { productSchema, testimonialSchema, galleryPhotoSchema, kyuBeltSchema, danGradeSchema, beltExaminationSchema } from './localEntities'
import { studentSchema, feeRowSchema, videoRowSchema, announcementSchema, shopOrderSchema, sponsorSchema, techniqueVideoSchema, attendanceSchema } from './sheetsEntities'
import { portalSessionSchema } from './portalSession'
import type { EntitySchema } from './types'

export const allSchemas: Record<string, EntitySchema> = {
  // Supabase
  authSession: authSessionSchema,
  program: programSchema,
  certificateTemplate: certificateTemplateSchema,
  enrollment: enrollmentSchema,
  certificateEvent: certificateEventSchema,
  certificateView: certificateViewSchema,
  videoProgress: videoProgressSchema,
  pushSubscription: pushSubscriptionSchema,
  otpAttempt: otpAttemptSchema,
  studentPoints: studentPointsSchema,
  pointTransaction: pointTransactionSchema,
  // Local
  athlete: athleteSchema,
  dojo: dojoSchema,
  instructor: instructorSchema,
  event: eventSchema,
  tournament: tournamentSchema,
  product: productSchema,
  testimonial: testimonialSchema,
  galleryPhoto: galleryPhotoSchema,
  kyuBelt: kyuBeltSchema,
  danGrade: danGradeSchema,
  beltExamination: beltExaminationSchema,
  // Sheets
  student: studentSchema,
  feeRow: feeRowSchema,
  videoRow: videoRowSchema,
  announcement: announcementSchema,
  shopOrder: shopOrderSchema,
  sponsor: sponsorSchema,
  techniqueVideo: techniqueVideoSchema,
  attendance: attendanceSchema,
  // Session
  portalSession: portalSessionSchema,
}

export const supabaseSchemas = Object.fromEntries(
  Object.entries(allSchemas).filter(([, s]) => s.storage === 'supabase')
)

export const localSchemas = Object.fromEntries(
  Object.entries(allSchemas).filter(([, s]) => s.storage === 'local')
)

export const sheetsSchemas = Object.fromEntries(
  Object.entries(allSchemas).filter(([, s]) => s.storage === 'sheets')
)
