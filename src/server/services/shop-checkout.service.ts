import Razorpay from 'razorpay'

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

function buildShopReceiptId() {
  const now = new Date()
  const stamp = now.toISOString().replace(/[-:TZ.]/g, '').slice(0, 17)
  return `SKF-SHOP-${stamp}`
}

export class ShopCheckoutService {
  static async createOrder(input: { amount: number; receipt?: string; notes?: Record<string, string> }) {
    const client = getRazorpayClient()
    const order = await client.orders.create({
      amount: Math.round(input.amount * 100),
      currency: 'INR',
      receipt: input.receipt || buildShopReceiptId(),
      notes: input.notes,
    })

    return {
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      key: requireEnv('RAZORPAY_KEY_ID'),
    }
  }
}
