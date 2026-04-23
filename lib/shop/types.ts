export type ShopProductCategory = 'uniforms' | 'belts' | 'gear' | 'merchandise'

export interface ShopProductVariant {
  id: string
  size: string
  stock: number
  requiresApproval?: boolean
}

export interface ShopProduct {
  id: string
  name: string
  description: string
  category: ShopProductCategory
  price: number
  images: string[]
  variants: ShopProductVariant[]
  rating: number
  review_count: number
  requires_belt?: string | null
  is_public: boolean
  created_at?: string
  updated_at?: string | null
}

export interface RequestedShopCartItem {
  productId: string
  variantId: string
  quantity: number
}

export interface ShopCheckoutActor {
  authenticated: boolean
  skfId?: string | null
  name?: string | null
  phone?: string | null
  belt?: string | null
  branch?: string | null
}

export interface ShopOrderItem {
  productId: string
  variantId: string
  name: string
  size: string
  quantity: number
  unitPrice: number
  lineTotal: number
  image: string
  requiresApproval?: boolean
}

export interface ShopOrderAddress {
  fullName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
}

export const BELT_HIERARCHY = [
  'white',
  'yellow',
  'orange',
  'green',
  'blue',
  'purple',
  'brown',
  'black',
] as const

export const SHOP_ORDER_STATUSES = [
  'processing',
  'payment-pending',
  'pending-approval',
  'approved',
  'shipped',
  'delivered',
  'cancelled',
] as const

export type ShopOrderStatus = (typeof SHOP_ORDER_STATUSES)[number]

export const SHOP_ORDER_STATUS_LABELS: Record<ShopOrderStatus, string> = {
  processing: 'Processing',
  'payment-pending': 'Payment Pending',
  'pending-approval': 'Pending Instructor Approval',
  approved: 'Approved',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

export const SHOP_ORDER_STATUS_OPTIONS = SHOP_ORDER_STATUSES.map((value) => ({
  value,
  label: SHOP_ORDER_STATUS_LABELS[value],
}))

export function normalizeShopOrderStatus(status?: string | null): ShopOrderStatus {
  const normalized = String(status || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')

  if (
    normalized === 'payment pending' ||
    normalized === 'processing (payment pending)' ||
    normalized === 'processing-payment-pending' ||
    normalized === 'payment-pending'
  ) {
    return 'payment-pending'
  }

  if (
    normalized === 'pending instructor approval' ||
    normalized === 'instructor approval' ||
    normalized === 'pending-approval'
  ) {
    return 'pending-approval'
  }

  if (normalized === 'approved') {
    return 'approved'
  }

  if (normalized === 'shipped') {
    return 'shipped'
  }

  if (normalized === 'delivered') {
    return 'delivered'
  }

  if (normalized === 'cancelled' || normalized === 'canceled') {
    return 'cancelled'
  }

  return 'processing'
}

export function getShopOrderStatusLabel(status?: string | null): string {
  return SHOP_ORDER_STATUS_LABELS[normalizeShopOrderStatus(status)]
}

export interface ShopOrder {
  orderId: string
  skfId: string | null
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
  statusLabel: string
  fulfillmentMethod: 'shipping' | 'dojo-pickup'
  address: ShopOrderAddress
  createdAt: string
  updatedAt?: string | null
}
