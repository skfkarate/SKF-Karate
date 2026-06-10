import type { Session } from 'next-auth'

import type { AuthUser } from '@/lib/server/auth/staff'
import { ApiError } from '@/lib/server/api'
import {
  getAthleteBySkfIdLive,
  updateAthleteLive,
} from '@/lib/server/repositories/athletes-live'
import {
  revalidateAthleteSitePaths,
  revalidatePortalSitePaths,
} from '@/lib/server/revalidation'
import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import { normaliseSkfId } from '@/lib/utils/registration'
import { AppError, AuthenticationError, AuthorizationError, NotFoundError, ValidationError } from '@/src/server/lib/errors'
import { logger } from '@/src/server/lib/logger'
import { timingSafeStringEqual } from '@/src/server/lib/security'
import { FeeOperationsService } from '@/src/server/services/fee-operations.service'

const PROFILE_PHOTO_BUCKET = 'athlete-profile-photos'
const MAX_PROFILE_PHOTO_BODY_BYTES = 8 * 1024 * 1024
const PROFILE_PHOTO_WRITE_ROLES = new Set(['admin', 'instructor', 'fee_manager'])
const FEE_TRACK_ROLES = new Set(FeeOperationsService.roles)
const PROFILE_PHOTO_MIME_TYPES = new Map([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/jpg', 'jpg'],
  ['image/webp', 'webp'],
])

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

function normalizeKey(value: unknown) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function branchScopeKey(value: unknown) {
  const key = normalizeKey(value)
  if (['mpsc', 'mp', 'mp sports club', 'm p sports club', 'mp sports'].includes(key)) {
    return 'm p sports club'
  }
  if (['herohalli', 'hero'].includes(key)) return 'herohalli'
  if (!key || key === 'all' || key === 'both' || key === 'bangalore') return 'all'
  return key
}

function assertApiKey(request: Request) {
  const expected = process.env.FEETRACK_API_KEY
  if (!expected) throw new AuthenticationError('FeeTrack integration key is not configured.')

  const actual = request.headers.get('x-feetrack-api-key') || ''
  if (!timingSafeStringEqual(actual, expected)) {
    throw new AuthenticationError('Invalid FeeTrack integration key.')
  }
}

function assertBodySize(request: Request) {
  const contentLength = request.headers.get('content-length')
  if (!contentLength) return

  const parsedLength = Number(contentLength)
  if (Number.isFinite(parsedLength) && parsedLength > MAX_PROFILE_PHOTO_BODY_BYTES) {
    throw new AppError(
      'REQUEST_TOO_LARGE',
      `Request body exceeds ${MAX_PROFILE_PHOTO_BODY_BYTES} bytes.`,
      413
    )
  }
}

function sessionFromStaff(staff: AuthUser): Session {
  if (!staff?.id || !staff.role) throw new AuthenticationError('FeeTrack staff session is required.')
  if (!FEE_TRACK_ROLES.has(staff.role)) {
    throw new AuthorizationError('This staff account cannot access FeeTrack.')
  }
  if (!PROFILE_PHOTO_WRITE_ROLES.has(staff.role)) {
    throw new AuthorizationError('Fee viewer access is read-only.')
  }

  return {
    expires: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    user: {
      id: staff.id,
      name: staff.name || staff.id,
      role: staff.role,
      branchScope: staff.branchScope || 'all',
    },
  } as Session
}

function assertBranchScope(session: Session, branchName: unknown) {
  const scope = branchScopeKey((session.user as { branchScope?: string } | undefined)?.branchScope || 'all')
  if (scope === 'all') return
  if (branchScopeKey(branchName) === scope) return

  throw new AuthorizationError('This student is outside your FeeTrack scope.')
}

function imageExtension(file: File) {
  const extension = PROFILE_PHOTO_MIME_TYPES.get(file.type)
  if (!extension) {
    throw new ValidationError({ photo: ['Profile photo must be a JPG, PNG, or WebP image.'] })
  }
  return extension
}

async function ensureProfilePhotoBucket() {
  if (!isSupabaseReady()) {
    throw new AppError(
      'EXTERNAL_SERVICE_ERROR',
      'Supabase storage is not configured for profile photo uploads.',
      503
    )
  }

  const { data, error } = await supabaseAdmin.storage.getBucket(PROFILE_PHOTO_BUCKET)
  if (!error && data) return

  const { error: createError } = await supabaseAdmin.storage.createBucket(PROFILE_PHOTO_BUCKET, {
    public: true,
    allowedMimeTypes: [...PROFILE_PHOTO_MIME_TYPES.keys()].filter((mimeType) => mimeType !== 'image/jpg'),
    fileSizeLimit: MAX_PROFILE_PHOTO_BODY_BYTES,
  })

  if (createError && !String(createError.message || '').toLowerCase().includes('already exists')) {
    throw new AppError(
      'EXTERNAL_SERVICE_ERROR',
      createError.message || 'Unable to prepare profile photo storage.',
      503
    )
  }
}

