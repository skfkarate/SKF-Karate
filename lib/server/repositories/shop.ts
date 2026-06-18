import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import { logger } from '@/src/server/lib/logger'
import {
  normalizeCurrencyAmount,
  normalizeDecimal,
  normalizeOptionalText,
  normalizeShopProduct,
  normalizeShopProductVariant,
  normalizeWholeNumber,
} from '@/lib/shop/logic'
import type {
  ShopCheckoutActor,
  ShopOrder,
  ShopOrderAddress,
  ShopOrderItem,
  ShopOrderStatus,
  ShopProduct,
  ShopProductCategory,
  ShopProductVariant,
} from '@/lib/shop/types'
import { getShopOrderStatusLabel, normalizeShopOrderStatus } from '@/lib/shop/types'

const PRODUCTS_TABLE = 'skf_products'
const ORDERS_TABLE = 'skf_shop_orders'
const PLACE_ORDER_RPC = 'place_shop_order'

const VALID_CATEGORIES = new Set<ShopProductCategory>([
  'uniforms',
  'belts',
  'gear',
  'merchandise',
])

type ShopOrderRow = {
  order_id: string
  skf_id: string | null
  customer_name: string
  customer_phone: string | null
  customer_type: 'athlete' | 'guest'
  items: unknown
  subtotal: number
  shipping_fee: number
  total: number
  discount: number
  points_used: number
  promo_code: string | null
  status: string
  fulfillment_method: 'shipping' | 'dojo-pickup'
  address: unknown
  created_at: string
  updated_at: string | null
}

type RawOrderItem = {
  productId?: unknown
  variantId?: unknown
  name?: unknown
  size?: unknown
  quantity?: unknown
  unitPrice?: unknown
  price?: unknown
  lineTotal?: unknown
  image?: unknown
  requiresApproval?: unknown
}

export type SaveShopProductInput = Partial<ShopProduct>

export interface PersistShopOrderInput {
  orderId: string
  actor: ShopCheckoutActor
  customerName: string
  customerPhone: string | null
  customerType: 'athlete' | 'guest'
  items: ShopOrderItem[]
  subtotal: number
  shippingFee: number
  total: number
  discount: number
  pointsUsed: number
  promoCode: string | null
  status: ShopOrderStatus
  fulfillmentMethod: 'shipping' | 'dojo-pickup'
  address: ShopOrderAddress
}

export async function getProducts(): Promise<ShopProduct[]> {
  if (!isSupabaseReady()) {
    return []
  }

  try {
    const { data, error } = await supabaseAdmin
      .from(PRODUCTS_TABLE)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      logger.error('shop.products.fetch_failed', { error })
      return []
    }

    return Array.isArray(data) ? data.map((record) => normalizeShopProduct(record)) : []
  } catch (error) {
    logger.error('shop.products.fetch_unexpected_failed', { error })
    return []
  }
}

export async function getProductById(productId: string): Promise<ShopProduct | null> {
  const products = await getProducts()
  return products.find((product) => product.id === productId) || null
}

