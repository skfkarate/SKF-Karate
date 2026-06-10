type AthleteFormValues = {
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

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
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

export function buildAthletePayloadFromForm(values: AthleteFormValues) {
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
