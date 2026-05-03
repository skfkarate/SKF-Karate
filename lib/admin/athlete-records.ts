import { normaliseSkfId } from '@/lib/utils/registration'

const BELT_EXAM_TYPES = new Set([
  'belt-grading',
  'grading-fail',
  'enrollment',
  'belt-pass',
  'belt-fail',
])

const ATHLETE_BELTS = new Set(['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black'])

type AthleteAchievement = {
  type?: string
  pointsAwarded?: unknown
  date?: string
}

type AthleteLike = {
  skfId?: string
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  gender?: string
  photoUrl?: string
  branchName?: string
  currentBelt?: string
  joinDate?: string
  status?: string
  parentName?: string
  phone?: string
  email?: string
  batch?: string
  monthlyFee?: unknown
  photoConsent?: boolean
  consentGivenAt?: string | null
  isPublic?: boolean
  isFeatured?: boolean
  achievements?: AthleteAchievement[]
}

type LegacyStudentLike = {
  skfId?: string
  name?: string
  dob?: string
  enrolledDate?: string
  branch?: string
  batch?: string
  belt?: string
  parentName?: string
  phone?: string
  email?: string
  photoUrl?: string
  monthlyFee?: unknown
  photoConsent?: boolean
  consentGivenAt?: string | null
  status?: string
}

type AdminRecordInput = AthleteLike & LegacyStudentLike

type AdminFormValues = {
  skfId?: string
  name?: string
  dob?: string
  gender?: string
  photoUrl?: string
  branch?: string
  belt?: string
  enrolledDate?: string
  status?: string
  parentName?: string
  phone?: string
  email?: string
  batch?: string
  monthlyFee?: unknown
  photoConsent?: unknown
  dataConsent?: unknown
  consentGivenAt?: string | null
  isPublic?: unknown
  isFeatured?: unknown
}

type AthleteAutomationSummary = {
  competitionResults: number
  beltEntries: number
  specialEvents: number
  lifetimePoints: number
  achievementCount: number
  lastActivityDate: string | null
}

type MergedStudentAthleteRecord = LegacyStudentLike &
  ReturnType<typeof buildAthleteAdminFormDefaults> & {
    displayName: string
    automation: AthleteAutomationSummary
    publicProfileHref: string | null
  }

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function hasAthleteShape(record?: AdminRecordInput | null) {
  return Boolean(record?.skfId || record?.firstName || record?.lastName)
}

function formatAthleteName(record?: AthleteLike | null) {
  return [record?.firstName, record?.lastName].filter(Boolean).join(' ').trim()
}

function formatName(
  legacyStudent?: LegacyStudentLike | null,
  athlete?: AthleteLike | null
) {
  return String(legacyStudent?.name || formatAthleteName(athlete) || '').trim()
}

function mapAthleteStatusToAdminStatus(status?: string) {
  return String(status || '').toLowerCase() === 'inactive' ? 'Inactive' : 'Active'
}

function mapBeltForAdmin(value?: string) {
  const normalized = String(value || 'white').trim().toLowerCase()
  if (normalized.startsWith('black')) return 'black'
  return ATHLETE_BELTS.has(normalized) ? normalized : 'white'
}

function splitAthleteName(name: string) {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) {
    return { firstName: 'SKF', lastName: 'Athlete' }
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  }
}

export function buildAthleteAutomationSummary(athlete?: AthleteLike | null): AthleteAutomationSummary {
  const achievements = Array.isArray(athlete?.achievements) ? athlete.achievements : []
  const competitionResults = achievements.filter((entry) =>
    String(entry?.type || '').startsWith('tournament')
  ).length
  const beltEntries = achievements.filter((entry) =>
    BELT_EXAM_TYPES.has(String(entry?.type || ''))
  ).length
  const specialEvents = Math.max(achievements.length - competitionResults - beltEntries, 0)
  const lifetimePoints = achievements.reduce(
    (sum, entry) => sum + toNumber(entry?.pointsAwarded, 0),
    0
  )
  const lastActivityDate =
    achievements
      .map((entry) => String(entry?.date || '').trim())
      .filter(Boolean)
      .sort()
      .at(-1) || null

  return {
    competitionResults,
    beltEntries,
    specialEvents,
    lifetimePoints,
    achievementCount: achievements.length,
    lastActivityDate,
  }
}

