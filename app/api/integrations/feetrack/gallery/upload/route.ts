import type { Session } from 'next-auth'
import { revalidatePath } from 'next/cache'

import type { AuthUser } from '@/lib/server/auth/staff'
import { ApiError } from '@/lib/server/api'
import {
  createGalleryPhoto,
  GALLERY_BUCKET,
  getGalleryPhotoByIdAdmin,
  removeGalleryStoragePath,
  updateGalleryPhoto,
} from '@/lib/server/repositories/gallery-live'
import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import { AppError, AuthenticationError, AuthorizationError, ValidationError } from '@/src/server/lib/errors'
import { logger } from '@/src/server/lib/logger'
import { timingSafeStringEqual } from '@/src/server/lib/security'
import { FeeOperationsService } from '@/src/server/services/fee-operations.service'

const MAX_GALLERY_PHOTO_BODY_BYTES = 8 * 1024 * 1024
const GALLERY_WRITE_ROLES = new Set(['admin', 'instructor', 'fee_manager'])
const FEE_TRACK_ROLES = new Set(FeeOperationsService.roles)
const GALLERY_MIME_TYPES = new Map([
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
  if (Number.isFinite(parsedLength) && parsedLength > MAX_GALLERY_PHOTO_BODY_BYTES) {
    throw new AppError(
      'REQUEST_TOO_LARGE',
      `Request body exceeds ${MAX_GALLERY_PHOTO_BODY_BYTES} bytes.`,
      413
    )
  }
}

function sessionFromStaff(staff: AuthUser): Session {
  if (!staff?.id || !staff.role) throw new AuthenticationError('FeeTrack staff session is required.')
  if (!FEE_TRACK_ROLES.has(staff.role)) {
    throw new AuthorizationError('This staff account cannot access FeeTrack.')
  }
  if (!GALLERY_WRITE_ROLES.has(staff.role)) {
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

function slugify(value: unknown) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function safeFilename(value: unknown) {
  return slugify(value).slice(0, 80) || 'gallery-photo'
}

function imageExtension(file: File) {
  const extension = GALLERY_MIME_TYPES.get(file.type)
  if (!extension) {
    throw new ValidationError({ photo: ['Gallery photo must be a JPG, PNG, or WebP image.'] })
  }
  return extension
}

async function ensureGalleryBucket() {
  if (!isSupabaseReady()) {
    throw new AppError(
      'EXTERNAL_SERVICE_ERROR',
      'Supabase storage is not configured for gallery uploads.',
      503
    )
  }

  const { data, error } = await supabaseAdmin.storage.getBucket(GALLERY_BUCKET)
  if (!error && data) return

  const { error: createError } = await supabaseAdmin.storage.createBucket(GALLERY_BUCKET, {
    public: true,
    allowedMimeTypes: [...GALLERY_MIME_TYPES.keys()].filter((mimeType) => mimeType !== 'image/jpg'),
    fileSizeLimit: MAX_GALLERY_PHOTO_BODY_BYTES,
  })

  if (createError && !String(createError.message || '').toLowerCase().includes('already exists')) {
    throw new AppError(
      'EXTERNAL_SERVICE_ERROR',
      createError.message || 'Unable to prepare gallery photo storage.',
      503
    )
  }
}

async function uploadStoredGalleryPhoto(file: File, category: string, title: string) {
  if (!file || file.size === 0) {
    throw new ValidationError({ photo: ['Upload a gallery photo.'] })
  }
  if (file.size > MAX_GALLERY_PHOTO_BODY_BYTES) {
    throw new AppError(
      'REQUEST_TOO_LARGE',
      `Gallery photo exceeds ${MAX_GALLERY_PHOTO_BODY_BYTES} bytes.`,
      413
    )
  }

  await ensureGalleryBucket()
  const extension = imageExtension(file)
  const storagePath = `${safeFilename(category)}/${Date.now()}-${safeFilename(title)}.${extension}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabaseAdmin.storage.from(GALLERY_BUCKET).upload(storagePath, buffer, {
    contentType: file.type,
    upsert: false,
  })
  if (error) {
    throw new AppError(
      'EXTERNAL_SERVICE_ERROR',
      error.message || 'Unable to upload gallery photo.',
      503
    )
  }

  const { data } = supabaseAdmin.storage.from(GALLERY_BUCKET).getPublicUrl(storagePath)
  return {
    storagePath,
    src: `${data.publicUrl}?v=${Date.now()}`,
  }
}

export async function POST(request: Request) {
  try {
    assertApiKey(request)
    assertBodySize(request)

    const formData = await request.formData()
    const staffRaw = String(formData.get('staff') || '')
    const staff = staffRaw ? JSON.parse(staffRaw) as AuthUser : null
    sessionFromStaff(staff!)

    const photoId = String(formData.get('photoId') || formData.get('id') || '').trim()
    const title = String(formData.get('title') || '').trim()
    const category = String(formData.get('category') || formData.get('cat') || 'In Dojo').trim()
    const eventId = String(formData.get('eventId') || formData.get('event_id') || '').trim()
    const eventDate = String(formData.get('eventDate') || formData.get('event_date') || '').trim()
    const fileValue = formData.get('photo')
    const photo = fileValue instanceof File ? fileValue : null

    if (!title) throw new ValidationError({ title: ['Photo title is required.'] })
    if (!photo) throw new ValidationError({ photo: ['Upload a gallery photo.'] })

    const existing = photoId ? await getGalleryPhotoByIdAdmin(photoId) : null
    const uploaded = await uploadStoredGalleryPhoto(photo, category, title)

    const payload = {
      title,
      category,
      src: uploaded.src,
      storagePath: uploaded.storagePath,
      pinned: String(formData.get('pinned') || 'false') === 'true',
      isPublished: String(formData.get('isPublished') || 'true') !== 'false',
      sortOrder: Number(formData.get('sortOrder') || 0),
      eventId,
      eventDate,
    }

    const galleryPhoto = photoId
      ? await updateGalleryPhoto(photoId, payload)
      : await createGalleryPhoto(payload)

    if (existing?.storagePath && existing.storagePath !== galleryPhoto.storagePath) {
      await removeGalleryStoragePath(existing.storagePath)
    }

    revalidatePath('/gallery')
    return json({ success: true, data: { photo: galleryPhoto } })
  } catch (error) {
    logger.warn('feetrack.gallery_upload_failed', { error })

    if (error instanceof AppError) {
      return json(
        {
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
        },
        error.statusCode
      )
    }

    if (error instanceof ApiError) {
      return json({ success: false, error: error.message, details: error.details }, error.status)
    }

    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Gallery photo upload failed.',
      },
      500
    )
  }
}
