import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { markFeeAsPaid } from '@/lib/server/sheets'

// Webhook payload handler for Razorpay
export async function POST(request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!signature || !secret) {
        console.warn('[Webhook] Missing webhook secret or signature header.')
        return NextResponse.json({ error: 'Webhook Secret configuration missing.' }, { status: 400 })
    }

    // 1. Verify Razorpay Signature
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    if (expectedSignature !== signature) {
      console.error('[Webhook] Invalid signature received.')
      return NextResponse.json({ error: 'Invalid Signature' }, { status: 400 })
    }

    // 2. Parse Event Payload
    const payload = JSON.parse(rawBody)

    // Handle payment capture
    if (payload.event === 'payment.captured') {
        const payment = payload.payload.payment.entity
        const skfId = payment.notes?.skfId
        const month = payment.notes?.month

        if (skfId && month) {
            console.info(`[Webhook] Payment Captured: SKF ID: ${skfId}, Month: ${month}, Amount: ${payment.amount / 100}`)
            // 3. Mark in DB/Sheets as Paid
            await markFeeAsPaid(skfId, month, payment.id)
        }
    }

    // We must return 200 OK extremely quickly to acknowledge Razorpay
    return NextResponse.json({ status: 'ok' })

  } catch (error) {
    console.error('[API Webhook] Error processing webhook:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
