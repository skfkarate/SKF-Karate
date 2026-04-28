import React from 'react'
import { renderToStream } from '@react-pdf/renderer'

import { ReceiptDocument } from '@/lib/receipts/ReceiptDocument'
import { NotFoundError, ValidationError } from '@/src/server/lib/errors'
import { withRoute } from '@/src/server/lib/route'
import { FeeLedgerService } from '@/src/server/services/fee-ledger.service'

export const runtime = 'nodejs'

function formatFilename(input: string) {
  return input
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export const GET = withRoute(
  {
    auth: { type: 'portal', roles: ['student'] },
    rateLimit: { tier: 'authed' },
    cacheControl: 'private, no-store',
  },
  async ({ params, portalSession }) => {
    const receiptId = String(params.receiptId || '').trim()
    if (!receiptId) {
      throw new ValidationError({ receiptId: ['Receipt ID is required.'] })
    }

    const data = await FeeLedgerService.getReceiptData(portalSession!.skfId!, receiptId)

    if (!data) {
      throw new NotFoundError('Receipt')
    }

    const stream = await renderToStream(
      <ReceiptDocument
        receiptId={data.receiptId}
        studentName={data.athleteName}
        skfId={data.skfId}
        branch={data.branch}
        month={data.month}
        year={data.year}
        amount={data.amount}
        paidDate={data.paidDate}
        paymentMethod={data.paymentMethod}
        dojoAddress={data.dojoAddress}
      />
    )

    const fileId = formatFilename(`${data.athleteName}_${data.month}_${data.year}_${data.receiptId}`)

    return new Response(stream as unknown as ReadableStream<Uint8Array>, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileId || data.receiptId}.pdf"`,
        'Cache-Control': 'private, no-store',
      },
    })
  }
)
