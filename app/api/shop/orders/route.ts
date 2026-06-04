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
import { FeeOperationsService } from '@/src/server/services/fee-operations.service'
import { sendTelegramMessage, sendTelegramPhoto } from '@/src/server/services/telegram.service'

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
    let telegramNotified = 'No'

    try {
      const message = [
        'New shop order',
        '',
        `Order ID: ${orderId}`,
        `Customer: ${address.fullName}`,
        `Phone: ${address.phone || 'N/A'}`,
        `Student: ${address.studentName ? `${address.studentName} (Age: ${address.age || 'N/A'})` : 'Athlete Profile Linked'}`,
        `Amount: ₹${preparedOrder.total.toLocaleString('en-IN')}`,
        `Items: ${preparedOrder.items.map((item) => `${item.quantity}x ${item.name} (${item.size})`).join(', ')}`,
      ].join('\n')

      if (payload.paymentProofBase64) {
        const base64Data = payload.paymentProofBase64.split(';base64,').pop()
        if (base64Data) {
          const buffer = Buffer.from(base64Data, 'base64')
          const result = await sendTelegramPhoto({
            channel: 'orders',
            caption: message,
            photo: new Blob([buffer]),
            filename: payload.paymentProofName || 'screenshot.jpg',
          })
          if (result.ok) telegramNotified = 'Yes'
          else logger.warn('shop.order.telegram_failed', { orderId, status: result.status, skipped: result.skipped, error: result.error })
        }
      } else {
        const result = await sendTelegramMessage({ channel: 'orders', text: message })
        if (result.ok) telegramNotified = 'Yes'
        else logger.warn('shop.order.telegram_failed', { orderId, status: result.status, skipped: result.skipped, error: result.error })
      }
    } catch (error) {
      logger.warn('shop.order.telegram_failed', { orderId, error })
    }

    // Save to the configured shop sheet first, then fall back to the legacy Orders sheet shape.
    const sheetResult = await appendShopOrderToSheet({
      orderId,
      actor,
      address,
      items: preparedOrder.items,
      subtotal: preparedOrder.subtotal,
      discount: preparedOrder.discount,
      total: preparedOrder.total,
      pointsUsed: preparedOrder.pointsUsed,
      status: preparedOrder.status,
      paymentProofUploaded: Boolean(payload.paymentProofBase64),
      telegramNotified,
    })

    if (!sheetResult.saved) {
      logger.info('shop.order.sheet_save_skipped', {
        orderId,
        reason: sheetResult.reason,
      })
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
      logger.warn('shop.order.primary_db_placement_failed', { orderId, error })
      order = {
        orderId,
        customerType: actor.authenticated ? 'athlete' : 'guest'
      }
    }

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

    revalidatePath('/admin/shop')
    revalidatePath('/admin/shop/products')
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
      sheetSaved: sheetResult.saved,
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
  const parentName = parsedAddress.parentName || parsedAddress.fullName
  const studentName = parsedAddress.studentName
  const age = parsedAddress.age
  const phone = parsedAddress.phone

  if (!phone) {
    throw new ApiError(400, 'Please enter a valid 10-digit mobile number.')
  }

  return {
    ...parsedAddress,
    fullName: parentName,
    parentName,
    studentName,
    age,
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

type AppendShopOrderToSheetInput = {
  orderId: string
  actor: ShopCheckoutActor
  address: ShopOrderAddress
  items: ShopOrderItem[]
  subtotal: number
  discount: number
  total: number
  pointsUsed: number
  status: string
  paymentProofUploaded: boolean
  telegramNotified: string
}

async function appendShopOrderToSheet(input: AppendShopOrderToSheetInput): Promise<{
  saved: boolean
  reason?: string
}> {
  logger.info('shop.order.sheet_save_skipped', {
    orderId: input.orderId,
    reason: 'Google Sheets writes are limited to contact form and book free trial submissions.',
  })
  return {
    saved: false,
    reason: 'Google Sheets writes are limited to contact form and book free trial submissions.',
  }
}
