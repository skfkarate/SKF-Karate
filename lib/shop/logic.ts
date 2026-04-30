import {
  products as seedProducts,
  type Product as SeedProduct,
  type ProductVariant as SeedProductVariant,
} from '@/data/seed/products'

import type {
  RequestedShopCartItem,
  ShopCheckoutActor,
  ShopOrderItem,
  ShopOrderStatus,
  ShopProduct,
  ShopProductCategory,
  ShopProductVariant,
} from './types'
import { BELT_HIERARCHY } from './types'

const VALID_PRODUCT_CATEGORIES = new Set([
  'uniforms',
  'belts',
  'gear',
  'merchandise',
])

type RawShopProduct = Partial<Omit<ShopProduct, 'category' | 'images' | 'variants'>> & {
  category?: unknown
  images?: unknown
  variants?: unknown
  reviewCount?: unknown
  review_count?: unknown
}

type RawShopProductVariant = Partial<SeedProductVariant> & Partial<ShopProductVariant>

export function seedProductToShopProduct(seedProduct: SeedProduct): ShopProduct {
  return {
    id: String(seedProduct.id),
    name: String(seedProduct.name),
    description: String(seedProduct.description || ''),
    category: VALID_PRODUCT_CATEGORIES.has(seedProduct.category)
      ? seedProduct.category
      : 'merchandise',
    price: normalizeCurrencyAmount(seedProduct.price),
    images: Array.isArray(seedProduct.images)
      ? seedProduct.images.map((image: unknown) => String(image)).filter(Boolean)
      : [],
    variants: Array.isArray(seedProduct.variants)
      ? seedProduct.variants.map((variant) => ({
          id: String(variant.id),
          size: String(variant.size),
          stock: normalizeWholeNumber(variant.stock),
          requiresApproval: Boolean(variant.requiresApproval),
        }))
      : [],
    rating: normalizeDecimal(seedProduct.rating),
    review_count: normalizeWholeNumber(seedProduct.reviewCount),
    requires_belt: seedProduct.requiresTier === 'silver' ? 'Brown' : null,
    is_public: !seedProduct.requiresTier,
    created_at: seedProduct.createdAt || new Date().toISOString(),
    updated_at: null,
  }
}

export const seedShopProducts: ShopProduct[] = seedProducts.map(seedProductToShopProduct)

export function normalizeShopProduct(record: RawShopProduct): ShopProduct {
  const category = String(record?.category || '') as ShopProductCategory

  return {
    id: String(record?.id || ''),
    name: String(record?.name || ''),
    description: String(record?.description || ''),
    category: VALID_PRODUCT_CATEGORIES.has(category)
      ? category
      : 'merchandise',
    price: normalizeCurrencyAmount(record?.price),
    images: Array.isArray(record?.images)
      ? record.images.map((image: unknown) => String(image)).filter(Boolean)
      : [],
    variants: Array.isArray(record?.variants)
      ? record.variants
          .map((variant) => normalizeShopProductVariant(variant as RawShopProductVariant))
          .filter((variant: ShopProductVariant) => variant.id && variant.size)
      : [],
    rating: normalizeDecimal(record?.rating),
    review_count: normalizeWholeNumber(record?.review_count ?? record?.reviewCount),
    requires_belt: normalizeOptionalText(record?.requires_belt),
    is_public: Boolean(record?.is_public),
    created_at: record?.created_at || new Date().toISOString(),
    updated_at: record?.updated_at || null,
  }
}

export function normalizeShopProductVariant(variant: RawShopProductVariant): ShopProductVariant {
  return {
    id: String(variant?.id || ''),
    size: String(variant?.size || ''),
    stock: normalizeWholeNumber(variant?.stock),
    requiresApproval: Boolean(variant?.requiresApproval),
  }
}

