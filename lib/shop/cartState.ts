'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface CartItem {
    productId: string
    variantId: string
    quantity: number
    price: number
    name: string
    size: string
    image: string
}

const CART_KEY = 'skf_cart'

const getCartFromStorage = (): CartItem[] => {
    if (typeof window === 'undefined') return []
    const val = localStorage.getItem(CART_KEY)
    return val ? JSON.parse(val) : []
}

export function useCart() {
    const queryClient = useQueryClient()

    const { data: cart = [] } = useQuery<CartItem[]>({
        queryKey: ['cart'],
        queryFn: getCartFromStorage,
        initialData: () => getCartFromStorage() // Ensure immediate client render
    })

    const saveCartMutation = useMutation({
        mutationFn: async (newCart: CartItem[]) => {
            if (typeof window !== 'undefined') {
                localStorage.setItem(CART_KEY, JSON.stringify(newCart))
            }
            return newCart
        },
        onSuccess: (newCart) => {
            queryClient.setQueryData(['cart'], newCart)
        }
    })

    const addToCart = (item: CartItem) => {
        const existing = cart.find(c => c.variantId === item.variantId)
        if (existing) {
            saveCartMutation.mutate(cart.map(c => 
                c.variantId === item.variantId ? { ...c, quantity: c.quantity + item.quantity } : c
            ))
        } else {
            saveCartMutation.mutate([...cart, item])
        }
    }

    const updateQuantity = (variantId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(variantId)
            return
        }
        saveCartMutation.mutate(cart.map(c => 
            c.variantId === variantId ? { ...c, quantity } : c
        ))
    }

    const removeFromCart = (variantId: string) => {
        saveCartMutation.mutate(cart.filter(c => c.variantId !== variantId))
    }

    const clearCart = () => {
        saveCartMutation.mutate([])
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
