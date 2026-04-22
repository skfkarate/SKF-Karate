/**
 * TypeScript interfaces for ALL entities in the SKF Karate platform.
 *
 * This is the SINGLE SOURCE OF TRUTH for type definitions.
 * /lib/types/* files should re-export from here.
 * /types/index.ts should re-export from here.
 */

/* ═══════ ENUMS ═══════ */

export type ProgramType = 'camp' | 'belt_exam' | 'training' | 'tournament'
export type EnrollmentStatus = 'enrolled' | 'completed' | 'revoked'
export type BeltLevel = 'white' | 'yellow' | 'orange' | 'green' | 'blue' | 'purple' | 'brown' | 'black'
export type FieldAlignment = 'left' | 'center' | 'right'
export type DownloadFormat = 'pdf' | 'png'
export type CertificateEventType = 'viewed' | 'downloaded_pdf' | 'downloaded_png' | 'verified' | 'shared'
export type UserRole = 'student' | 'sensei' | 'branch_admin' | 'super_admin'
export type Belt = 'white' | 'yellow' | 'orange' | 'green' | 'blue' | 'brown' | 'black'
export type Branch = 'mp-sports-club' | 'herohalli' | 'kunigal-main' | 'tumkur-main' | 'udupi-main' | string
export type SponsorTier = 'Gold' | 'Silver' | 'Bronze'
export type MedalType = 'gold' | 'silver' | 'bronze'
export type TournamentLevel = 'inter-dojo' | 'district' | 'state' | 'national' | 'international'
export type TournamentStatus = 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'archived'
export type EventCategory = 'kata-individual' | 'kata-team' | 'kumite-individual' | 'kumite-team' | 'mixed'
export type AgeGroup = 'sub-junior' | 'junior' | 'senior' | 'open'
export type AthleteStatus = 'active' | 'inactive'
export type FeeStatus = 'paid' | 'due' | 'overdue'
export type AttendanceStatus = 'Present' | 'Absent' | 'Leave'
export type StudentStatus = 'Active' | 'Inactive'
export type PointTransactionType = 'EARN' | 'REDEEM'

/* ═══════ SUPABASE ENTITIES ═══════ */

export interface AuthSession {
  id: string
  skf_id: string
  pin_hash: string
  failed_attempts: number
  locked_until: string | null
  created_at: string
  updated_at: string
}

export interface Program {
  id: string
  name: string
  type: ProgramType
  branch?: string | null
  has_belt_subtypes: boolean
  is_active: boolean
  created_at: string
}

export interface TemplateFieldConfig {
  id: string
  label: string
  value: string
  x: number
  y: number
  fontSize: number
  fontFamily: string
  color: string
  align: FieldAlignment
  bold: boolean
}

export interface CertificateTemplate {
  id: string
  program_id: string
  belt_level: BeltLevel | null
  template_image_url: string
  fields: TemplateFieldConfig[]
  use_qr_code: boolean
  created_at: string
  updated_at: string
}

export interface Enrollment {
  id: string
  skf_id: string
  program_id: string
  belt_level: string | null
  status: EnrollmentStatus
  completion_date: string | null
  issuer_name: string | null
  certificate_unlocked: boolean
  notification_sent: boolean
  enrolled_at: string
  updated_at: string
  /** Joined fields (populated by Supabase select with join) */
  programs?: Pick<Program, 'name' | 'type'> | null
}

export interface CertificateEvent {
  id: string
  skf_id: string
  enrollment_id: string
  event_type: CertificateEventType
  ip_address: string | null
  created_at: string
}

export interface CertificateView {
  id: string
  skf_id: string
  enrollment_id: string
  viewed_at: string
  downloaded_at: string | null
  download_format: DownloadFormat | null
}

export interface VideoProgress {
  id: string
  skf_id: string
  video_id: string
  watched_percent: number
  completed: boolean
  last_watched: string
}

export interface PushSubscription {
  id: string
  skf_id: string
  branch: string | null
  subscription: Record<string, unknown>
  created_at: string
}

export interface OtpAttempt {
  id: string
  phone: string
  otp_hash: string
  expires_at: string
  attempts: number
  created_at: string
}

export interface StudentPoints {
  skf_id: string
  current_balance: number
  total_earned: number
  total_redeemed: number
  tier: string | null
  updated_at: string
}

export interface PointTransaction {
  id: string
  skf_id: string
  type: PointTransactionType
  reason: string
  points: number
  balance_before: number
  balance_after: number
  metadata: Record<string, unknown>
  created_at: string
}

