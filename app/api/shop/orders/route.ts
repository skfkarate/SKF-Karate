import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createShopOrder } from '@/lib/server/sheets'
import { redeemPoints } from '@/lib/points/pointsService'

export async function POST(request: Request) {
    try {
        const payload = await request.json()
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature, 
            skfId,
            items,
            total,
            discount,
            pointsUsed,
            address
        } = payload

        // Verify Razorpay signature
        const secret = process.env.RAZORPAY_KEY_SECRET || ''
        const hmac = crypto.createHmac('sha256', secret)
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
        const generatedSignature = hmac.digest('hex')

        if (generatedSignature !== razorpay_signature) {
            return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
        }

        // Write to Sheets
        const orderId = `SHOP-${Date.now().toString().slice(-6)}`
        const date = new Date().toISOString()
        
        await createShopOrder({
            orderId,
            skfId: skfId || 'GUEST',
            itemsJson: JSON.stringify(items),
            total,
            discount,
            pointsUsed,
            date,
            status: 'Processing',
            addressJson: JSON.stringify(address)
        })

        // Gamification Redemption
        if (pointsUsed > 0 && skfId) {
            try {
                await redeemPoints(skfId, pointsUsed, 'SHOP_REDEMPTION', { orderId, razorpayId: razorpay_payment_id })
            } catch (e) {
                console.error('Failed to redeem points during checkout:', e)
            }
        }

        // Ideally send Email via Resend here 
        // const { sendEmail } = await import('@/lib/email')
        // await sendEmail(address.email, `Order Confirmation ${orderId}`)

        return NextResponse.json({ success: true, orderId })
    } catch (e: any) {
        console.error('Shop order confirmation error:', e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
