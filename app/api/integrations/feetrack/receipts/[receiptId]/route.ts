import React from 'react'
import type { Session } from 'next-auth'
import { renderToStream } from '@react-pdf/renderer'

import { ReceiptDocument } from '@/lib/receipts/ReceiptDocument'
import type { AuthUser } from '@/lib/server/auth/staff'
import { AppError, AuthenticationError, AuthorizationError, NotFoundError, ValidationError } from '@/src/server/lib/errors'
import { logger } from '@/src/server/lib/logger'
import { timingSafeStringEqual } from '@/src/server/lib/security'
import { FeeOperationsService } from '@/src/server/services/fee-operations.service'

type FeeTrackSession = Session & {
  user: Session['user'] & {
    id: string
    name: string
    role: string
    branchScope?: string
  }
}

function assertApiKey(request: Request) {
  const expected = process.env.FEETRACK_API_KEY
  if (!expected) {
    throw new AppError(
      'FEETRACK_NOT_CONFIGURED',
      'FeeTrack integration API key is not configured.',
      503
    )
  }

  if (!timingSafeStringEqual(request.headers.get('x-feetrack-api-key') || '', expected)) {
    throw new AuthenticationError('Invalid FeeTrack integration key.')
  }
}

function readStaff(request: Request): AuthUser {
  const encoded = request.headers.get('x-feetrack-staff')
  if (!encoded) throw new AuthenticationError('FeeTrack staff session is required.')

  try {
    const json = Buffer.from(encoded, 'base64url').toString('utf8')
    const staff = JSON.parse(json) as AuthUser
    if (!staff.id || !staff.role) throw new Error('Invalid staff')
    if (!FeeOperationsService.roles.includes(staff.role)) {
      throw new AuthorizationError('This staff account cannot access FeeTrack receipts.')
    }
    return staff
  } catch (error) {
    if (error instanceof AppError) throw error
    throw new AuthenticationError('Invalid FeeTrack staff session.')
  }
}

function sessionFromStaff(staff: AuthUser): FeeTrackSession {
  return {
    expires: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    user: {
      id: staff.id,
      name: staff.name || staff.id,
      role: staff.role,
      branchScope: staff.branchScope || 'all',
    },
  } as FeeTrackSession
}

function formatFilename(input: string) {
  return input
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function jsonError(error: unknown) {
  logger.error('feetrack.receipt_failed', { error })
  if (error instanceof AppError) {
    return Response.json(
      { success: false, error: error.message, code: error.code },
      { status: error.statusCode }
    )
  }

  return Response.json(
    { success: false, error: 'FeeTrack receipt request failed.' },
    { status: 500 }
  )
}

export async function GET(
  request: Request,
  context: { params: Promise<{ receiptId: string }> | { receiptId: string } }
) {
  try {
    assertApiKey(request)
    const staff = readStaff(request)
    const params = await Promise.resolve(context.params)
    const receiptId = String(params.receiptId || '').trim()
    if (!receiptId) {
      throw new ValidationError({ receiptId: ['Receipt ID is required.'] })
    }

    const data = await FeeOperationsService.getReceiptDataForAdmin(sessionFromStaff(staff), receiptId)
    if (!data) throw new NotFoundError('Receipt')

    const receiptDocument = React.createElement(ReceiptDocument, {
      receiptId: data.receiptId,
      studentName: data.athleteName,
      skfId: data.skfId,
      branch: data.branch,
      feeType: data.feeType,
      month: data.month,
      year: data.year,
      amount: data.amount,
      paidDate: data.paidDate,
      paymentMethod: data.paymentMethod,
      dojoAddress: data.dojoAddress,
      verifiedBy: data.verifiedBy,
      verifiedAt: data.verifiedAt,
      issuedAt: data.issuedAt,
      themeId: (data.themeId === 'skf_minimal' || data.themeId === 'skf_classic' || data.themeId === 'skf_iconic') ? data.themeId : 'skf_iconic',
    }) as unknown as Parameters<typeof renderToStream>[0]
    const stream = await renderToStream(receiptDocument)
    const fileId = formatFilename(`${data.athleteName}_${data.month}_${data.year}_${data.receiptId}`)

    return new Response(stream as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${fileId || data.receiptId}.pdf"`,
        'Cache-Control': data.source === 'snapshot' ? 'private, max-age=86400, immutable' : 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch (error) {
    return jsonError(error)
  }
}
