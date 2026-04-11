import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { submitSummerCampEnrollment, decrementSummerCampSlots } from '@/lib/server/sheets'

export async function POST(request: Request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      studentName, 
      skfId, 
      branch, 
      tier, 
      amount 
    } = await request.json()

    // If not a free order, verify the Razorpay signature
    if (razorpay_order_id && !razorpay_order_id.startsWith('FREE_ORDER_')) {
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      hmac.update(razorpay_order_id + '|' + razorpay_payment_id)
      const expectedSignature = hmac.digest('hex')

      if (expectedSignature !== razorpay_signature) {
        return NextResponse.json({ success: false, error: 'Payment signature verification failed' }, { status: 400 })
      }
    }

    // Verification passed, write to google sheets
    const timestamp = new Date().toISOString()
    const row = [
      branch,
      studentName,
      skfId || 'NEW',
      tier,
      amount.toString(),
      timestamp,
      razorpay_payment_id || 'FREE'
    ]

    await submitSummerCampEnrollment(row)
    await decrementSummerCampSlots(branch)

    // Optionally: Send confirmation email using Resend
    // Implementation placeholder for later if Resend fully configured
    // try {
    //    await resend.emails.send({ ... })
    // } catch(e) {}

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Camp verify error:', error)
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 })
  }
}