export async function upsertProduct(input: SaveShopProductInput): Promise<ShopProduct> {
  if (!isSupabaseReady()) {
    throw new Error('Supabase is not configured for shop product management.')
  }

  const product = sanitizeProductForSave(input)

  const { data, error } = await supabaseAdmin
    .from(PRODUCTS_TABLE)
    .upsert(
      {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        images: product.images,
        variants: product.variants,
        rating: product.rating,
        review_count: product.review_count,
        requires_belt: product.requires_belt || null,
        is_public: product.is_public,
        created_at: product.created_at,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
    .select('*')
    .maybeSingle()

  if (error || !data) {
    logger.error('shop.products.upsert_failed', { error })
    throw new Error('Failed to save the product.')
  }

  return normalizeShopProduct(data)
}

export async function getAllShopOrders(): Promise<ShopOrder[]> {
  return getDatabaseOrders()
}

export async function getShopOrdersBySkfId(skfId: string): Promise<ShopOrder[]> {
  const normalizedSkfId = String(skfId || '').trim().toUpperCase()
  if (!normalizedSkfId) {
    return []
  }

  const allOrders = await getAllShopOrders()
  return allOrders.filter(
    (order) => String(order.skfId || '').trim().toUpperCase() === normalizedSkfId
  )
}

export async function getShopOrderById(orderId: string): Promise<ShopOrder | null> {
  const normalizedOrderId = String(orderId || '').trim()
  if (!normalizedOrderId) {
    return null
  }

  if (!isSupabaseReady()) {
    return null
  }

  try {
    const { data, error } = await supabaseAdmin
      .from(ORDERS_TABLE)
      .select('*')
      .eq('order_id', normalizedOrderId)
      .maybeSingle()

    if (error) {
      logger.error('shop.orders.fetch_by_id_failed', { orderId: normalizedOrderId, error })
      return null
    }

    return data ? normalizeDatabaseOrder(data) : null
  } catch (error) {
    logger.error('shop.orders.fetch_by_id_failed', { orderId: normalizedOrderId, error })
    return null
  }
}

export async function updateShopOrderStatus(
  orderId: string,
  nextStatus: string
): Promise<ShopOrder | null> {
  const normalizedStatus = normalizeShopOrderStatus(nextStatus)
  const normalizedOrderId = String(orderId || '').trim()

  if (!normalizedOrderId) {
    throw new Error('Order ID is required.')
  }

  if (!isSupabaseReady()) {
    throw new Error('Supabase is not configured for shop order management.')
  }

  try {
    const { data, error } = await supabaseAdmin
      .from(ORDERS_TABLE)
      .update({
        status: normalizedStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', normalizedOrderId)
      .select('*')
      .maybeSingle()

    if (error) {
      logger.error('shop.orders.update_status_failed', {
        orderId: normalizedOrderId,
        status: normalizedStatus,
        error,
      })
      throw new Error('Failed to update the shop order status.')
    }

    return data ? normalizeDatabaseOrder(data) : null
  } catch (error) {
    logger.error('shop.orders.update_status_unexpected_failed', {
      orderId: normalizedOrderId,
      status: normalizedStatus,
      error,
    })
    throw error
  }
}

export async function placeShopOrder(input: PersistShopOrderInput): Promise<ShopOrder> {
  if (!isSupabaseReady()) {
    throw new Error('Supabase is not configured for shop checkout.')
  }

  const rpcOrder = await tryPlaceShopOrderRpc(input)
  if (rpcOrder) {
    return rpcOrder
  }

  const insertedOrder = await insertShopOrderRow(input)

  try {
    await reserveInventoryFallback(input.items)
    return insertedOrder.order
  } catch (error) {
    await markOrderAsCancelled(insertedOrder.order.orderId)
    throw error
  }
}

async function getDatabaseOrders(): Promise<ShopOrder[]> {
  if (!isSupabaseReady()) {
    return []
  }

  try {
    const { data, error } = await supabaseAdmin
      .from(ORDERS_TABLE)
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !Array.isArray(data)) {
      if (error) {
        logger.error('shop.orders.fetch_failed', { error })
      }
      return []
    }

    return data.map((record) => normalizeDatabaseOrder(record))
  } catch (error) {
    logger.error('shop.orders.fetch_unexpected_failed', { error })
    return []
  }
}

function normalizeDatabaseOrder(record: Partial<ShopOrderRow>): ShopOrder {
  const status = normalizeShopOrderStatus(record.status)
  const address = normalizeOrderAddress(record.address)
  const items = normalizeOrderItems(record.items)
  const skfId = normalizeOptionalText(record.skf_id)

  return {
    orderId: String(record.order_id || ''),
    skfId,
    customerName: normalizeOptionalText(record.customer_name) || address.fullName || 'Guest',
    customerPhone:
      normalizeOptionalText(record.customer_phone) || normalizeOptionalText(address.phone),
    customerType: record.customer_type === 'athlete' ? 'athlete' : 'guest',
    items,
    subtotal: normalizeCurrencyAmount(record.subtotal),
    shippingFee: normalizeCurrencyAmount(record.shipping_fee),
    total: normalizeCurrencyAmount(record.total),
    discount: normalizeCurrencyAmount(record.discount),
    pointsUsed: normalizeWholeNumber(record.points_used),
    promoCode: normalizeOptionalText(record.promo_code),
    status,
    statusLabel: getShopOrderStatusLabel(status),
    fulfillmentMethod:
      record.fulfillment_method === 'dojo-pickup' ? 'dojo-pickup' : 'shipping',
    address,
    createdAt: record.created_at || new Date().toISOString(),
    updatedAt: record.updated_at || null,
  }
}

function normalizeOrderItems(value: unknown): ShopOrderItem[] {
  const parsed = parseJsonValue(value)
  const items = Array.isArray(parsed) ? parsed : []

  return items
    .filter(isRecord)
    .map((item: RawOrderItem) => {
      const quantity = normalizeWholeNumber(item.quantity)
      const unitPrice = normalizeCurrencyAmount(item.unitPrice ?? item.price)

      return {
        productId: String(item.productId || ''),
        variantId: String(item.variantId || ''),
        name: String(item.name || 'Unnamed Product'),
        size: String(item.size || 'Standard'),
        quantity,
        unitPrice,
        lineTotal: normalizeCurrencyAmount(
          item.lineTotal ?? unitPrice * quantity
        ),
        image: String(item.image || ''),
        requiresApproval: Boolean(item.requiresApproval),
      }
    })
    .filter((item: ShopOrderItem) => item.variantId && item.quantity > 0)
}

function normalizeOrderAddress(value: unknown): ShopOrderAddress {
  const parsed = parseJsonValue(value)
  const address = isRecord(parsed) ? parsed : {}

  return {
    fullName: String(address.fullName || ''),
    parentName: normalizeOptionalText(address.parentName) || undefined,
    studentName: normalizeOptionalText(address.studentName) || undefined,
    phone: String(address.phone || ''),
    addressLine1: String(address.addressLine1 || ''),
    addressLine2: normalizeOptionalText(address.addressLine2) || undefined,
    city: String(address.city || ''),
    state: String(address.state || ''),
    pincode: String(address.pincode || ''),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseJsonValue(value: unknown): unknown {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }

  return value
}

function sanitizeProductForSave(input: SaveShopProductInput): ShopProduct {
  const name = String(input.name || '').trim()
  if (!name) {
    throw new Error('Product name is required.')
  }

  const description = String(input.description || '').trim()
  if (!description) {
    throw new Error('Product description is required.')
  }

  const category = VALID_CATEGORIES.has(input.category as ShopProductCategory)
    ? (input.category as ShopProductCategory)
    : 'merchandise'

  const baseId = normalizeIdentifier(input.id)
  const generatedId = `prd_${slugify(name) || 'item'}_${Date.now().toString(36)}`
  const id = baseId || generatedId

  const variants = sanitizeVariants(input.variants, id)
  const images = Array.isArray(input.images)
    ? input.images.map((image) => String(image || '').trim()).filter(Boolean)
    : []

  const requiresBelt = input.is_public ? null : normalizeOptionalText(input.requires_belt)

  return {
    id,
    name,
    description,
    category,
    price: normalizeCurrencyAmount(input.price),
    images,
    variants,
    rating: normalizeDecimal(input.rating),
    review_count: normalizeWholeNumber(input.review_count),
    requires_belt: requiresBelt,
    is_public: Boolean(input.is_public),
    created_at: input.created_at || new Date().toISOString(),
    updated_at: input.updated_at || null,
  }
}

function sanitizeVariants(
  variantsInput: SaveShopProductInput['variants'],
  productId: string
): ShopProductVariant[] {
  const variants = Array.isArray(variantsInput) ? variantsInput : []

  const sanitizedVariants = variants
    .map((variant, index) => sanitizeVariantForSave(variant, productId, index))
    .filter(Boolean) as ShopProductVariant[]

  if (sanitizedVariants.length === 0) {
    throw new Error('Add at least one size or variant.')
  }

  const variantIds = new Set<string>()

  for (const variant of sanitizedVariants) {
    if (variantIds.has(variant.id)) {
      throw new Error('Variant IDs must be unique.')
    }

    variantIds.add(variant.id)
  }

  return sanitizedVariants
}

function sanitizeVariantForSave(
  variant: Partial<ShopProductVariant> | undefined,
  productId: string,
  index: number
): ShopProductVariant | null {
  const size = String(variant?.size || '').trim()
  if (!size) {
    return null
  }

  const normalizedId =
    normalizeIdentifier(variant?.id) ||
    `${productId}_${slugify(size) || `variant-${index + 1}`}`

  return {
    id: normalizedId,
    size,
    stock: normalizeWholeNumber(variant?.stock),
    requiresApproval: Boolean(variant?.requiresApproval),
  }
}

function normalizeIdentifier(value: unknown): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function slugify(value: string): string {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

async function tryPlaceShopOrderRpc(
  input: PersistShopOrderInput
): Promise<ShopOrder | null> {
  try {
    const { data, error } = await supabaseAdmin.rpc(PLACE_ORDER_RPC, {
      p_order_id: input.orderId,
      p_skf_id: input.actor.skfId || null,
      p_customer_name: input.customerName,
      p_customer_phone: input.customerPhone,
      p_customer_type: input.customerType,
      p_items: input.items,
      p_subtotal: input.subtotal,
      p_shipping_fee: input.shippingFee,
      p_total: input.total,
      p_discount: input.discount,
      p_points_used: input.pointsUsed,
      p_promo_code: input.promoCode,
      p_status: input.status,
      p_fulfillment_method: input.fulfillmentMethod,
      p_address: input.address,
    })

    if (error || !data) {
      if (error) {
        logger.warn('shop.orders.rpc_place_fallback', { error })
      }
      return null
    }

    return normalizeDatabaseOrder(data as Partial<ShopOrderRow>)
  } catch (error) {
    logger.warn('shop.orders.rpc_place_unexpected_fallback', { error })
    return null
  }
}

async function insertShopOrderRow(input: PersistShopOrderInput): Promise<{
  order: ShopOrder
  persistedToDatabase: boolean
}> {
  const row = buildShopOrderRowInput(input)

  const { data, error } = await supabaseAdmin
    .from(ORDERS_TABLE)
    .insert(row)
    .select('*')
    .maybeSingle()

  if (error || !data) {
    logger.error('shop.orders.insert_failed', { orderId: input.orderId, error })
    throw new Error('Failed to save the order.')
  }

  return {
    order: normalizeDatabaseOrder(data),
    persistedToDatabase: true,
  }
}

function buildShopOrderRowInput(input: PersistShopOrderInput): ShopOrderRow {
  const now = new Date().toISOString()

  return {
    order_id: input.orderId,
    skf_id: input.actor.skfId || null,
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    customer_type: input.customerType,
    items: input.items,
    subtotal: input.subtotal,
    shipping_fee: input.shippingFee,
    total: input.total,
    discount: input.discount,
    points_used: input.pointsUsed,
    promo_code: input.promoCode,
    status: input.status,
    fulfillment_method: input.fulfillmentMethod,
    address: input.address,
    created_at: now,
    updated_at: now,
  }
}

async function reserveInventoryFallback(items: ShopOrderItem[]): Promise<void> {
  const requestedByProduct = new Map<string, Map<string, number>>()

  for (const item of items) {
    if (!requestedByProduct.has(item.productId)) {
      requestedByProduct.set(item.productId, new Map<string, number>())
    }

    const productRequests = requestedByProduct.get(item.productId)!
    productRequests.set(
      item.variantId,
      (productRequests.get(item.variantId) || 0) + normalizeWholeNumber(item.quantity)
    )
  }

  for (const [productId, requestedVariants] of requestedByProduct.entries()) {
    const { data, error } = await supabaseAdmin
      .from(PRODUCTS_TABLE)
      .select('id, variants, updated_at')
      .eq('id', productId)
      .maybeSingle()

    if (error || !data) {
      logger.error('shop.orders.inventory_fetch_failed', { productId, error })
      throw new Error('Some items are no longer available. Please refresh your cart.')
    }

    const variants = Array.isArray(data.variants)
      ? data.variants.map((variant: unknown) => normalizeShopProductVariant(variant as any))
      : []
    let inventoryChanged = false

    const updatedVariants = variants.map((variant) => {
      const requestedQuantity = requestedVariants.get(variant.id) || 0
      if (!requestedQuantity) {
        return variant
      }

      if (variant.stock < requestedQuantity) {
        throw new Error(
          `Only ${variant.stock} item(s) left for the selected size (${variant.size}).`
        )
      }

      inventoryChanged = true
      return {
        ...variant,
        stock: variant.stock - requestedQuantity,
      }
    })

    if (!inventoryChanged) {
      throw new Error('One or more selected sizes are no longer available.')
    }

    const { data: updatedRow, error: updateError } = await supabaseAdmin
      .from(PRODUCTS_TABLE)
      .update({
        variants: updatedVariants,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)
      .eq('updated_at', data.updated_at)
      .select('id')
      .maybeSingle()

    if (updateError || !updatedRow) {
      logger.error('shop.orders.inventory_reserve_failed', { productId, error: updateError })
      throw new Error('Inventory changed while placing the order. Please retry.')
    }
  }
}

async function markOrderAsCancelled(orderId: string) {
  if (!isSupabaseReady()) {
    return
  }

  try {
    await supabaseAdmin
      .from(ORDERS_TABLE)
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId)
  } catch (error) {
    logger.error('shop.orders.cancel_incomplete_failed', { orderId, error })
  }
}
