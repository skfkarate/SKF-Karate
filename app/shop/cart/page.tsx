'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/shop/cartState'
import {
    calculatePointsRedemption,
    calculatePromoDiscount,
    calculateShippingFee,
} from '@/lib/shop/logic'
import { ArrowLeft, Trash2, ShieldCheck, UserCircle, LogIn, Award, MapPin } from 'lucide-react'
import '../shop.css'

type AthleteProfile = {
    name: string
    phone: string
    branch: string
    skfId?: string
    belt?: string
}

export default function CartPage() {
    const { cart, updateQuantity, removeFromCart, cartTotalPrice } = useCart()
    const router = useRouter()

    // Auth State — includes full athlete profile
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const [athleteProfile, setAthleteProfile] = useState<AthleteProfile | null>(null)

    // Loyalty Points State
    const [pointsBalance, setPointsBalance] = useState<number | null>(null)
    const [pointsToRedeem, setPointsToRedeem] = useState<number | string>(0)

    // Promo Code State
    const [promoInput, setPromoInput] = useState('')
    const [activePromo, setActivePromo] = useState<{code: string, discountPct: number} | null>(null)
    const [promoError, setPromoError] = useState('')

    useEffect(() => {
        const id = window.setTimeout(() => {
        // Authenticate User & fetch full profile
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.authenticated && data.user) {
                    setIsAuthenticated(true)
                    setAthleteProfile(data.user)
                } else {
                    setIsAuthenticated(false)
                }
            })
            .catch(() => setIsAuthenticated(false))

        fetch('/api/points/balance')
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data?.balance) setPointsBalance(data.balance) })
            .catch(() => {})

        // Load saved promo
        if (typeof window !== 'undefined') {
            const savedPromo = localStorage.getItem('skf_checkout_promo')
            if (savedPromo) {
                setActivePromo({ code: savedPromo, discountPct: 0.10 })
                setPromoInput(savedPromo)
            }
        }
        }, 0)
        return () => window.clearTimeout(id)
    }, [])

    if (cart.length === 0) {
        return (
            <div className="obsidian-store" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                <h1 style={{ fontSize: '3rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Cart Empty</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '3rem', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Your armory is currently empty.</p>
                <Link href="/shop" style={{ display: 'inline-block', background: '#fff', color: '#000', padding: '1.2rem 4rem', borderRadius: '50px', textDecoration: 'none', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, fontSize: '0.9rem', transition: 'all 0.3s' }}>
                    RETURN TO STORE
                </Link>
            </div>
        )
    }

    // --- CALCULATIONS ---
    const isSkfAthlete = isAuthenticated === true && athleteProfile;
    const shippingFee = calculateShippingFee(cartTotalPrice, {
        authenticated: Boolean(isSkfAthlete),
    })

    const {
        pointsUsed: finalPoints,
        pointsDiscount: pointsDiscountAmount,
        maxPointsRedeemable,
    } = calculatePointsRedemption(
        cartTotalPrice,
        Number(pointsToRedeem) || 0,
        pointsBalance || 0,
        { authenticated: Boolean(isSkfAthlete) }
    )
    const cappedMaxPoints = pointsBalance !== null ? Math.min(pointsBalance, maxPointsRedeemable) : 0

    const { promoDiscount: promoDiscountAmount } = calculatePromoDiscount(
        cartTotalPrice,
        activePromo?.code
    )

    const finalTotal = cartTotalPrice + shippingFee - pointsDiscountAmount - promoDiscountAmount;

    // --- HANDLERS ---
    const applyPromo = () => {
        if (!promoInput.trim()) return;
        setPromoError('')
        if (promoInput.trim().toUpperCase() === 'SKF10') {
            setActivePromo({ code: 'SKF10', discountPct: 0.10 });
            localStorage.setItem('skf_checkout_promo', 'SKF10');
        } else {
            setPromoError('Invalid or expired promo code.');
        }
    }

    const removePromo = () => {
        setActivePromo(null);
        setPromoInput('');
        localStorage.removeItem('skf_checkout_promo');
    }

    const proceedToCheckout = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('skf_checkout_points', finalPoints.toString())
        }
        router.push('/shop/checkout')
    }

    return (
        <div className="obsidian-store" style={{ minHeight: '100dvh', color: '#fff', paddingTop: '6rem', paddingBottom: '8rem' }}>
            <div className="shop-page-wrap">

                <Link href="/shop" className="shop-back-link">
                    <ArrowLeft size={16} /> Continue Shopping
                </Link>

                <h1 className="shop-page-title">Shopping Bag</h1>

                <div className="shop-two-col">

                    {/* LEFT COLUMN: Items List */}
                    <div className="shop-col-main" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                        {/* Athlete Recognition */}
                        {isSkfAthlete ? (
                            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fff', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <UserCircle size={32} />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '1px' }}>{athleteProfile.name}</span>
                                        <span style={{ background: '#fff', color: '#000', padding: '2px 8px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>{athleteProfile.skfId}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1.5rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {athleteProfile.branch}</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Award size={12} /> {athleteProfile.belt} Belt</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ padding: '1rem 0', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                All orders are delivered directly to class/camp.
                            </div>
                        )}

                        {/* Cart Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', marginTop: '1rem' }}>
                            {cart.map(item => (
                                <div key={item.variantId} className="shop-cart-item">
                                    <div className="shop-cart-item-image">
                                        {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />}
                                    </div>

                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                                <h3 style={{ margin: 0, color: '#fff', fontFamily: 'var(--font-heading)', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{item.name}</h3>
                                                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                                            </div>
                                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Size: {item.size}</p>
                                        </div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50px', overflow: 'hidden' }}>
                                                    <button onClick={() => updateQuantity(item.variantId, Math.max(1, item.quantity - 1))} style={{ background: 'none', border: 'none', color: '#fff', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1.1rem' }}>−</button>
                                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '30px', fontSize: '0.9rem', fontWeight: 600 }}>{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.variantId, item.quantity + 1)} style={{ background: 'none', border: 'none', color: '#fff', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1.1rem' }}>+</button>
                                                </div>
                                            </div>

                                            <button onClick={() => removeFromCart(item.variantId)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'underline' }}>
                                                <Trash2 size={14} /> Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Minimalist Summary */}
                    <div className="shop-col-side">
                        <h2 style={{ margin: '0 0 2rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>Summary</h2>

                        {/* Athlete Login Prompt (if Guest) */}
                        {!isSkfAthlete && isAuthenticated === false && (
                            <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>SKF Athlete?</div>
                                <button type="button" disabled style={{ width: '100%', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.3)', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '1px', cursor: 'not-allowed' }}>
                                    <LogIn size={16} /> Login Disabled
                                </button>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Subtotal</span>
                                <span style={{ color: '#fff' }}>₹{cartTotalPrice.toLocaleString()}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Delivery</span>
                                <span style={{ color: '#fff' }}>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
                            </div>
                        </div>

                        {/* Promo / Points */}
                        <div style={{ margin: '2rem 0', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem', fontWeight: 700 }}>Promotional Code</div>
                            {activePromo ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #fff', paddingBottom: '0.5rem' }}>
                                    <span style={{ color: '#fff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>{activePromo.code} Applied</span>
                                    <button onClick={removePromo} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Remove</button>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex' }}>
                                        <input
                                            value={promoInput}
                                            onChange={e => setPromoInput(e.target.value)}
                                            placeholder="Enter code"
                                            style={{ flex: 1, background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '0.5rem 0', fontSize: '1rem', outline: 'none' }}
                                            onFocus={e => e.currentTarget.style.borderBottomColor = '#fff'}
                                            onBlur={e => e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.3)'}
                                        />
                                        <button onClick={applyPromo} style={{ background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Apply</button>
                                    </div>
                                    {promoError && <span style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block' }}>{promoError}</span>}
                                </div>
                            )}

                            {isSkfAthlete && pointsBalance !== null && pointsBalance > 0 && (
                                <div style={{ marginTop: '2rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>Loyalty Points</span>
                                        <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>{pointsBalance} pts</span>
                                    </div>
                                    <div style={{ display: 'flex' }}>
                                        <input
                                            type="number"
                                            value={pointsToRedeem}
                                            onChange={e => setPointsToRedeem(e.target.value)}
                                            max={cappedMaxPoints}
                                            step="100"
                                            placeholder="0"
                                            style={{ flex: 1, background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '0.5rem 0', fontSize: '1rem', outline: 'none' }}
                                        />
                                        <button onClick={() => setPointsToRedeem(cappedMaxPoints)} style={{ background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '1px' }}>Max</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Discounts applied */}
                        {(promoDiscountAmount > 0 || pointsDiscountAmount > 0) && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                {promoDiscountAmount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4caf50', fontSize: '0.9rem' }}>
                                        <span>Promo Discount</span>
                                        <span>−₹{promoDiscountAmount.toLocaleString()}</span>
                                    </div>
                                )}
                                {pointsDiscountAmount > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4caf50', fontSize: '0.9rem' }}>
                                        <span>Points Redeemed</span>
                                        <span>−₹{pointsDiscountAmount.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Total */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '1.5rem', color: '#fff', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>
                            <span>Total</span>
                            <span>₹{finalTotal.toLocaleString()}</span>
                        </div>

                        {/* Checkout Button */}
                        <button onClick={proceedToCheckout} className="shop-cta-pill" style={{ marginTop: '2.5rem', fontSize: '1rem' }}>
                            PROCEED TO CHECKOUT
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                            <ShieldCheck size={14} /> Secure Checkout
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