/* ═══════ LOCAL JSON STORE ENTITIES ═══════ */

export interface Athlete {
  id: string
  registrationNumber: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'male' | 'female'
  photoUrl: string
  branchName: string
  currentBelt: string
  joinDate: string
  status: AthleteStatus
  pointsBalance: number
  pointsLifetime: number
  isPublic: boolean
  isFeatured: boolean
  achievements: Achievement[]
  pointsHistory: PointsHistoryEntry[]
  parentName?: string
  phone?: string
  createdAt: string
  updatedAt: string
}

export interface Achievement {
  id: string
  type: string
  date: string
  title: string
  subtitle?: string
  tournamentLevel?: string
  pointsAwarded: number
  filter: string
  meta?: string[]
  beltEarned?: string
}

export interface PointsHistoryEntry {
  id: string
  date: string
  type: string
  points: number
  description: string
}

export interface TournamentWinner {
  id: string
  athleteId?: string
  athleteName: string
  registrationNumber?: string
  belt: string
  branchName: string
  category: string
  ageGroup: string
  weightCategory?: string
  medal: MedalType
  position: number
  photoUrl?: string
}

export interface TournamentParticipant {
  id: string
  athleteId?: string
  athleteName: string
  registrationNumber: string
  branchName: string
  belt: string
  photoUrl?: string
}

export interface TournamentResultRecord {
  id?: string
  athleteId?: string
  registrationNumber: string
  athleteName: string
  result: string
  medal?: string
  position?: number
  category?: string
  ageGroup?: string
  weightCategory?: string
  notes?: string
}

export interface TournamentRecord {
  id: string
  slug: string
  name: string
  shortName: string
  level: string
  date: string
  endDate?: string
  venue: string
  city: string
  state: string
  description: string
  coverImageUrl?: string
  totalParticipants: number
  skfParticipants: number
  medals: { gold: number; silver: number; bronze: number }
  affiliatedBody?: string
  status: string
  isPublished: boolean
  isFeatured: boolean
  resultsAppliedAt?: string
  createdAt: string
  updatedAt: string
  participants: TournamentParticipant[]
  winners: TournamentWinner[]
  results?: TournamentResultRecord[]
}

/* ═══════ GOOGLE SHEETS ENTITIES ═══════ */

export interface Student {
  skfId: string
  name: string
  branch: Branch
  batch: string
  belt: Belt
  parentName: string
  phone: string
  status: StudentStatus
  enrolledDate: string
  monthlyFee: number
  photoConsent: boolean
  dob?: string // YYYY-MM-DD, column L in Google Sheet
}

export interface FeeRow {
  skfId: string
  month: string
  year: number
  amount: number
  status: FeeStatus
  paidDate?: string
  receiptId?: string
  paymentMethod?: string
}

export interface VideoRow {
  videoId: string
  title: string
  branch: Branch
  batch: string
  section: string
  beltLevel: Belt
  unlockDate: string
  locked: boolean
  durationMin: number
  progressPercent?: number
}

export interface TournamentResult {
  skfId: string
  tournamentName: string
  date: string
  category: string
  medal: 'Gold' | 'Silver' | 'Bronze' | 'Participant'
  points: number
}

export interface TournamentRow extends TournamentResult {
  result?: TournamentResult['medal']
}

export interface AttendanceRow {
  skfId: string
  date: string
  status: AttendanceStatus
  markedBy?: string
}

export interface Announcement {
  slug: string
  title: string
  body: string
  branch: string
  publishedDate: string
  expiryDate: string
  author: string
}

export interface ShopOrder {
  orderId: string
  skfId: string
  itemsJson: string
  total: number
  discount: number
  pointsUsed: number
  date: string
  status: string
  addressJson: string
}

export interface Sponsor {
  name: string
  logoUrl: string
  website: string
  tier: SponsorTier
  active: boolean
  since: string
  description: string
}

export interface TechniqueVideo {
  videoId: string
  title: string
  youtubeUrl: string
  category: string
  beltLevel: string
  durationMin: number
  description: string
  featured: boolean
}

/* ═══════ JWT / SESSION ═══════ */

export interface JWTPayload {
  skfId: string | null
  role: UserRole
  branch: Branch | null
  batch: string | null
  belt: Belt | null
  name: string
  parentPhone: string | null
  iat: number
  exp: number
}