export function buildAthleteAdminFormDefaults(
  legacyStudentOrAthlete?: AdminRecordInput | null,
  athleteRecord?: AthleteLike | null
) {
  const athlete = athleteRecord || (hasAthleteShape(legacyStudentOrAthlete) ? legacyStudentOrAthlete : null)
  const legacyStudent = athleteRecord ? legacyStudentOrAthlete : hasAthleteShape(legacyStudentOrAthlete) ? null : legacyStudentOrAthlete
  const today = new Date().toISOString().split('T')[0]
  const skfId = athlete?.skfId
    ? normaliseSkfId(String(athlete.skfId))
    : legacyStudent?.skfId
      ? normaliseSkfId(String(legacyStudent.skfId))
      : null

  return {
    skfId: skfId || '',
    name: formatName(legacyStudent, athlete),
    dob: String(legacyStudent?.dob || athlete?.dateOfBirth || '').trim(),
    enrolledDate: String(legacyStudent?.enrolledDate || athlete?.joinDate || today).trim(),
    branch: String(legacyStudent?.branch || athlete?.branchName || '').trim(),
    batch: String(legacyStudent?.batch || athlete?.batch || '').trim(),
    belt: mapBeltForAdmin(legacyStudent?.belt || athlete?.currentBelt),
    gender: String(athlete?.gender || 'male').toLowerCase(),
    parentName: String(legacyStudent?.parentName || athlete?.parentName || '').trim(),
    phone: String(legacyStudent?.phone || athlete?.phone || '').trim(),
    email: String(legacyStudent?.email || athlete?.email || '').trim(),
    photoUrl: String(legacyStudent?.photoUrl || athlete?.photoUrl || '').trim(),
    monthlyFee: toNumber(legacyStudent?.monthlyFee ?? athlete?.monthlyFee, 0),
    photoConsent: Boolean(legacyStudent?.photoConsent ?? athlete?.photoConsent),
    dataConsent: Boolean(athlete?.consentGivenAt),
    consentGivenAt: athlete?.consentGivenAt || null,
    isPublic: athlete?.isPublic ?? true,
    isFeatured: athlete?.isFeatured ?? false,
    status: String(legacyStudent?.status || mapAthleteStatusToAdminStatus(athlete?.status) || 'Active'),
  }
}

export function buildAdminAthleteRecord(athlete: AthleteLike) {
  const skfId = athlete?.skfId
    ? normaliseSkfId(String(athlete.skfId))
    : null

  return {
    skfId: skfId || '',
    displayName: formatAthleteName(athlete) || 'SKF Athlete',
    name: formatAthleteName(athlete) || 'SKF Athlete',
    branch: athlete?.branchName || '',
    batch: athlete?.batch || '',
    belt: mapBeltForAdmin(athlete?.currentBelt),
    parentName: athlete?.parentName || '',
    phone: athlete?.phone || '',
    email: athlete?.email || '',
    status: mapAthleteStatusToAdminStatus(athlete?.status),
    enrolledDate: athlete?.joinDate || '',
    dob: athlete?.dateOfBirth || '',
    gender: athlete?.gender || 'male',
    photoUrl: athlete?.photoUrl || '',
    monthlyFee: toNumber(athlete?.monthlyFee, 0),
    photoConsent: Boolean(athlete?.photoConsent),
    dataConsent: Boolean(athlete?.consentGivenAt),
    consentGivenAt: athlete?.consentGivenAt || null,
    isPublic: athlete?.isPublic ?? true,
    isFeatured: athlete?.isFeatured ?? false,
    automation: buildAthleteAutomationSummary(athlete),
    publicProfileHref:
      athlete?.isPublic && skfId ? `/athlete/${skfId}` : null,
  }
}

export function mergeStudentAndAthleteRecord(
  legacyStudent: LegacyStudentLike,
  athlete?: AthleteLike | null
): MergedStudentAthleteRecord {
  const athleteDefaults = buildAthleteAdminFormDefaults(legacyStudent, athlete)
  return {
    ...legacyStudent,
    ...athleteDefaults,
    displayName: athleteDefaults.name,
    automation: buildAthleteAutomationSummary(athlete),
    publicProfileHref:
      athlete?.isPublic && athleteDefaults.skfId
        ? `/athlete/${athleteDefaults.skfId}`
        : null,
  }
}

export function buildAthletePayloadFromAdminForm(values: AdminFormValues) {
  const { firstName, lastName } = splitAthleteName(String(values?.name || ''))

  return {
    skfId: values?.skfId || '',
    firstName,
    lastName,
    dateOfBirth: String(values?.dob || '').trim(),
    gender: String(values?.gender || 'male').trim().toLowerCase(),
    photoUrl: String(values?.photoUrl || '').trim(),
    branchName: String(values?.branch || '').trim(),
    currentBelt: String(values?.belt || 'white').trim().toLowerCase(),
    joinDate: String(values?.enrolledDate || '').trim(),
    status: String(values?.status || 'Active').trim().toLowerCase() === 'inactive' ? 'inactive' : 'active',
    parentName: String(values?.parentName || '').trim(),
    phone: String(values?.phone || '').trim(),
    email: String(values?.email || '').trim(),
    batch: String(values?.batch || '').trim(),
    monthlyFee: toNumber(values?.monthlyFee, 0),
    photoConsent: Boolean(values?.photoConsent),
    consentGivenAt: Boolean(values?.dataConsent)
      ? values?.consentGivenAt || new Date().toISOString()
      : null,
    isPublic: Boolean(values?.isPublic ?? true),
    isFeatured: Boolean(values?.isFeatured ?? false),
  }
}
