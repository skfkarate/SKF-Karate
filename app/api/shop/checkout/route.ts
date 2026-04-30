import { NextResponse } from 'next/server'

import { ApiError, readJsonBody } from '@/lib/server/api'
import { getPortalSession } from '@/lib/server/auth/portal'
import { disabledResponse, isPaymentsEnabled } from '@/lib/server/feature-flags'
import { getAthleteByRegistrationNumberLive } from '@/lib/server/repositories/athletes-live'
import { getProducts } from '@/lib/server/repositories/shop'
import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import { buildPreparedShopOrder } from '@/lib/shop/logic'
import type { ShopCheckoutActor } from '@/lib/shop/types'
import { shopCheckoutCreateOrderSchema } from '@/src/server/api/validators/shop.validator'
import { logger } from '@/src/server/lib/logger'
import { withRoute } from '@/src/server/lib/route'
import { ShopCheckoutService } from '@/src/server/services/shop-checkout.service'

export const POST = withRoute(
  { rateLimit: { tier: 'write' } },
  async ({ request }) => {
    if (!isPaymentsEnabled()) {
      return disabledResponse('Payments', 503)
    }

    const payload = shopCheckoutCreateOrderSchema.parse(await readJsonBody(request))
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
        items: payload.items,
        actor,
        availablePoints,
        requestedPoints: payload.pointsUsed,
        promoCode: payload.promoCode,
      })
    } catch (error) {
      throw new ApiError(
        400,
        error instanceof Error ? error.message : 'Invalid cart payload.'
      )
    }

    if (preparedOrder.total <= 0) {
      throw new ApiError(400, 'Checkout total must be greater than zero.')
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new ApiError(503, 'Payment gateway is not configured.')
    }

    const order = await ShopCheckoutService.createOrder({
      amount: preparedOrder.total,
      receipt: `shop_rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      notes: {
        customerType: actor.authenticated ? 'athlete' : 'guest',
        skfId: actor.skfId || '',
      },
    })

    return NextResponse.json({
      id: order.id,
      currency: order.currency,
      amount: order.amount,
      key: order.key,
      total: preparedOrder.total,
    })
  }
)

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
      logger.error('shop.checkout.points_balance_failed', { skfId, error })
      return 0
    }

    return Math.max(0, Number(data?.current_balance || 0))
  } catch (error) {
    logger.error('shop.checkout.points_balance_unexpected', { skfId, error })
    return 0
  }
}
