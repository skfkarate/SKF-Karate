import React from 'react'
import { renderToFile } from '@react-pdf/renderer'
import { ReceiptDocument } from './lib/receipts/ReceiptDocument'

async function run() {
  try {
    const doc = React.createElement(ReceiptDocument, {
      receiptId: 'RECP-123',
      studentName: 'John Doe',
      skfId: 'SKF-123',
      branch: 'Test Branch',
      feeType: 'monthly',
      month: 'June',
      year: 2026,
      amount: 1000,
      paidDate: new Date().toISOString(),
      paymentMethod: 'cash',
      dojoAddress: '123 Test St',
      issuedAt: new Date().toISOString()
    }) as Parameters<typeof renderToFile>[0]
    
    await renderToFile(doc, 'test.pdf')
    console.info("PDF rendered successfully!")
  } catch (err) {
    console.error("PDF Render Error:", err)
  }
}

run()
