import React from 'react'
import { renderToStream } from '@react-pdf/renderer'
import { describe, expect, it } from 'vitest'
import { ReceiptDocument } from '@/lib/receipts/ReceiptDocument'

describe('Receipt PDF Rendering', () => {
  it('renders the ReceiptDocument with skf_iconic theme to a stream without throwing', async () => {
    const doc = React.createElement(ReceiptDocument, {
      receiptId: 'SKF-FEE-2026-02-MON-SKF21HE001',
      studentName: 'Krishna Prasad',
      skfId: 'SKF21HE001',
      branch: 'Herohalli',
      feeType: 'Monthly Training Fee',
      month: 'February',
      year: 2026,
      amount: 1500,
      paidDate: '2026-02-15T10:00:00.000Z',
      paymentMethod: 'UPI • Transaction 123456',
      dojoAddress: 'SKF Karate, Herohalli, Bengaluru',
      verifiedBy: 'Sensei Admin',
      verifiedAt: '2026-02-15T11:00:00.000Z',
      issuedAt: '2026-02-15T11:00:00.000Z',
      themeId: 'skf_iconic',
    })

    const stream = await renderToStream(doc as unknown as Parameters<typeof renderToStream>[0])
    expect(stream).toBeDefined()
  })
})
