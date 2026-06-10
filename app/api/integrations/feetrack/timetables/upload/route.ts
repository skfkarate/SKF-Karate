import type { Session } from 'next-auth'

import type { AuthUser } from '@/lib/server/auth/staff'
import { ApiError } from '@/lib/server/api'
import {
  createBranchTimetable,
  deleteBranchTimetable,
  getAllBranchTimetablesAdmin,
} from '@/lib/server/repositories/portal-content-live'
import { revalidatePortalSitePaths } from '@/lib/server/revalidation'
import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import { AppError, AuthenticationError, AuthorizationError, ValidationError } from '@/src/server/lib/errors'
import { logger } from '@/src/server/lib/logger'
import { timingSafeStringEqual } from '@/src/server/lib/security'
import { FeeOperationsService } from '@/src/server/services/fee-operations.service'

const TIMETABLE_BUCKET = 'branch-timetables'
const MAX_TIMETABLE_BODY_BYTES = 8 * 1024 * 1024
const TIMETABLE_WRITE_ROLES = new Set(['admin', 'instructor', 'fee_manager'])
const FEE_TRACK_ROLES = new Set(FeeOperationsService.roles)
const TIMETABLE_MIME_TYPES = new Map([
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/jpg', 'jpg'],
  ['image/webp', 'webp'],
])

type BranchTarget = {
  slug: string
  label: string
}

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

function branchTarget(value: unknown): BranchTarget {
  const key = normalizeKey(value)
  if (['mpsc', 'mp', 'mp sports club', 'm p sports club', 'mp sports'].includes(key)) {
    return {
      slug: 'mp-sports-club',
      label: 'M P Sports Club',
    }
  }

  if (['herohalli', 'hero'].includes(key)) {
    return {
      slug: 'herohalli',
      label: 'Herohalli',
    }
  }

  throw new ValidationError({ branch: ['Choose MPSC or Herohalli for timetable upload.'] })
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
  if (Number.isFinite(parsedLength) && parsedLength > MAX_TIMETABLE_BODY_BYTES) {
    throw new AppError(
      'REQUEST_TOO_LARGE',
      `Request body exceeds ${MAX_TIMETABLE_BODY_BYTES} bytes.`,
      413
    )
  }
}

