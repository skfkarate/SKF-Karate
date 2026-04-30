import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { ApiError, readJsonBody } from '@/lib/server/api'
import { disabledResponse, isPaymentsEnabled } from '@/lib/server/feature-flags'
import { shopCheckoutCreateOrderSchema } from '@/src/server/api/validators/shop.validator'
import { withRoute } from '@/src/server/lib/route'

export const POST = withRoute(
  { rateLimit: { tier: 'write' } },
  async ({ request }) => {
    if (!isPaymentsEnabled()) {
      return disabledResponse('Payments', 503)
    }

    const { amount } = shopCheckoutCreateOrderSchema.parse(await readJsonBody(request))
    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret) {
      throw new ApiError(503, 'Payment gateway is not configured.')
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: `shop_rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      key: keyId,
    })
  }
)
