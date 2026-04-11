import crypto from 'crypto'
import { markFeeAsPaid } from '@/lib/server/sheets'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')!
    
    // ALWAYS verify signature first
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')
    
    if (signature !== expectedSignature) {
      return Response.json({ error: 'Invalid signature' }, { status: 400 })
    }
    
    const event = JSON.parse(body)
    if (event.event === 'payment.captured') {
      const { notes } = event.payload.payment.entity
      const receiptId = `RCP_${notes.skfId}_${notes.month}_${notes.year}`
      await markFeeAsPaid(notes.skfId, notes.month, receiptId, event.payload.payment.entity.id)
    }
    return Response.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
