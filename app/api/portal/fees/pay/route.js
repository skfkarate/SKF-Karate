import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

// Gracefully handle missing Razorpay credentials during local staging
const razorpay = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null

export async function POST(request) {
  try {
    // 1. Authenticate Student Session
    /*
    const sessionUrlToken = getPortalSession(request)
    if (!sessionUrlToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    */

    const body = await request.json()
    const { amount, currency = 'INR', receipt_id, notes = {} } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid Payment Amount' }, { status: 400 })
    }

    if (!razorpay) {
      console.warn('[API] Razorpay not configured. Returning mock order.')
      return NextResponse.json({
        id: `order_mock_${Date.now()}`,
        amount,
        currency,
        mock: true
      })
    }

    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise (smallest currency unit)
      currency,
      receipt: receipt_id || `rcpt_${Date.now()}`,
      notes,
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json(order)
  } catch (error) {
    console.error('[API] Razorpay order creation failed:', error)
    return NextResponse.json({ error: 'Failed to initialize payment gateway' }, { status: 500 })
  }
}