export function mergeCatalogProducts(
  baseProducts: ShopProduct[] = seedShopProducts,
  overrideProducts: ShopProduct[] = []
): ShopProduct[] {
  const overridesById = new Map(
    overrideProducts
      .map((product) => normalizeShopProduct(product))
      .filter((product) => product.id)
      .map((product) => [product.id, product] as const)
  )

  const mergedBase = baseProducts.map((product) => {
    const normalizedBase = normalizeShopProduct(product)
    return overridesById.get(normalizedBase.id) || normalizedBase
  })

  const extraProducts = Array.from(overridesById.values())
    .filter((product) => !mergedBase.some((baseProduct) => baseProduct.id === product.id))
    .sort((left, right) => {
      const leftTime = Date.parse(left.created_at || '') || 0
      const rightTime = Date.parse(right.created_at || '') || 0
      return rightTime - leftTime
    })

  return [...extraProducts, ...mergedBase]
}

export function getProductTotalStock(product: ShopProduct): number {
  return product.variants.reduce(
    (total, variant) => total + normalizeWholeNumber(variant.stock),
    0
  )
}

export function normalizeBeltName(value?: string | null): string | null {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/belt/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  return normalized || null
}

export function getProductAccessIssue(
  product: ShopProduct,
  actor: ShopCheckoutActor
): string | null {
  if (!product.is_public && !actor.authenticated) {
    return `${product.name} requires an athlete login.`
  }

  if (!product.requires_belt) {
    return null
  }

  if (!actor.authenticated) {
    return `${product.name} requires a logged-in athlete account.`
  }

  const actorBelt = normalizeBeltName(actor.belt) || 'white'
  const requiredBelt = normalizeBeltName(product.requires_belt) || 'white'
  const actorRank = BELT_HIERARCHY.indexOf(actorBelt as (typeof BELT_HIERARCHY)[number])
  const requiredRank = BELT_HIERARCHY.indexOf(
    requiredBelt as (typeof BELT_HIERARCHY)[number]
  )

  if (actorRank === -1 || requiredRank === -1 || actorRank < requiredRank) {
    return `${product.name} requires ${product.requires_belt} belt or above.`
  }

  return null
}

export function calculateShippingFee(subtotal: number, actor: ShopCheckoutActor): number {
  if (actor.authenticated) {
    return 0
  }

  return subtotal >= 5000 ? 0 : 250
}

export function calculatePromoDiscount(
  subtotal: number,
  promoCode?: string | null
): { promoCode: string | null; promoDiscount: number } {
  const normalizedPromoCode = String(promoCode || '').trim().toUpperCase()

  if (normalizedPromoCode !== 'SKF10') {
    return { promoCode: null, promoDiscount: 0 }
  }

  return {
    promoCode: normalizedPromoCode,
    promoDiscount: normalizeCurrencyAmount(subtotal * 0.1),
  }
}

export function calculatePointsRedemption(
  subtotal: number,
  requestedPoints: number,
  availablePoints: number,
  actor: ShopCheckoutActor
): { pointsUsed: number; pointsDiscount: number; maxPointsRedeemable: number } {
  const maximumDiscountValue = subtotal * 0.1
  const maxPointsRedeemable = Math.floor(maximumDiscountValue / 25) * 100

  if (!actor.authenticated) {
    return { pointsUsed: 0, pointsDiscount: 0, maxPointsRedeemable }
  }

  const normalizedRequestedPoints =
    Math.floor(Math.max(0, Number(requestedPoints) || 0) / 100) * 100
  const normalizedAvailablePoints = Math.max(0, normalizeWholeNumber(availablePoints))
  const pointsUsed = Math.min(
    normalizedRequestedPoints,
    normalizedAvailablePoints,
    maxPointsRedeemable
  )

  return {
    pointsUsed,
    pointsDiscount: Math.floor(pointsUsed / 100) * 25,
    maxPointsRedeemable,
  }
}

