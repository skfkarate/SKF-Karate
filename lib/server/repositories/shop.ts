import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import {
  mergeCatalogProducts,
  normalizeCurrencyAmount,
  normalizeDecimal,
  normalizeOptionalText,
  normalizeShopProduct,
  normalizeShopProductVariant,
  normalizeWholeNumber,
  seedShopProducts,
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

export interface SaveShopProductInput extends Partial<ShopProduct> {}

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
  const fallbackProducts = seedShopProducts

  if (!isSupabaseReady()) {
    return fallbackProducts
  }

  try {
    const { data, error } = await supabaseAdmin
      .from(PRODUCTS_TABLE)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[Shop/Product] Failed to fetch products from Supabase:', error)
      return fallbackProducts
    }

    return mergeCatalogProducts(
      fallbackProducts,
      Array.isArray(data) ? data.map((record) => normalizeShopProduct(record)) : []
    )
  } catch (error) {
    console.error('[Shop/Product] Unexpected product fetch error:', error)
    return fallbackProducts
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
    console.error('[Shop/Product] Failed to upsert product:', error)
    throw new Error('Failed to save the product.')
  }

  return normalizeShopProduct(data)
}

export async function getAllShopOrders(): Promise<ShopOrder[]> {
  const dbOrders = await getDatabaseOrders()
  const legacyOrders = await getLegacyOrders()
  return mergeShopOrders(dbOrders, legacyOrders)
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

  if (isSupabaseReady()) {
    try {
      const { data, error } = await supabaseAdmin
        .from(ORDERS_TABLE)
        .select('*')
        .eq('order_id', normalizedOrderId)
        .maybeSingle()

      if (!error && data) {
        return normalizeDatabaseOrder(data)
      }
    } catch (error) {
      console.error('[Shop/Order] Failed to fetch database order by id:', error)
    }
  }

  const legacyOrders = await getLegacyOrders()
  return legacyOrders.find((order) => order.orderId === normalizedOrderId) || null
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

  if (isSupabaseReady()) {
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

      if (!error && data) {
        return normalizeDatabaseOrder(data)
      }
    } catch (error) {
      console.error('[Shop/Order] Failed to update database order status:', error)
    }
  }

  const legacy = await getLegacyShopHelpers()
  const updated = await legacy.updateShopOrderStatus(
    normalizedOrderId,
    getShopOrderStatusLabel(normalizedStatus)
  )

  if (!updated) {
    return null
  }

  return getShopOrderById(normalizedOrderId)
}

export async function placeShopOrder(input: PersistShopOrderInput): Promise<ShopOrder> {
  if (isSupabaseReady()) {
    const rpcOrder = await tryPlaceShopOrderRpc(input)
    if (rpcOrder) {
      return rpcOrder
    }

    const insertedOrder = await insertShopOrderRow(input)

    if (!insertedOrder.persistedToDatabase) {
      return insertedOrder.order
    }

    try {
      await reserveInventoryFallback(input.items)
      return insertedOrder.order
    } catch (error) {
      await markOrderAsCancelled(insertedOrder.order.orderId)
      throw error
    }
  }

  return createLegacyShopOrder(input)
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
        console.error('[Shop/Order] Failed to fetch database orders:', error)
      }
      return []
    }

    return data.map((record) => normalizeDatabaseOrder(record))
  } catch (error) {
    console.error('[Shop/Order] Unexpected database order fetch error:', error)
    return []
  }
}

async function getLegacyOrders(): Promise<ShopOrder[]> {
  const legacy = await getLegacyShopHelpers()
  const rawOrders = await legacy.getAllShopOrders()

  return rawOrders.map((order) =>
    normalizeLegacyOrder({
      ...order,
      status: getShopOrderStatusLabel(order.status),
    })
  )
}

