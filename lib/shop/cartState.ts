'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ShopProduct } from './types'
import { getShopProductPrimaryImage, SHOP_IMAGE_FALLBACK } from './productImages'

export interface CartItem {
    productId: string
    variantId: string
    quantity: number
    price: number
    name: string
    size: string
    image: string
    requiresApproval?: boolean
}

const CART_KEY = 'skf_cart'
const CHECKOUT_POINTS_KEY = 'skf_checkout_points'
const CHECKOUT_PROMO_KEY = 'skf_checkout_promo'
const CART_UPDATED_EVENT = 'skf_cart_updated'

const normalizeCartItem = (item: Partial<CartItem> | null | undefined): CartItem | null => {
    const productId = String(item?.productId || '').trim()
    const variantId = String(item?.variantId || '').trim()
    const quantity = Math.max(0, Math.floor(Number(item?.quantity) || 0))

    if (!productId || !variantId || quantity <= 0) {
        return null
    }

    return {
        productId,
        variantId,
        quantity,
        price: Math.max(0, Math.round(Number(item?.price) || 0)),
        name: String(item?.name || '').trim() || 'Shop Item',
        size: String(item?.size || '').trim() || 'Standard',
        image: getShopProductPrimaryImage({
            id: productId,
            images: item?.image ? [item.image] : [],
        }) || SHOP_IMAGE_FALLBACK,
        requiresApproval: Boolean(item?.requiresApproval),
    }
}

const getCartFromStorage = (): CartItem[] => {
    if (typeof window === 'undefined') return []
    try {
        const val = localStorage.getItem(CART_KEY)
        const parsed = val ? JSON.parse(val) : []
        return Array.isArray(parsed)
            ? parsed
                .map((item) => normalizeCartItem(item))
                .filter((item): item is CartItem => Boolean(item))
            : []
    } catch {
        return []
    }
}

const saveCartToStorage = (newCart: CartItem[]) => {
    if (typeof window === 'undefined') return

    if (newCart.length === 0) {
        localStorage.removeItem(CART_KEY)
        localStorage.removeItem(CHECKOUT_POINTS_KEY)
        localStorage.removeItem(CHECKOUT_PROMO_KEY)
        return
    }

    localStorage.setItem(CART_KEY, JSON.stringify(newCart))
}

const saveNormalizedCartToStorage = (newCart: CartItem[]) => {
    if (typeof window === 'undefined') return

    const currentCartValue = localStorage.getItem(CART_KEY)
    if (!currentCartValue) return

    const nextCartValue = JSON.stringify(newCart)
    if (currentCartValue !== nextCartValue) {
        saveCartToStorage(newCart)
    }
}

const emitCartUpdated = () => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new Event(CART_UPDATED_EVENT))
}

const getAvailableCatalogItems = (products: ShopProduct[]) => {
    const items = new Map<string, { product: ShopProduct; variant: ShopProduct['variants'][number] }>()

    for (const product of products) {
        for (const variant of product.variants) {
            if (variant.stock > 0) {
                items.set(`${product.id}:${variant.id}`, { product, variant })
            }
        }
    }

    return items
}

export function useCart() {
    const [cart, setCart] = useState<CartItem[]>([])

    useEffect(() => {
        const syncCart = () => {
            const normalizedCart = getCartFromStorage()
            setCart(normalizedCart)
            saveNormalizedCartToStorage(normalizedCart)
        }

        syncCart()

        window.addEventListener('storage', syncCart)
        window.addEventListener(CART_UPDATED_EVENT, syncCart)
        return () => {
            window.removeEventListener('storage', syncCart)
            window.removeEventListener(CART_UPDATED_EVENT, syncCart)
        }
    }, [])

    const saveCart = useCallback((newCart: CartItem[]) => {
        saveCartToStorage(newCart)
        setCart(newCart)
        emitCartUpdated()
    }, [])

    useEffect(() => {
        if (typeof window === 'undefined' || cart.length === 0) return

        let cancelled = false

        fetch('/api/shop/catalog', { cache: 'no-store' })
            .then(res => res.ok ? res.json() : null)
            .then((products: ShopProduct[] | null) => {
                if (cancelled || !Array.isArray(products)) return

                const availableCatalogItems = getAvailableCatalogItems(products)
                const syncedCart = cart
                    .map((item): CartItem | null => {
                        const catalogItem = availableCatalogItems.get(`${item.productId}:${item.variantId}`)
                        if (!catalogItem) return null

                        const { product, variant } = catalogItem
                        return {
                            ...item,
                            productId: product.id,
                            variantId: variant.id,
                            name: product.name,
                            price: product.price,
                            size: variant.size,
                            image: getShopProductPrimaryImage(product),
                            requiresApproval: Boolean(variant.requiresApproval),
                        }
                    })
                    .filter((item): item is CartItem => Boolean(item))

                if (JSON.stringify(syncedCart) !== JSON.stringify(cart)) {
                    saveCart(syncedCart)
                }
            })
            .catch(() => {})

        return () => {
            cancelled = true
        }
    }, [cart, saveCart])

    const addToCart = (item: CartItem) => {
        const normalizedItem = normalizeCartItem(item)
        if (!normalizedItem) return

        const existing = cart.find(c => c.variantId === normalizedItem.variantId)
        if (existing) {
            saveCart(cart.map(c =>
                c.variantId === normalizedItem.variantId
                    ? { ...c, ...normalizedItem, quantity: c.quantity + normalizedItem.quantity }
                    : c
            ))
        } else {
            saveCart([...cart, normalizedItem])
        }
    }

    const updateQuantity = (variantId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(variantId)
            return
        }
        saveCart(cart.map(c =>
            c.variantId === variantId ? { ...c, quantity } : c
        ))
    }

    const removeFromCart = (variantId: string) => {
        saveCart(cart.filter(c => c.variantId !== variantId))
    }

    const clearCart = () => {
        saveCart([])
    }

    const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0)
    const cartTotalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    return {
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotalCount,
        cartTotalPrice
    }
}
