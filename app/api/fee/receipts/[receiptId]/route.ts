import React from 'react'
import { renderToStream } from '@react-pdf/renderer'

import { ReceiptDocument } from '@/lib/receipts/ReceiptDocument'
import { NotFoundError, ValidationError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'
import { FeeOperationsService } from '@/src/server/services/fee-operations.service'

export const runtime = 'nodejs'

function formatFilename(input: string) {
  return input
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export const GET = withRoute(
  {
    auth: { type: 'admin', roles: FeeOperationsService.roles },
    rateLimit: { tier: 'authed' },
    cacheControl: 'private, no-store',
  },
  async ({ request, params, adminSession }) => {
    const receiptId = String(params.receiptId || '').trim()
    if (!receiptId) {
      throw new ValidationError({ receiptId: ['Receipt ID is required.'] })
    }

    const data = await FeeOperationsService.getReceiptDataForAdmin(adminSession!, receiptId)
    if (!data) {
      throw new NotFoundError('Receipt')
    }

    const mode = new URL(request.url).searchParams.get('mode') === 'download' ? 'download' : 'preview'
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
    const disposition = mode === 'download' ? 'attachment' : 'inline'

    return new Response(stream as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `${disposition}; filename="${fileId || data.receiptId}.pdf"`,
        'Cache-Control': data.source === 'snapshot' ? 'private, max-age=86400, immutable' : 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  }
)