export function buildPreparedShopOrder(input: {
  catalog: ShopProduct[]
  items: RequestedShopCartItem[]
  actor: ShopCheckoutActor
  availablePoints?: number
  requestedPoints?: number
  promoCode?: string | null
}): {
  items: ShopOrderItem[]
  subtotal: number
  shippingFee: number
  promoCode: string | null
  promoDiscount: number
  pointsUsed: number
  pointsDiscount: number
  discount: number
  total: number
  status: ShopOrderStatus
  requiresApproval: boolean
} {
  const aggregatedItems = aggregateCartItems(input.items)

  if (aggregatedItems.length === 0) {
    throw new Error('Your cart is empty.')
  }

  const productsById = new Map(
    input.catalog.map((product) => [product.id, normalizeShopProduct(product)] as const)
  )

  const preparedItems: ShopOrderItem[] = []
  let subtotal = 0
  let requiresApproval = false

  for (const cartItem of aggregatedItems) {
    if (!cartItem.productId || !cartItem.variantId || cartItem.quantity <= 0) {
      throw new Error('One or more cart items are invalid.')
    }

    const product = productsById.get(cartItem.productId)
    if (!product) {
      throw new Error('One or more products are no longer available.')
    }

    const accessIssue = getProductAccessIssue(product, input.actor)
    if (accessIssue) {
      throw new Error(accessIssue)
    }

    const variant = product.variants.find(
      (candidate) => candidate.id === cartItem.variantId
    )

    if (!variant) {
      throw new Error(`${product.name} is missing the selected size.`)
    }

    if (variant.stock < cartItem.quantity) {
      throw new Error(
        `Only ${variant.stock} item(s) left for ${product.name} (${variant.size}).`
      )
    }

    const lineTotal = normalizeCurrencyAmount(product.price * cartItem.quantity)
    preparedItems.push({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      size: variant.size,
      quantity: cartItem.quantity,
      unitPrice: product.price,
      lineTotal,
      image: product.images[0] || '',
      requiresApproval: Boolean(variant.requiresApproval),
    })

    subtotal += lineTotal
    requiresApproval = requiresApproval || Boolean(variant.requiresApproval)
  }

  const shippingFee = calculateShippingFee(subtotal, input.actor)
  const { promoCode, promoDiscount } = calculatePromoDiscount(
    subtotal,
    input.promoCode
  )
  const { pointsUsed, pointsDiscount } = calculatePointsRedemption(
    subtotal,
    input.requestedPoints || 0,
    input.availablePoints || 0,
    input.actor
  )
  const discount = promoDiscount + pointsDiscount
  const total = Math.max(0, subtotal + shippingFee - discount)

  return {
    items: preparedItems,
    subtotal,
    shippingFee,
    promoCode,
    promoDiscount,
    pointsUsed,
    pointsDiscount,
    discount,
    total,
    status: requiresApproval ? 'pending-approval' : 'processing',
    requiresApproval,
  }
}

export function aggregateCartItems(items: RequestedShopCartItem[]): RequestedShopCartItem[] {
  const itemsByVariantId = new Map<string, RequestedShopCartItem>()

  for (const item of items) {
    const productId = String(item?.productId || '')
    const variantId = String(item?.variantId || '')
    const quantity = normalizeWholeNumber(item?.quantity)

    if (!productId || !variantId || quantity <= 0) {
      continue
    }

    const existing = itemsByVariantId.get(variantId)
    if (existing) {
      existing.quantity += quantity
      continue
    }

    itemsByVariantId.set(variantId, {
      productId,
      variantId,
      quantity,
    })
  }

  return Array.from(itemsByVariantId.values())
}

export function normalizeWholeNumber(value: unknown): number {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return 0
  }

  return Math.max(0, Math.floor(numericValue))
}

export function normalizeCurrencyAmount(value: unknown): number {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return 0
  }

  return Math.max(0, Math.round(numericValue))
}

export function normalizeDecimal(value: unknown): number {
  const numericValue = Number(value)
  if (!Number.isFinite(numericValue)) {
    return 0
  }

  return Math.max(0, Math.round(numericValue * 10) / 10)
}

export function normalizeOptionalText(value: unknown): string | null {
  const text = String(value || '').trim()
  return text || null
}