function sessionFromStaff(staff: AuthUser): Session {
  if (!staff?.id || !staff.role) throw new AuthenticationError('FeeTrack staff session is required.')
  if (!FEE_TRACK_ROLES.has(staff.role)) {
    throw new AuthorizationError('This staff account cannot access FeeTrack.')
  }
  if (!TIMETABLE_WRITE_ROLES.has(staff.role)) {
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

function assertBranchScope(session: Session, branch: BranchTarget) {
  const scope = normalizeKey((session.user as { branchScope?: string } | undefined)?.branchScope || 'all')
  if (!scope || scope === 'all') return
  if (normalizeKey(branch.label) === scope || normalizeKey(branch.slug) === scope) return
  try {
    if (branchTarget(scope).slug === branch.slug) return
  } catch {
    // Unknown scope values fall through to the authorization error below.
  }

  throw new AuthorizationError('This branch is outside your FeeTrack scope.')
}

function monthLabel(value: FormDataEntryValue | null) {
  const raw = String(value || '').trim()
  if (raw) return raw
  return new Intl.DateTimeFormat('en-IN', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  }).format(new Date())
}

function imageExtension(file: File) {
  const extension = TIMETABLE_MIME_TYPES.get(file.type)
  if (!extension) {
    throw new ValidationError({ image: ['Timetable must be a JPG, PNG, or WebP image.'] })
  }
  return extension
}

async function ensureTimetableBucket() {
  if (!isSupabaseReady()) {
    throw new AppError(
      'EXTERNAL_SERVICE_ERROR',
      'Supabase storage is not configured for timetable uploads.',
      503
    )
  }

  const { data, error } = await supabaseAdmin.storage.getBucket(TIMETABLE_BUCKET)
  if (!error && data) return

  const { error: createError } = await supabaseAdmin.storage.createBucket(TIMETABLE_BUCKET, {
    public: true,
    allowedMimeTypes: [...TIMETABLE_MIME_TYPES.keys()].filter((mimeType) => mimeType !== 'image/jpg'),
    fileSizeLimit: MAX_TIMETABLE_BODY_BYTES,
  })

  if (createError && !String(createError.message || '').toLowerCase().includes('already exists')) {
    throw new AppError(
      'EXTERNAL_SERVICE_ERROR',
      createError.message || 'Unable to prepare timetable storage.',
      503
    )
  }
}

async function removeOldTimetableImages(branch: BranchTarget, currentPath: string) {
  const { data, error } = await supabaseAdmin.storage.from(TIMETABLE_BUCKET).list(branch.slug, {
    limit: 100,
  })
  if (error) {
    throw new AppError(
      'EXTERNAL_SERVICE_ERROR',
      error.message || 'Unable to inspect old timetable images.',
      503
    )
  }

  const oldPaths = (data || [])
    .filter((entry) => `${branch.slug}/${entry.name}` !== currentPath)
    .map((entry) => `${branch.slug}/${entry.name}`)

  if (!oldPaths.length) return

  const { error: removeError } = await supabaseAdmin.storage.from(TIMETABLE_BUCKET).remove(oldPaths)
  if (removeError) {
    throw new AppError(
      'EXTERNAL_SERVICE_ERROR',
      removeError.message || 'Unable to remove old timetable images.',
      503
    )
  }
}

async function replaceStoredTimetableImage(branch: BranchTarget, file: File) {
  if (!file || file.size === 0) {
    throw new ValidationError({ image: ['Upload a timetable image.'] })
  }
  if (file.size > MAX_TIMETABLE_BODY_BYTES) {
    throw new AppError(
      'REQUEST_TOO_LARGE',
      `Timetable image exceeds ${MAX_TIMETABLE_BODY_BYTES} bytes.`,
      413
    )
  }

  await ensureTimetableBucket()
  const extension = imageExtension(file)
  const storagePath = `${branch.slug}/current.${extension}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabaseAdmin.storage.from(TIMETABLE_BUCKET).upload(storagePath, buffer, {
    contentType: file.type,
    upsert: true,
  })
  if (error) {
    throw new AppError(
      'EXTERNAL_SERVICE_ERROR',
      error.message || 'Unable to upload timetable image.',
      503
    )
  }

  await removeOldTimetableImages(branch, storagePath)

  const { data } = supabaseAdmin.storage.from(TIMETABLE_BUCKET).getPublicUrl(storagePath)
  return `${data.publicUrl}?v=${Date.now()}`
}

async function replaceTimetableRecord(branch: BranchTarget, imageUrl: string, formData: FormData) {
  const timetables = await getAllBranchTimetablesAdmin()
  const existing = timetables.filter((entry) => entry.branchSlug === branch.slug)

  const created = await createBranchTimetable({
    branchSlug: branch.slug,
    title: String(formData.get('title') || `${branch.label} Timetable`).trim(),
    driveUrl: imageUrl,
    imageUrl,
    monthLabel: monthLabel(formData.get('monthLabel')),
    effectiveFrom: new Date().toISOString().slice(0, 10),
    effectiveTo: '',
    notes: String(formData.get('notes') || '').trim(),
    isActive: true,
  })

  for (const timetable of existing) {
    await deleteBranchTimetable(timetable.id)
  }

  return created
}

export async function POST(request: Request) {
  let branchLabel = 'unknown'

  try {
    assertApiKey(request)
    assertBodySize(request)

    const formData = await request.formData()
    const staffRaw = String(formData.get('staff') || '')
    const staff = staffRaw ? JSON.parse(staffRaw) as AuthUser : null
    const session = sessionFromStaff(staff!)
    const branch = branchTarget(formData.get('branch'))
    branchLabel = branch.label
    assertBranchScope(session, branch)

    const fileValue = formData.get('image')
    const image = fileValue instanceof File ? fileValue : null
    if (!image) throw new ValidationError({ image: ['Upload a timetable image.'] })

    const imageUrl = await replaceStoredTimetableImage(branch, image)
    const timetable = await replaceTimetableRecord(branch, imageUrl, formData)
    revalidatePortalSitePaths()

    return json({ success: true, data: { timetable } })
  } catch (error) {
    if (error instanceof ApiError) {
      logger.info('feetrack.timetable_upload_rejected', {
        branch: branchLabel,
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
        branch: branchLabel,
        code: error.code,
        status: error.statusCode,
        details: error.expose ? error.details : undefined,
        error,
      }

      if (error.statusCode >= 500) {
        logger.error('feetrack.timetable_upload_failed', payload)
      } else {
        logger.info('feetrack.timetable_upload_rejected', { ...payload, systemAlert: false })
      }

      return json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.expose ? error.details : undefined,
      }, error.statusCode)
    }

    logger.error('feetrack.timetable_upload_failed', { branch: branchLabel, error })

    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Timetable upload failed.',
    }, 500)
  }
}
