import { normaliseRegistrationNumber } from '@/lib/utils/registration'

const BELT_EXAM_TYPES = new Set([
  'belt-grading',
  'grading-fail',
  'enrollment',
  'belt-pass',
  'belt-fail',
])

const ATHLETE_BELTS = new Set(['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black'])

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function hasAthleteShape(record?: Record<string, any> | null) {
  return Boolean(record?.registrationNumber || record?.firstName || record?.lastName)
}

function formatAthleteName(record?: Record<string, any> | null) {
  return [record?.firstName, record?.lastName].filter(Boolean).join(' ').trim()
}

function formatName(
  legacyStudent?: Record<string, any> | null,
  athlete?: Record<string, any> | null
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

export function buildAthleteAutomationSummary(athlete?: Record<string, any> | null) {
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
  legacyStudentOrAthlete?: Record<string, any> | null,
  athleteRecord?: Record<string, any> | null
) {
  const athlete = athleteRecord || (hasAthleteShape(legacyStudentOrAthlete) ? legacyStudentOrAthlete : null)
  const legacyStudent = athleteRecord ? legacyStudentOrAthlete : hasAthleteShape(legacyStudentOrAthlete) ? null : legacyStudentOrAthlete
  const today = new Date().toISOString().split('T')[0]
  const registrationNumber = athlete?.registrationNumber
    ? normaliseRegistrationNumber(String(athlete.registrationNumber))
    : legacyStudent?.skfId
      ? normaliseRegistrationNumber(String(legacyStudent.skfId))
      : null

  return {
    skfId: registrationNumber || '',
    registrationNumber,
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
    isPublic: athlete?.isPublic ?? true,
    isFeatured: athlete?.isFeatured ?? false,
    status: String(legacyStudent?.status || mapAthleteStatusToAdminStatus(athlete?.status) || 'Active'),
  }
}

export function buildAdminAthleteRecord(athlete: Record<string, any>) {
  const registrationNumber = athlete?.registrationNumber
    ? normaliseRegistrationNumber(String(athlete.registrationNumber))
    : null

  return {
    skfId: registrationNumber || '',
    registrationNumber,
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
    isPublic: athlete?.isPublic ?? true,
    isFeatured: athlete?.isFeatured ?? false,
    automation: buildAthleteAutomationSummary(athlete),
    publicProfileHref:
      athlete?.isPublic && registrationNumber ? `/athlete/${registrationNumber}` : null,
  }
}

export function mergeStudentAndAthleteRecord(
  legacyStudent: Record<string, any>,
  athlete?: Record<string, any> | null
): Record<string, any> {
  const athleteDefaults = buildAthleteAdminFormDefaults(legacyStudent, athlete)
  return {
    ...legacyStudent,
    ...athleteDefaults,
    displayName: athleteDefaults.name,
    automation: buildAthleteAutomationSummary(athlete),
    publicProfileHref:
      athlete?.isPublic && athleteDefaults.registrationNumber
        ? `/athlete/${athleteDefaults.registrationNumber}`
        : null,
  }
}

export function buildAthletePayloadFromAdminForm(values: Record<string, any>) {
  const { firstName, lastName } = splitAthleteName(String(values?.name || ''))

  return {
    registrationNumber: values?.registrationNumber || values?.skfId || '',
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
    isPublic: Boolean(values?.isPublic ?? true),
    isFeatured: Boolean(values?.isFeatured ?? false),
  }
}
