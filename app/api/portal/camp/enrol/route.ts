import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { getSummerCampByBranch } from '@/lib/server/sheets'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder'
})

export async function POST(request: Request) {
  try {
    const { branch, tier } = await request.json()

    if (!branch || !tier) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const campData = await getSummerCampByBranch(branch)
    if (!campData || !campData.registrationOpen || campData.availableSlots <= 0) {
      return NextResponse.json({ error: 'Registration is closed or full for this branch' }, { status: 400 })
    }

    let amount = 0;
    if (tier === 'Month 1') amount = campData.priceMonth1;
    else if (tier === 'Month 2') amount = campData.priceMonth2;
    else if (tier === 'Full Camp') amount = campData.priceFull;
    else return NextResponse.json({ error: 'Invalid tier selection' }, { status: 400 })

    if (amount === 0) {
      // Free checkout logic, bypass Razorpay and simulate a zero-cost order
      return NextResponse.json({ orderId: 'FREE_ORDER_' + Date.now(), amount: 0, key: null })
    }

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay works in paise
      currency: 'INR',
      receipt: `camp_${branch.replace(/\s+/g, '')}_${Date.now()}`
    })

    return NextResponse.json({
      orderId: order.id,
      amount: amount,
      key: process.env.RAZORPAY_KEY_ID
    })

  } catch (error) {
    console.error('Camp enrol error:', error)
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 })
  }
}