async function getLegacyShopHelpers() {
  const module = await import('@/lib/server/sheets')
  return {
    createShopOrder: module.createShopOrder,
    getAllShopOrders: module.getAllShopOrders,
    updateShopOrderStatus: module.updateShopOrderStatus,
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

function normalizeLegacyOrder(record: any): ShopOrder {
  const status = normalizeShopOrderStatus(record?.status)
  const address = normalizeOrderAddress(record?.addressJson)
  const items = normalizeOrderItems(record?.itemsJson)
  const skfId = normalizeOptionalText(record?.skfId)
  const isAthleteOrder = Boolean(skfId && skfId.toUpperCase() !== 'GUEST')
  const pickupOrder = address.addressLine1 === 'CLASS PICKUP'

  return {
    orderId: String(record?.orderId || ''),
    skfId,
    customerName: address.fullName || (isAthleteOrder ? skfId || 'Athlete' : 'Guest'),
    customerPhone: normalizeOptionalText(address.phone),
    customerType: isAthleteOrder ? 'athlete' : 'guest',
    items,
    subtotal: normalizeCurrencyAmount(
      items.reduce((total, item) => total + item.lineTotal, 0)
    ),
    shippingFee: pickupOrder ? 0 : 0,
    total: normalizeCurrencyAmount(record?.total),
    discount: normalizeCurrencyAmount(record?.discount),
    pointsUsed: normalizeWholeNumber(record?.pointsUsed),
    promoCode: null,
    status,
    statusLabel: getShopOrderStatusLabel(status),
    fulfillmentMethod: pickupOrder ? 'dojo-pickup' : 'shipping',
    address,
    createdAt: String(record?.date || new Date().toISOString()),
    updatedAt: null,
  }
}

function normalizeOrderItems(value: unknown): ShopOrderItem[] {
  const parsed = parseJsonValue(value)
  const items = Array.isArray(parsed) ? parsed : []

  return items
    .map((item: any) => {
      const quantity = normalizeWholeNumber(item?.quantity)
      const unitPrice = normalizeCurrencyAmount(item?.unitPrice ?? item?.price)

      return {
        productId: String(item?.productId || ''),
        variantId: String(item?.variantId || ''),
        name: String(item?.name || 'Unnamed Product'),
        size: String(item?.size || 'Standard'),
        quantity,
        unitPrice,
        lineTotal: normalizeCurrencyAmount(
          item?.lineTotal ?? unitPrice * quantity
        ),
        image: String(item?.image || ''),
        requiresApproval: Boolean(item?.requiresApproval),
      }
    })
    .filter((item: ShopOrderItem) => item.variantId && item.quantity > 0)
}

function normalizeOrderAddress(value: unknown): ShopOrderAddress {
  const parsed = parseJsonValue(value)
  const address = typeof parsed === 'object' && parsed ? parsed : {}

  return {
    fullName: String((address as any).fullName || ''),
    phone: String((address as any).phone || ''),
    addressLine1: String((address as any).addressLine1 || ''),
    addressLine2: normalizeOptionalText((address as any).addressLine2) || undefined,
    city: String((address as any).city || ''),
    state: String((address as any).state || ''),
    pincode: String((address as any).pincode || ''),
  }
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

function mergeShopOrders(primaryOrders: ShopOrder[], secondaryOrders: ShopOrder[]): ShopOrder[] {
  const orderMap = new Map<string, ShopOrder>()

  for (const order of [...primaryOrders, ...secondaryOrders]) {
    if (!order.orderId) {
      continue
    }

    if (!orderMap.has(order.orderId)) {
      orderMap.set(order.orderId, order)
    }
  }

  return Array.from(orderMap.values()).sort((left, right) => {
    const leftTime = Date.parse(left.createdAt || '') || 0
    const rightTime = Date.parse(right.createdAt || '') || 0
    return rightTime - leftTime
  })
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
        console.warn('[Shop/Order] Falling back from RPC order placement:', error.message)
      }
      return null
    }

    return normalizeDatabaseOrder(data as Partial<ShopOrderRow>)
  } catch (error) {
    console.warn('[Shop/Order] RPC order placement failed, using fallback.', error)
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
    const legacyOrder = await tryCreateLegacyOrder(input)
    if (legacyOrder) {
      return {
        order: legacyOrder,
        persistedToDatabase: false,
      }
    }

    console.error('[Shop/Order] Failed to insert order row:', error)
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
      console.error('[Shop/Order] Failed to fetch product inventory:', error)
      throw new Error('Some items are no longer available. Please refresh your cart.')
    }

    const variants = Array.isArray(data.variants)
      ? data.variants.map((variant: any) => normalizeShopProductVariant(variant))
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
      console.error('[Shop/Order] Failed to reserve inventory:', updateError)
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
    console.error('[Shop/Order] Failed to cancel incomplete order:', error)
  }
}

async function createLegacyShopOrder(input: PersistShopOrderInput): Promise<ShopOrder> {
  const legacyOrder = await tryCreateLegacyOrder(input)

  if (!legacyOrder) {
    throw new Error('Failed to save the order.')
  }

  return legacyOrder
}

async function tryCreateLegacyOrder(
  input: PersistShopOrderInput
): Promise<ShopOrder | null> {
  const legacy = await getLegacyShopHelpers()
  const success = await legacy.createShopOrder({
    orderId: input.orderId,
    skfId:
      input.customerType === 'athlete'
        ? input.actor.skfId || 'ATHLETE'
        : 'GUEST',
    itemsJson: JSON.stringify(
      input.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        size: item.size,
        quantity: item.quantity,
        price: item.unitPrice,
        image: item.image,
        requiresApproval: item.requiresApproval,
      }))
    ),
    total: input.total,
    discount: input.discount,
    pointsUsed: input.pointsUsed,
    date: new Date().toISOString(),
    status: getShopOrderStatusLabel(input.status),
    addressJson: JSON.stringify(input.address),
  })

  if (!success) {
    return null
  }

  return normalizeLegacyOrder({
    orderId: input.orderId,
    skfId:
      input.customerType === 'athlete'
        ? input.actor.skfId || 'ATHLETE'
        : 'GUEST',
    itemsJson: JSON.stringify(input.items),
    total: input.total,
    discount: input.discount,
    pointsUsed: input.pointsUsed,
    date: new Date().toISOString(),
    status: getShopOrderStatusLabel(input.status),
    addressJson: JSON.stringify(input.address),
  })
}