async function removeOldProfileImages(skfId: string, currentPath: string) {
  const { data, error } = await supabaseAdmin.storage.from(PROFILE_PHOTO_BUCKET).list(skfId, {
    limit: 100,
  })
  if (error) {
    throw new AppError(
      'EXTERNAL_SERVICE_ERROR',
      error.message || 'Unable to inspect old profile photos.',
      503
    )
  }

  const oldPaths = (data || [])
    .filter((entry) => `${skfId}/${entry.name}` !== currentPath)
    .map((entry) => `${skfId}/${entry.name}`)

  if (!oldPaths.length) return

  const { error: removeError } = await supabaseAdmin.storage.from(PROFILE_PHOTO_BUCKET).remove(oldPaths)
  if (removeError) {
    throw new AppError(
      'EXTERNAL_SERVICE_ERROR',
      removeError.message || 'Unable to remove old profile photos.',
      503
    )
  }
}

async function uploadStoredProfilePhoto(skfId: string, file: File) {
  if (!file || file.size === 0) {
    throw new ValidationError({ photo: ['Upload a profile photo.'] })
  }
  if (file.size > MAX_PROFILE_PHOTO_BODY_BYTES) {
    throw new AppError(
      'REQUEST_TOO_LARGE',
      `Profile photo exceeds ${MAX_PROFILE_PHOTO_BODY_BYTES} bytes.`,
      413
    )
  }

  await ensureProfilePhotoBucket()
  const extension = imageExtension(file)
  const storagePath = `${skfId}/${skfId}.${extension}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabaseAdmin.storage.from(PROFILE_PHOTO_BUCKET).upload(storagePath, buffer, {
    contentType: file.type,
    upsert: true,
  })
  if (error) {
    throw new AppError(
      'EXTERNAL_SERVICE_ERROR',
      error.message || 'Unable to upload profile photo.',
      503
    )
  }

  await removeOldProfileImages(skfId, storagePath)

  const { data } = supabaseAdmin.storage.from(PROFILE_PHOTO_BUCKET).getPublicUrl(storagePath)
  return {
    path: storagePath,
    photoUrl: `${data.publicUrl}?v=${Date.now()}`,
  }
}

export async function POST(request: Request) {
  let skfId = 'unknown'

  try {
    assertApiKey(request)
    assertBodySize(request)

    const formData = await request.formData()
    skfId = normaliseSkfId(String(formData.get('skfId') || ''))
    if (!skfId) throw new ValidationError({ skfId: ['SKF ID is required.'] })

    const staffRaw = String(formData.get('staff') || '')
    const staff = staffRaw ? JSON.parse(staffRaw) as AuthUser : null
    const session = sessionFromStaff(staff!)

    const athlete = await getAthleteBySkfIdLive(skfId)
    if (!athlete) throw new NotFoundError('Student')
    assertBranchScope(session, athlete.branchName)

    const fileValue = formData.get('photo')
    const photo = fileValue instanceof File ? fileValue : null
    if (!photo) throw new ValidationError({ photo: ['Upload a profile photo.'] })

    const uploaded = await uploadStoredProfilePhoto(skfId, photo)
    const updated = await updateAthleteLive(athlete.id, {
      ...athlete,
      photoUrl: uploaded.photoUrl,
    })
    if (!updated) throw new NotFoundError('Student')

    revalidateAthleteSitePaths(updated.skfId)
    revalidatePortalSitePaths()

    return json({
      success: true,
      data: {
        skfId: updated.skfId,
        photoUrl: updated.photoUrl,
        storagePath: uploaded.path,
      },
    })
  } catch (error) {
    if (error instanceof ApiError) {
      logger.info('feetrack.profile_photo_upload_rejected', {
        skfId,
        status: error.status,
        error,
        systemAlert: false,
      })

      return json({
        success: false,
        error: error.message,
        details: error.details,
      }, error.status)
    }

    if (error instanceof AppError) {
      const payload = {
        skfId,
        code: error.code,
        status: error.statusCode,
        details: error.expose ? error.details : undefined,
        error,
      }

      if (error.statusCode >= 500) {
        logger.error('feetrack.profile_photo_upload_failed', payload)
      } else {
        logger.info('feetrack.profile_photo_upload_rejected', { ...payload, systemAlert: false })
      }

      return json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.expose ? error.details : undefined,
      }, error.statusCode)
    }

    logger.error('feetrack.profile_photo_upload_failed', { skfId, error })

    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Profile photo upload failed.',
    }, 500)
  }
}
