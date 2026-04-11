'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/shop/cartState'

export default function CartPage() {
    const { cart, updateQuantity, removeFromCart, cartTotalPrice } = useCart()
    const router = useRouter()
    
    const [pointsBalance, setPointsBalance] = useState<number | null>(null)
    const [pointsToRedeem, setPointsToRedeem] = useState<number | string>(0)
    
    // Check points balance seamlessly
    useEffect(() => {
        fetch('/api/points/balance')
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data?.balance) setPointsBalance(data.balance) })
            .catch(() => {})
    }, [])

    if (cart.length === 0) {
        return (
            <div style={{ padding: '120px 2rem', textAlign: 'center', minHeight: '80vh', background: '#050505', color: '#fff' }}>
                <h1 style={{ marginBottom: '1rem', color: 'var(--gold)' }}>Your Cart</h1>
                <p style={{ color: '#aaa', marginBottom: '2rem' }}>Your shopping cart is currently empty.</p>
                <Link href="/shop" style={{ background: '#dc3545', color: '#fff', padding: '0.8rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
                    Continue Shopping
                </Link>
            </div>
        )
    }

    // Points calculation: 100 points = ₹25. Max discount is 10% of subtotal.
    const maxDiscountVal = cartTotalPrice * 0.10
    const maxPointsRedeemable = Math.floor(maxDiscountVal / 25) * 100
    const cappedMaxPoints = pointsBalance !== null ? Math.min(pointsBalance, maxPointsRedeemable) : 0

    const ptsNum = Number(pointsToRedeem) || 0
    const finalPoints = Math.min(ptsNum, cappedMaxPoints)
    const pointsDiscount = Math.floor(finalPoints / 100) * 25
    const finalTotal = cartTotalPrice - pointsDiscount

    const proceedToCheckout = () => {
        // We'll pass points via localStorage or state. For simplicity, localStorage here.
        if (typeof window !== 'undefined') {
            localStorage.setItem('skf_checkout_points', finalPoints.toString())
        }
        router.push('/shop/checkout')
    }

    return (
        <div style={{ minHeight: '100vh', padding: '120px 2rem 4rem', background: '#050505', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 2rem', color: 'var(--gold, #ffb703)' }}>Your Cart</h1>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '3rem' }}>
                    
                    {/* Items List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {cart.map(item => (
                            <div key={item.variantId} style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', alignItems: 'center' }}>
                                <div style={{ width: '80px', height: '80px', background: '#222', borderRadius: '8px' }}></div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{ margin: '0 0 0.2rem', color: '#fff' }}>{item.name}</h3>
                                    <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>Size: {item.size}</p>
                                    <button onClick={() => removeFromCart(item.variantId)} style={{ background: 'transparent', border: 'none', color: '#dc3545', fontSize: '0.8rem', padding: 0, marginTop: '0.5rem', cursor: 'pointer' }}>Remove</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
                                    <div style={{ fontWeight: 'bold' }}>₹{item.price * item.quantity}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', background: '#111', borderRadius: '8px', border: '1px solid #333' }}>
                                        <button onClick={() => updateQuantity(item.variantId, item.quantity - 1)} style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>−</button>
                                        <span style={{ width: '30px', textAlign: 'center', fontSize: '0.9rem' }}>{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>+</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div>
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '2rem', position: 'sticky', top: '100px' }}>
                            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem', borderBottom: '1px solid #222', paddingBottom: '1rem' }}>Order Summary</h2>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#ccc' }}>
                                <span>Subtotal</span>
                                <span>₹{cartTotalPrice}</span>
                            </div>

                            {/* Points Widget */}
                            {pointsBalance !== null && pointsBalance > 0 && (
                                <div style={{ background: 'rgba(255, 183, 3, 0.05)', border: '1px solid rgba(255, 183, 3, 0.2)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <p style={{ margin: '0 0 0.5rem', color: 'var(--gold)', fontSize: '0.9rem', fontWeight: 'bold' }}>🪙 SKF Points Available: {pointsBalance}</p>
                                    <p style={{ margin: '0 0 0.8rem', color: '#aaa', fontSize: '0.8rem' }}>100 points = ₹25 off (Max {(maxDiscountVal).toFixed(0)} off)</p>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input 
                                            type="number" 
                                            value={pointsToRedeem}
                                            onChange={e => setPointsToRedeem(e.target.value)}
                                            max={cappedMaxPoints}
                                            step="100"
                                            style={{ flex: 1, padding: '0.5rem', background: '#000', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
                                        />
                                        <button onClick={() => setPointsToRedeem(cappedMaxPoints)} style={{ background: 'transparent', border: '1px solid var(--gold)', color: 'var(--gold)', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Max</button>
                                    </div>
                                    <small style={{ color: '#666', display: 'block', marginTop: '4px' }}>Redeeming {finalPoints} pts for ₹{pointsDiscount} off</small>
                                </div>
                            )}

                            {pointsDiscount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#4caf50', fontWeight: 'bold' }}>
                                    <span>Points Discount</span>
                                    <span>−₹{pointsDiscount}</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #222', fontSize: '1.2rem', fontWeight: 'bold', color: '#fff' }}>
                                <span>Total</span>
                                <span>₹{finalTotal}</span>
                            </div>

                            <button onClick={proceedToCheckout} style={{ width: '100%', background: '#dc3545', color: '#fff', border: 'none', padding: '1rem', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', marginTop: '2rem', cursor: 'pointer' }}>
                                Proceed to Checkout →
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
