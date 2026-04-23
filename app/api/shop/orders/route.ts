import crypto from 'crypto'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

import { redeemPoints } from '@/lib/points/pointsService'
import { buildPreparedShopOrder } from '@/lib/shop/logic'
import type { ShopCheckoutActor, ShopOrderAddress } from '@/lib/shop/types'
import { COOKIE_NAME, verifyStudentJWT } from '@/lib/server/auth/student'
import { ApiError, createErrorResponse, readJsonBody } from '@/lib/server/api'
import { getAthleteByRegistrationNumberLive } from '@/lib/server/repositories/athletes-live'
import { getProducts, placeShopOrder } from '@/lib/server/repositories/shop'
import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'

export async function POST(request: Request) {
  try {
    const payload = await readJsonBody(request)
    const actor = await getShopActor()

    verifyPaymentSignature(payload)

    const products = await getProducts()
    const availablePoints =
      actor.authenticated && actor.skfId
        ? await getAvailablePointsBalance(actor.skfId)
        : 0

    let preparedOrder
    try {
      preparedOrder = buildPreparedShopOrder({
        catalog: products,
        items: Array.isArray(payload?.items) ? payload.items : [],
        actor,
        availablePoints,
        requestedPoints: Number(payload?.pointsUsed || 0),
        promoCode: payload?.promoCode,
        paymentBypass: Boolean(payload?.paymentBypass),
      })
    } catch (error) {
      throw new ApiError(
        400,
        error instanceof Error ? error.message : 'Invalid cart payload.'
      )
    }

    const address = actor.authenticated
      ? createPickupAddress(actor)
      : validateGuestAddress(payload?.address)

    const orderId = createOrderId()

    let order
    try {
      order = await placeShopOrder({
        orderId,
        actor,
        customerName: address.fullName,
        customerPhone: address.phone || null,
        customerType: actor.authenticated ? 'athlete' : 'guest',
        items: preparedOrder.items,
        subtotal: preparedOrder.subtotal,
        shippingFee: preparedOrder.shippingFee,
        total: preparedOrder.total,
        discount: preparedOrder.discount,
        pointsUsed: preparedOrder.pointsUsed,
        promoCode: preparedOrder.promoCode,
        status: preparedOrder.status,
        fulfillmentMethod: actor.authenticated ? 'dojo-pickup' : 'shipping',
        address,
      })
    } catch (error) {
      throw new ApiError(
        409,
        error instanceof Error
          ? error.message
          : 'Unable to place the order right now.'
      )
    }

    if (preparedOrder.pointsUsed > 0 && actor.skfId) {
      try {
        await redeemPoints(actor.skfId, preparedOrder.pointsUsed, 'SHOP_REDEMPTION', {
          orderId,
          bypass: Boolean(payload?.paymentBypass),
        })
      } catch (error) {
        console.error('[Shop/Order] Failed to redeem points after order placement:', error)
      }
    }

    revalidatePath('/admin/shop')
    revalidatePath('/admin/shop/products')
    revalidatePath('/shop')
    revalidatePath('/shop/orders')
    for (const productId of new Set(preparedOrder.items.map((item) => item.productId))) {
      revalidatePath(`/shop/${productId}`)
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      order,
      customerType: order.customerType,
    })
  } catch (error) {
    return createErrorResponse(error, 'Unable to place the order.')
  }
}

function verifyPaymentSignature(payload: any) {
  if (payload?.paymentBypass) {
    return
  }

  const orderId = String(payload?.razorpay_order_id || '')
  const paymentId = String(payload?.razorpay_payment_id || '')
  const signature = String(payload?.razorpay_signature || '')
  const secret = process.env.RAZORPAY_KEY_SECRET || ''

  if (!orderId || !paymentId || !signature || !secret) {
    throw new ApiError(400, 'Payment verification data is incomplete.')
  }

  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(`${orderId}|${paymentId}`)
  const generatedSignature = hmac.digest('hex')

  if (generatedSignature !== signature) {
    throw new ApiError(400, 'Payment verification failed.')
  }
}

async function getShopActor(): Promise<ShopCheckoutActor> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) {
    return { authenticated: false }
  }

  const session = verifyStudentJWT(token)
  if (!session?.skfId) {
    return { authenticated: false }
  }

  const athlete = await getAthleteByRegistrationNumberLive(session.skfId)
  if (!athlete) {
    return { authenticated: false }
  }

  return {
    authenticated: true,
    skfId: session.skfId,
    name: `${athlete.firstName || ''} ${athlete.lastName || ''}`.trim(),
    phone: athlete.phone || '+91',
    branch: athlete.branchName || 'SKF HQ',
    belt: athlete.currentBelt || 'White',
  }
}

async function getAvailablePointsBalance(skfId: string): Promise<number> {
  if (!isSupabaseReady()) {
    return 0
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('student_points')
      .select('current_balance')
      .eq('skf_id', skfId)
      .maybeSingle()

    if (error) {
      console.error('[Shop/Order] Failed to fetch points balance:', error)
      return 0
    }

    return Math.max(0, Number(data?.current_balance || 0))
  } catch (error) {
    console.error('[Shop/Order] Unexpected points balance fetch error:', error)
    return 0
  }
}

function createPickupAddress(actor: ShopCheckoutActor): ShopOrderAddress {
  return {
    fullName: actor.name || 'SKF Athlete',
    phone: actor.phone || '+91',
    addressLine1: 'CLASS PICKUP',
    addressLine2: actor.branch ? `Branch: ${actor.branch}` : undefined,
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '000000',
  }
}

function validateGuestAddress(address: any): ShopOrderAddress {
  const validatedAddress = {
    fullName: String(address?.fullName || '').trim(),
    phone: String(address?.phone || '').trim(),
    addressLine1: String(address?.addressLine1 || '').trim(),
    addressLine2: String(address?.addressLine2 || '').trim() || undefined,
    city: String(address?.city || '').trim(),
    state: String(address?.state || '').trim(),
    pincode: String(address?.pincode || '').trim(),
  }

  if (validatedAddress.fullName.length < 2) {
    throw new ApiError(400, 'A valid full name is required.')
  }

  if (!/^\+91[0-9]{10}$/.test(validatedAddress.phone)) {
    throw new ApiError(400, 'Phone number must include +91 and 10 digits.')
  }

  if (validatedAddress.addressLine1.length < 5) {
    throw new ApiError(400, 'A delivery address is required.')
  }

  if (validatedAddress.city.length < 2 || validatedAddress.state.length < 2) {
    throw new ApiError(400, 'City and state are required.')
  }

  if (!/^[0-9]{6}$/.test(validatedAddress.pincode)) {
    throw new ApiError(400, 'Pincode must be 6 digits.')
  }

  return validatedAddress
}

function createOrderId() {
  const timePart = Date.now().toString(36).toUpperCase()
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `SHOP-${timePart}-${randomPart}`
}
