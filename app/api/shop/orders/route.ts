import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createShopOrder } from '@/lib/server/sheets'
import { redeemPoints } from '@/lib/points/pointsService'

export async function POST(request: Request) {
    try {
        const payload = await request.json()
        const { 
            paymentBypass,
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

        // Verify Razorpay signature ONLY if not bypassing
        if (!paymentBypass) {
            const secret = process.env.RAZORPAY_KEY_SECRET || ''
            const hmac = crypto.createHmac('sha256', secret)
            hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`)
            const generatedSignature = hmac.digest('hex')

            if (generatedSignature !== razorpay_signature) {
                return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
            }
        }

        // Write to Sheets / Database
        const orderId = `SHOP-${Date.now().toString().slice(-6)}`
        const date = new Date().toISOString()
        
        // Determine overall intent
        const requiresInstructorApproval = items.some((item: any) => item.requiresApproval === true)
        let orderStatus = paymentBypass ? 'Processing (Payment Pending)' : 'Processing'
        if (requiresInstructorApproval) {
            orderStatus = 'Pending Instructor Approval'
        }

        await createShopOrder({
            orderId,
            skfId: skfId || 'GUEST',
            itemsJson: JSON.stringify(items),
            total,
            discount,
            pointsUsed: pointsUsed || 0,
            date,
            status: orderStatus,
            addressJson: JSON.stringify(address)
        })

        // Gamification Redemption (Deduct points if used natively)
        if (pointsUsed > 0 && skfId && skfId !== 'GUEST') {
            try {
                await redeemPoints(skfId, pointsUsed, 'SHOP_REDEMPTION', { orderId, bypass: paymentBypass })
            } catch (e) {
                console.error('Failed to redeem points during checkout:', e)
            }
        }

        return NextResponse.json({ success: true, orderId })
    } catch (e: any) {
        console.error('Shop order confirmation error:', e)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
