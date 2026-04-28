import Razorpay from 'razorpay'

import type { ShopCheckoutInput } from '@/src/server/api/validators/shop.validator'
import { requireEnv } from '@/src/server/config/env'

let razorpayClient: Razorpay | null = null

function getRazorpayClient() {
  if (razorpayClient) {
    return razorpayClient
  }

  razorpayClient = new Razorpay({
    key_id: requireEnv('RAZORPAY_KEY_ID'),
    key_secret: requireEnv('RAZORPAY_KEY_SECRET'),
  })

  return razorpayClient
}

export class ShopCheckoutService {
  static async createOrder(input: ShopCheckoutInput) {
    const client = getRazorpayClient()
    const order = await client.orders.create({
      amount: Math.round(input.amount * 100),
      currency: 'INR',
      receipt: `shop_rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    })

    return {
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      key: requireEnv('RAZORPAY_KEY_ID'),
    }
  }
}
