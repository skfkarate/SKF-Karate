/**
 * Status Constants — all status strings used across entities.
 */

export const ATHLETE_STATUSES = Object.freeze({
  ACTIVE: 'active',
  ALUMNI: 'alumni',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
} as const)

export type AthleteStatus = (typeof ATHLETE_STATUSES)[keyof typeof ATHLETE_STATUSES]
export const ATHLETE_STATUSES_LIST = Object.values(ATHLETE_STATUSES)

export const EVENT_STATUSES = Object.freeze({
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DRAFT: 'draft',
} as const)

export type EventStatus = (typeof EVENT_STATUSES)[keyof typeof EVENT_STATUSES]
export const EVENT_STATUSES_LIST = Object.values(EVENT_STATUSES)

export const ENROLLMENT_STATUSES = Object.freeze({
  ENROLLED: 'enrolled',
  COMPLETED: 'completed',
  REVOKED: 'revoked',
} as const)

export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[keyof typeof ENROLLMENT_STATUSES]
export const ENROLLMENT_STATUSES_LIST = Object.values(ENROLLMENT_STATUSES)

export const ORDER_STATUSES = Object.freeze({
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const)

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES]
export const ORDER_STATUSES_LIST = Object.values(ORDER_STATUSES)

export const FEE_STATUSES = Object.freeze({
  PAID: 'paid',
  DUE: 'due',
  OVERDUE: 'overdue',
} as const)

export type FeeStatus = (typeof FEE_STATUSES)[keyof typeof FEE_STATUSES]
export const FEE_STATUSES_LIST = Object.values(FEE_STATUSES)

export const STUDENT_STATUSES = Object.freeze({
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
} as const)

export type StudentStatus = (typeof STUDENT_STATUSES)[keyof typeof STUDENT_STATUSES]
export const STUDENT_STATUSES_LIST = Object.values(STUDENT_STATUSES)

/* ── Tournament Statuses ── */
export const TOURNAMENT_STATUSES = Object.freeze({
  DRAFT: 'draft',
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
} as const)

export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[keyof typeof TOURNAMENT_STATUSES]
export const TOURNAMENT_STATUSES_LIST = Object.values(TOURNAMENT_STATUSES)

/* ── Attendance Statuses (Google Sheets) ── */
export const ATTENDANCE_STATUSES = Object.freeze({
  PRESENT: 'Present',
  ABSENT: 'Absent',
  LEAVE: 'Leave',
} as const)

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[keyof typeof ATTENDANCE_STATUSES]
export const ATTENDANCE_STATUSES_LIST = Object.values(ATTENDANCE_STATUSES)

/* ── Certificate Event Types (Supabase) ── */
export const CERTIFICATE_EVENT_TYPES = Object.freeze({
  VIEWED: 'viewed',
  DOWNLOADED_PDF: 'downloaded_pdf',
  DOWNLOADED_PNG: 'downloaded_png',
  VERIFIED: 'verified',
  SHARED: 'shared',
} as const)

export type CertificateEventType = (typeof CERTIFICATE_EVENT_TYPES)[keyof typeof CERTIFICATE_EVENT_TYPES]
export const CERTIFICATE_EVENT_TYPES_LIST = Object.values(CERTIFICATE_EVENT_TYPES)

/* ── Point Transaction Types (Supabase) ── */
export const POINT_TRANSACTION_TYPES = Object.freeze({
  EARN: 'EARN',
  REDEEM: 'REDEEM',
} as const)

export type PointTransactionType = (typeof POINT_TRANSACTION_TYPES)[keyof typeof POINT_TRANSACTION_TYPES]

/* ── Program Types (Supabase) ── */
export const PROGRAM_TYPES = Object.freeze({
  CAMP: 'camp',
  BELT_EXAM: 'belt_exam',
  TRAINING: 'training',
  TOURNAMENT: 'tournament',
} as const)

export type ProgramType = (typeof PROGRAM_TYPES)[keyof typeof PROGRAM_TYPES]
export const PROGRAM_TYPES_LIST = Object.values(PROGRAM_TYPES)

/* ── Belt Examination Statuses ── */
export const BELT_EXAM_STATUSES = Object.freeze({
  PASSED: 'Passed',
  SCHEDULED: 'Scheduled',
  FAILED: 'Failed',
} as const)

export type BeltExamStatus = (typeof BELT_EXAM_STATUSES)[keyof typeof BELT_EXAM_STATUSES]
export const BELT_EXAM_STATUSES_LIST = Object.values(BELT_EXAM_STATUSES)

/* ── Download Formats (Supabase) ── */
export const DOWNLOAD_FORMATS = Object.freeze({
  PDF: 'pdf',
  PNG: 'png',
} as const)

export type DownloadFormat = (typeof DOWNLOAD_FORMATS)[keyof typeof DOWNLOAD_FORMATS]
