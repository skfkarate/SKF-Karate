import crypto from 'crypto'

import { revalidatePath } from 'next/cache'
import { NextResponse } from 'next/server'

import { redeemPoints, restoreRedeemedPoints } from '@/lib/points/pointsService'
import { getPortalSession } from '@/lib/server/auth/portal'
import { disabledResponse, isPaymentsEnabled } from '@/lib/server/feature-flags'
import { buildPreparedShopOrder } from '@/lib/shop/logic'
import type { ShopCheckoutActor, ShopOrderAddress } from '@/lib/shop/types'
import { ApiError, readJsonBody } from '@/lib/server/api'
import { getAthleteByRegistrationNumberLive } from '@/lib/server/repositories/athletes-live'
import { getProducts, placeShopOrder } from '@/lib/server/repositories/shop'
import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import {
  shopOrderAddressSchema,
  shopOrderBodySchema,
  type ShopOrderBody,
} from '@/src/server/api/validators/shop.validator'
import { logger } from '@/src/server/lib/logger'
import { withRoute } from '@/src/server/lib/route'

export const POST = withRoute(
  { rateLimit: { tier: 'write' } },
  async ({ request }) => {
    if (!isPaymentsEnabled()) {
      return disabledResponse('Shop checkout', 503)
    }

    const payload = shopOrderBodySchema.parse(await readJsonBody(request))
    const actor = await getShopActor(request)

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
    let pointsRedeemed = false

    if (preparedOrder.pointsUsed > 0 && actor.skfId) {
      const redemption = await redeemPoints(actor.skfId, preparedOrder.pointsUsed, 'SHOP_REDEMPTION', {
        orderId,
      })

      if ('error' in redemption) {
        throw new ApiError(409, redemption.error)
      }

      pointsRedeemed = true
    }

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
      if (pointsRedeemed && actor.skfId) {
        await restoreRedeemedPoints(actor.skfId, preparedOrder.pointsUsed, {
          orderId,
          reason: 'ORDER_CREATION_FAILED',
        })
      }

      throw new ApiError(
        409,
        error instanceof Error
          ? error.message
          : 'Unable to place the order right now.'
      )
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
  }
)

function verifyPaymentSignature(payload: ShopOrderBody) {
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

async function getShopActor(request: Request): Promise<ShopCheckoutActor> {
  const session = getPortalSession(request)
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
      logger.error('shop.order.points_balance_failed', { skfId, error })
      return 0
    }

    return Math.max(0, Number(data?.current_balance || 0))
  } catch (error) {
    logger.error('shop.order.points_balance_unexpected', { skfId, error })
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

function validateGuestAddress(address: ShopOrderBody['address']): ShopOrderAddress {
  return shopOrderAddressSchema.parse(address)
}

function createOrderId() {
  const timePart = Date.now().toString(36).toUpperCase()
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `SHOP-${timePart}-${randomPart}`
}
