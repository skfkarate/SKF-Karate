'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ShopProduct } from './types'

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

const getCartFromStorage = (): CartItem[] => {
    if (typeof window === 'undefined') return []
    try {
        const val = localStorage.getItem(CART_KEY)
        return val ? JSON.parse(val) : []
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

const emitCartUpdated = () => {
    if (typeof window === 'undefined') return
    window.dispatchEvent(new Event(CART_UPDATED_EVENT))
}

const getAvailableCatalogVariantKeys = (products: ShopProduct[]) => {
    const keys = new Set<string>()

    for (const product of products) {
        for (const variant of product.variants) {
            if (variant.stock > 0) {
                keys.add(`${product.id}:${variant.id}`)
            }
        }
    }

    return keys
}

export function useCart() {
    const [cart, setCart] = useState<CartItem[]>([])

    useEffect(() => {
        const syncCart = () => setCart(getCartFromStorage())
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

                const availableVariantKeys = getAvailableCatalogVariantKeys(products)
                const syncedCart = cart.filter(item =>
                    availableVariantKeys.has(`${item.productId}:${item.variantId}`)
                )

                if (syncedCart.length !== cart.length) {
                    saveCart(syncedCart)
                }
            })
            .catch(() => {})

        return () => {
            cancelled = true
        }
    }, [cart, saveCart])

    const addToCart = (item: CartItem) => {
        const existing = cart.find(c => c.variantId === item.variantId)
        if (existing) {
            saveCart(cart.map(c =>
                c.variantId === item.variantId ? { ...c, quantity: c.quantity + item.quantity } : c
            ))
        } else {
            saveCart([...cart, item])
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
