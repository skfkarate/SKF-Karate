import crypto from 'crypto'
import { disabledResponse, isPaymentsEnabled } from '@/lib/server/feature-flags'
import { markFeeAsPaid } from '@/lib/server/repositories/fee-records'
import { razorpayWebhookSchema } from '@/src/server/api/validators/shop.validator'
import { withRoute } from '@/src/server/lib/route'

export const POST = withRoute(
  { rateLimit: { tier: 'write' } },
  async ({ request }) => {
  if (!isPaymentsEnabled()) {
    return disabledResponse('Payments', 503)
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!webhookSecret) {
    return Response.json({ error: 'Webhook is not configured' }, { status: 503 })
  }

  const body = await request.text()
  const signature = request.headers.get('x-razorpay-signature') || ''
    
  // ALWAYS verify signature first
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(body)
    .digest('hex')
    
  if (
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
  ) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }
    
  const event = razorpayWebhookSchema.parse(JSON.parse(body))
  if (event.event === 'payment.captured' && event.payload?.payment?.entity) {
    const { notes } = event.payload.payment.entity
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const rawMonth = String(notes.month || '').trim()
    const parsedMonth = /^\d+$/.test(rawMonth)
      ? Number(rawMonth)
      : months.findIndex((month) => month.toLowerCase() === rawMonth.toLowerCase() || month.slice(0, 3).toLowerCase() === rawMonth.slice(0, 3).toLowerCase()) + 1
    const monthNumber = String(parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth : 1).padStart(2, '0')
    const receiptId = `SKF-FEE-${notes.year}-${monthNumber}-MON-${String(notes.skfId || '').trim().toUpperCase()}`
    await markFeeAsPaid(notes.skfId, notes.month, receiptId, event.payload.payment.entity.id)
  }
  return Response.json({ received: true })
  }
)
