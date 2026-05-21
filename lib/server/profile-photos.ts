import { existsSync } from 'node:fs'
import path from 'node:path'

import {
  getAthleteFallbackProfilePhoto,
  type ProfilePhotoSource,
} from '@/lib/profile-photos'
import { normaliseSkfId } from '@/lib/utils/registration'

const PROFILE_PHOTOS_DIR = path.resolve(process.cwd(), 'SKF Photos')
const PROFILE_PHOTO_SKF_ID_PATTERN = /^SKF\d{2}[A-Z]{2}\d{3,}$/
const PROFILE_PHOTO_EXTENSIONS = ['webp', 'jpg', 'jpeg', 'png'] as const

const PROFILE_PHOTO_CONTENT_TYPES: Record<(typeof PROFILE_PHOTO_EXTENSIONS)[number], string> = {
  webp: 'image/webp',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
}

export type LocalProfilePhotoFile = {
  skfId: string
  filePath: string
  contentType: string
}

function normalizePhotoSkfId(skfId: string | null | undefined) {
  const normalized = normaliseSkfId(String(skfId || ''))
  return PROFILE_PHOTO_SKF_ID_PATTERN.test(normalized) ? normalized : ''
}

function buildProfilePhotoPath(skfId: string, extension: (typeof PROFILE_PHOTO_EXTENSIONS)[number]) {
  const filePath = path.resolve(PROFILE_PHOTOS_DIR, `${skfId}.${extension}`)
  if (!filePath.startsWith(`${PROFILE_PHOTOS_DIR}${path.sep}`)) return null
  return filePath
}

export function getLocalProfilePhotoFile(skfId: string | null | undefined): LocalProfilePhotoFile | null {
  const normalizedSkfId = normalizePhotoSkfId(skfId)
  if (!normalizedSkfId) return null

  for (const extension of PROFILE_PHOTO_EXTENSIONS) {
    const filePath = buildProfilePhotoPath(normalizedSkfId, extension)
    if (filePath && existsSync(filePath)) {
      return {
        skfId: normalizedSkfId,
        filePath,
        contentType: PROFILE_PHOTO_CONTENT_TYPES[extension],
      }
    }
  }

  return null
}

export function resolveServerAthleteProfilePhoto(source: ProfilePhotoSource) {
  const explicitPhotoUrl = String(source.photoUrl || '').trim()
  if (explicitPhotoUrl && !explicitPhotoUrl.includes('/no-profile/')) return explicitPhotoUrl

  const photoFile = getLocalProfilePhotoFile(source.skfId)
  return photoFile
    ? `/api/profile-photos/${encodeURIComponent(photoFile.skfId)}`
    : getAthleteFallbackProfilePhoto(source.gender)
}
