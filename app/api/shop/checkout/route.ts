import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder'
})

export async function POST(request: Request) {
    try {
        const { amount } = await request.json()

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
        }

        const options = {
            amount: Math.round(amount * 100), // convert to paise
            currency: 'INR',
            receipt: `shop_rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`
        }

        const order = await razorpay.orders.create(options)

        return NextResponse.json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
            key: process.env.RAZORPAY_KEY_ID
        })

    } catch (e: any) {
        console.error('Shop checkout Razorpay error:', e)
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }
}
