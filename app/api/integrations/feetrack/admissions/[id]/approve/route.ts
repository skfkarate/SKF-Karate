import type { Session } from 'next-auth'
import { ZodError } from 'zod'

import { admissionApprovalFieldsSchema } from '@/src/server/api/validators/admission.validator'
import { AppError, AuthenticationError, AuthorizationError } from '@/src/server/lib/errors'
import { logger } from '@/src/server/lib/logger'
import { timingSafeStringEqual } from '@/src/server/lib/security'
import { AdmissionService } from '@/src/server/services/admission.service'
import { FeeOperationsService } from '@/src/server/services/fee-operations.service'
import type { AuthUser } from '@/lib/server/auth/options'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const FEE_TRACK_ROLES = new Set(FeeOperationsService.roles)
const MAX_APPROVAL_BODY_BYTES = 10 * 1024 * 1024

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

function sessionFromStaff(staff: AuthUser): Session {
  if (!staff?.id || !staff.role) throw new AuthenticationError('FeeTrack staff session is required.')
  if (!FEE_TRACK_ROLES.has(staff.role)) {
    throw new AuthorizationError('This staff account cannot approve admissions.')
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

function readBoolean(value: FormDataEntryValue | null, fallback = false) {
  if (value === null) return fallback
  return ['true', '1', 'on', 'yes'].includes(String(value).toLowerCase())
}

function assertBodySize(request: Request) {
  const contentLength = request.headers.get('content-length')
  if (!contentLength) return

  const parsedLength = Number(contentLength)
  if (Number.isFinite(parsedLength) && parsedLength > MAX_APPROVAL_BODY_BYTES) {
    throw new AppError(
      'REQUEST_TOO_LARGE',
      `Request body exceeds ${MAX_APPROVAL_BODY_BYTES} bytes.`,
      413
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let applicationId = 'unknown'

  try {
    assertApiKey(request)
    assertBodySize(request)
    const { id } = await params
    applicationId = id
    const formData = await request.formData()
    const staffRaw = String(formData.get('staff') || '')
    const staff = staffRaw ? JSON.parse(staffRaw) as AuthUser : null
    const session = sessionFromStaff(staff!)
    const finalPhotoValue = formData.get('finalPhoto')
    const finalPhoto = finalPhotoValue instanceof File ? finalPhotoValue : null

    const fields = admissionApprovalFieldsSchema.parse({
      applicationId: id,
      monthlyFee: formData.get('monthlyFee'),
      admissionFee: formData.get('admissionFee'),
      dressFee: formData.get('dressFee'),
      dressCost: formData.get('dressCost'),
      billingStartDate: formData.get('billingStartDate'),
      batch: formData.get('batch'),
      belt: formData.get('belt') || 'white',
      isPublic: readBoolean(formData.get('isPublic'), true),
      paymentVerified: readBoolean(formData.get('paymentVerified'), false),
      photoAction: formData.get('photoAction') || 'upload_new',
      reviewNote: formData.get('reviewNote'),
    })

    const result = await AdmissionService.approveApplication(session, fields, finalPhoto)
    return json({ success: true, data: result })
  } catch (error) {
    if (error instanceof AppError) {
      const payload = {
        applicationId,
        code: error.code,
        status: error.statusCode,
        details: error.expose ? error.details : undefined,
        error,
      }

      if (error.statusCode >= 500) {
        logger.error('feetrack.admission_approval_failed', payload)
      } else {
        logger.info('feetrack.admission_approval_rejected', { ...payload, systemAlert: false })
      }

      return json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.expose ? error.details : undefined,
      }, error.statusCode)
    }

    if (error instanceof ZodError) {
      const details = error.flatten().fieldErrors
      logger.info('feetrack.admission_approval_rejected', {
        applicationId,
        code: 'VALIDATION_ERROR',
        status: 400,
        details,
        error,
        systemAlert: false,
      })

      return json({
        success: false,
        error: 'Invalid approval data.',
        code: 'VALIDATION_ERROR',
        details,
      }, 400)
    }

    logger.error('feetrack.admission_approval_failed', { applicationId, error })

    return json({
      success: false,
      error: error instanceof Error ? error.message : 'Admission approval failed.',
    }, 500)
  }
}
