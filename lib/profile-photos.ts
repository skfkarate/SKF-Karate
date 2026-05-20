import { normaliseSkfId } from '@/lib/utils/registration'

const PROFILE_PHOTO_ROUTE = '/api/profile-photos'
const PROFILE_PHOTO_SKF_ID_PATTERN = /^SKF\d{2}[A-Z]{2}\d{3,}$/

export type ProfilePhotoSource = {
  skfId?: string | null
  photoUrl?: string | null
  gender?: string | null
}

function normalizePhotoSkfId(skfId: string | null | undefined) {
  const normalized = normaliseSkfId(String(skfId || ''))
  return PROFILE_PHOTO_SKF_ID_PATTERN.test(normalized) ? normalized : ''
}

export function getAthleteFallbackProfilePhoto(gender: string | null | undefined) {
  return String(gender || '').toLowerCase() === 'female'
    ? '/no-profile/no profile female.png'
    : '/no-profile/no profile male.png'
}

export function getLocalProfilePhotoUrl(
  skfId: string | null | undefined,
  gender?: string | null
) {
  const normalizedSkfId = normalizePhotoSkfId(skfId)
  if (!normalizedSkfId) return ''

  const normalizedGender = String(gender || '').toLowerCase()
  const query = normalizedGender ? `?gender=${encodeURIComponent(normalizedGender)}` : ''
  return `${PROFILE_PHOTO_ROUTE}/${encodeURIComponent(normalizedSkfId)}${query}`
}

export function resolveAthleteProfilePhoto(source: ProfilePhotoSource) {
  const explicitPhotoUrl = String(source.photoUrl || '').trim()
  if (explicitPhotoUrl) return explicitPhotoUrl

  return getLocalProfilePhotoUrl(source.skfId, source.gender) || getAthleteFallbackProfilePhoto(source.gender)
}
