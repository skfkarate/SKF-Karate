import { revalidatePath, revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

import { redeemPoints } from '@/lib/points/pointsService'
import { getPortalSession } from '@/lib/server/auth/portal'
import { buildPreparedShopOrder } from '@/lib/shop/logic'
import { SHOP_PRODUCTS_CACHE_TAG } from '@/lib/shop/cache'
import type { ShopCheckoutActor, ShopOrderAddress, ShopOrderItem } from '@/lib/shop/types'
import { ApiError, readJsonBody } from '@/lib/server/api'
import { getAthleteBySkfIdLive } from '@/lib/server/repositories/athletes-live'
import { getProducts, placeShopOrder } from '@/lib/server/repositories/shop'
import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import {
  shopOrderAddressSchema,
  shopOrderBodySchema,
  type ShopOrderBody,
} from '@/src/server/api/validators/shop.validator'
import { logger } from '@/src/server/lib/logger'
import { withRoute } from '@/src/server/lib/route'
import { sendFeeTrackPushNotification } from '@/src/server/services/feetrack-push.service'
import { FeeOperationsService } from '@/src/server/services/fee-operations.service'
import { sendTelegramMessage } from '@/src/server/services/telegram.service'

export const POST = withRoute(
  { rateLimit: { tier: 'write' } },
  async ({ request }) => {
    const payload = shopOrderBodySchema.parse(await readJsonBody(request))
    const actor = await getShopActor(request)

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
      : createCampPickupAddress(payload?.address)

    const orderId = createOrderId()
    // 1. Send to Telegram orders channel

    try {
      const message = [
        '🔔 *New Shop Order in FeeTrack*',
        '',
        `*Customer:* ${address.fullName}`,
        `*Amount:* ₹${preparedOrder.total.toLocaleString('en-IN')}`,
        `*Items:* ${preparedOrder.items.length} item${preparedOrder.items.length === 1 ? '' : 's'}`,
        '',
        `Open FeeTrack > Shop to fulfill`,
      ].join('\n')

      const result = await sendTelegramMessage({ channel: 'orders', text: message, parseMode: 'Markdown' })
      if (!result.ok) {
        logger.warn('shop.order.telegram_failed', {
          orderId,
          status: result.status,
          skipped: result.skipped,
          error: result.error,
        })
      }
    } catch (error) {
      logger.warn('shop.order.telegram_failed', { orderId, error })
    }

    if (preparedOrder.pointsUsed > 0 && actor.skfId) {
      const redemption = await redeemPoints(actor.skfId, preparedOrder.pointsUsed, 'SHOP_REDEMPTION', {
        orderId,
      })

      if ('error' in redemption) {
        throw new ApiError(409, redemption.error)
      }
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
        fulfillmentMethod: 'dojo-pickup',
        address,
      })
    } catch (error) {
      logger.error('shop.order.db_placement_failed', { orderId, error })
      throw new ApiError(503, 'Could not save the shop order. Please try again.')
    }

    await sendFeeTrackPushNotification({
      title: 'New Shop Order',
      body: `${address.fullName} • ₹${preparedOrder.total.toLocaleString('en-IN')} • ${preparedOrder.items.length} item${preparedOrder.items.length === 1 ? '' : 's'}`,
      url: '/shop',
      tag: `shop-${orderId}`,
    })

    let feeLedgerRecorded = false
    if (actor.authenticated && actor.skfId && preparedOrder.total > 0) {
      try {
        const feeResult = await FeeOperationsService.recordPaidSourcePayment({
          skfId: actor.skfId,
          feeType: 'other',
          amount: preparedOrder.total,
          paymentMethod: 'upi_qr',
          paymentReference: orderId,
          notes: 'Recorded automatically from athlete shop checkout.',
          sourceKey: `shop:${orderId}`,
          sourceType: 'shop_order',
          sourceId: orderId,
          sourceLabel: buildShopFeeSourceLabel(orderId, preparedOrder.items),
          branchSnapshot: actor.branch || null,
          verifiedBy: 'Shop Checkout',
          metadata: {
            orderId,
            orderStatus: preparedOrder.status,
            fulfillmentMethod: 'dojo-pickup',
            subtotal: preparedOrder.subtotal,
            shippingFee: preparedOrder.shippingFee,
            discount: preparedOrder.discount,
            pointsUsed: preparedOrder.pointsUsed,
            promoCode: preparedOrder.promoCode,
            items: preparedOrder.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              name: item.name,
              size: item.size,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.lineTotal,
            })),
          },
        })
        feeLedgerRecorded = !feeResult.skipped
      } catch (error) {
        logger.warn('shop.order.fee_ledger_record_failed', { orderId, skfId: actor.skfId, error })
      }
    }

    revalidatePath('/portal/fees')
    revalidatePath('/shop')
    revalidatePath('/shop/orders')
    // Inventory changes should invalidate the cached shop listing after every order.
    revalidateTag(SHOP_PRODUCTS_CACHE_TAG, 'max')
    for (const productId of new Set(preparedOrder.items.map((item) => item.productId))) {
      revalidatePath(`/shop/${productId}`)
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      order,
      customerType: order.customerType,
      sheetSaved: false,
      feeLedgerRecorded,
    })
  }
)



async function getShopActor(request: Request): Promise<ShopCheckoutActor> {
  const session = getPortalSession(request)
  if (!session?.skfId) {
    return { authenticated: false }
  }

  const athlete = await getAthleteBySkfIdLive(session.skfId)
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

function createCampPickupAddress(address: ShopOrderBody['address']): ShopOrderAddress {
  const parsedAddress = shopOrderAddressSchema.parse(address)
  const parentName = parsedAddress.parentName || parsedAddress.fullName || undefined
  const studentName = parsedAddress.studentName ?? undefined
  const age = parsedAddress.age
  const phone = parsedAddress.phone

  if (!phone) {
    throw new ApiError(400, 'Please enter a valid 10-digit mobile number.')
  }

  return {
    ...parsedAddress,
    fullName: parentName || 'SKF Guest',
    parentName,
    studentName,
    age: age ?? undefined,
    phone,
    addressLine1: 'SKF FREE TRAINING CAMP PICKUP',
    addressLine2: [
      studentName ? `Student: ${studentName}` : null,
      age ? `Age: ${age}` : null,
      'Delivery to training camp/class',
    ].filter(Boolean).join(' | '),
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '000000',
  }
}

function buildShopFeeSourceLabel(orderId: string, items: ShopOrderItem[]) {
  const summary = items
    .slice(0, 2)
    .map((item) => `${item.quantity}x ${item.name}${item.size ? ` (${item.size})` : ''}`)
    .join(', ')
  const remaining = items.length > 2 ? ` +${items.length - 2} more` : ''
  const label = `Shop Order ${orderId}${summary ? ` - ${summary}${remaining}` : ''}`
  return label.slice(0, 180)
}

function createOrderId() {
  const timePart = Date.now().toString(36).toUpperCase()
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `SHOP-${timePart}-${randomPart}`
}
