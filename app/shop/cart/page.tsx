'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/shop/cartState'
import { ArrowLeft, Trash2, Truck, Tag, ShieldCheck, UserCircle, LogIn, Award, MapPin } from 'lucide-react'
import '../shop.css'

export default function CartPage() {
    const { cart, updateQuantity, removeFromCart, cartTotalPrice } = useCart()
    const router = useRouter()
    
    // Auth State — includes full athlete profile
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const [athleteProfile, setAthleteProfile] = useState<any>(null)
    
    // Loyalty Points State
    const [pointsBalance, setPointsBalance] = useState<number | null>(null)
    const [pointsToRedeem, setPointsToRedeem] = useState<number | string>(0)

    // Promo Code State
    const [promoInput, setPromoInput] = useState('')
    const [activePromo, setActivePromo] = useState<{code: string, discountPct: number} | null>(null)
    const [promoError, setPromoError] = useState('')
    
    useEffect(() => {
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
    }, [])

    if (cart.length === 0) {
        return (
            <div className="obsidian-store" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h1 className="obsidian-header__title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Cart Empty</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2rem' }}>Your armory is currently empty.</p>
                <Link href="/shop" className="obsidian-btn-add" style={{ textDecoration: 'none', width: 'auto', padding: '1rem 3rem' }}>
                    RETURN TO STORE
                </Link>
            </div>
        )
    }

    // --- CALCULATIONS ---
    const isSkfAthlete = isAuthenticated === true && athleteProfile;
    const FREE_SHIPPING_THRESHOLD = 5000;
    
    const amountToFreeShipping = isSkfAthlete ? 0 : Math.max(0, FREE_SHIPPING_THRESHOLD - cartTotalPrice)
    const shippingFee = (isSkfAthlete || cartTotalPrice >= FREE_SHIPPING_THRESHOLD) ? 0 : 250;
    
    // Points max logic
    const maxDiscountVal = cartTotalPrice * 0.10
    const maxPointsRedeemable = Math.floor(maxDiscountVal / 25) * 100
    const cappedMaxPoints = pointsBalance !== null ? Math.min(pointsBalance, maxPointsRedeemable) : 0

    const ptsNum = Number(pointsToRedeem) || 0
    const finalPoints = Math.min(ptsNum, cappedMaxPoints)
    const pointsDiscountAmount = Math.floor(finalPoints / 100) * 25

    // Promo logic
    const promoDiscountAmount = activePromo ? cartTotalPrice * activePromo.discountPct : 0;
    
    // GST Breakdown
    const taxAmount = cartTotalPrice - (cartTotalPrice / 1.18); 

    // Final Total
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
            localStorage.setItem('skf_checkout_shipping', shippingFee.toString())
        }
        router.push('/shop/checkout')
    }

    return (
        <div className="obsidian-store">
            <div className="obsidian-container">
                
                <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 600, marginBottom: '2rem', transition: 'color 0.2s', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                    <ArrowLeft size={16} />
                    Continue Shopping
                </Link>

                <h1 className="obsidian-header__title" style={{ fontSize: '3rem', textAlign: 'left', marginBottom: '3rem' }}>Your Cart</h1>
                
                <div className="obsidian-detail-layout" style={{ gridTemplateColumns: '1.5fr 1fr' }}>
                    
                    {/* LEFT COLUMN: Items List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* Athlete Recognition Banner OR Shipping Progress */}
                        {isSkfAthlete ? (
                            <div style={{ 
                                background: 'linear-gradient(135deg, rgba(255,183,3,0.06) 0%, rgba(76,175,80,0.06) 100%)', 
                                border: '1px solid rgba(255,183,3,0.2)', 
                                borderRadius: '16px', padding: '1.25rem 1.5rem', 
                                display: 'flex', alignItems: 'center', gap: '1.25rem'
                            }}>
                                {/* Avatar circle */}
                                <div style={{ 
                                    width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                                    background: 'linear-gradient(135deg, rgba(255,183,3,0.2), rgba(255,183,3,0.05))',
                                    border: '1px solid rgba(255,183,3,0.3)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    <UserCircle size={24} color="var(--gold, #ffb703)" />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '4px' }}>
                                        <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>
                                            {athleteProfile.name}
                                        </span>
                                        <span style={{ 
                                            background: 'rgba(255,183,3,0.12)', border: '1px solid rgba(255,183,3,0.25)',
                                            padding: '2px 8px', borderRadius: '50px', fontSize: '0.65rem',
                                            fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px',
                                            color: 'var(--gold, #ffb703)'
                                        }}>
                                            {athleteProfile.skfId}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', fontWeight: 600 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            <MapPin size={11} /> {athleteProfile.branch}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                            <Award size={11} /> {athleteProfile.belt} Belt
                                        </span>
                                    </div>
                                </div>
                                <div style={{ 
                                    display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px',
                                    flexShrink: 0 
                                }}>
                                    <span style={{ color: '#4caf50', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        Free Dojo Pickup
                                    </span>
                                    <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem' }}>
                                        Collect from class
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem', color: amountToFreeShipping === 0 ? '#4caf50' : '#fff', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem' }}>
                                    <Truck size={18} />
                                    {amountToFreeShipping === 0 
                                        ? <span>You've unlocked Free Premium Shipping!</span> 
                                        : <span>Add ₹{amountToFreeShipping.toLocaleString()} more for Free Shipping</span>
                                    }
                                </div>
                                <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '50px', overflow: 'hidden' }}>
                                    <div style={{ width: `${Math.min(100, (cartTotalPrice / FREE_SHIPPING_THRESHOLD) * 100)}%`, height: '100%', background: amountToFreeShipping === 0 ? '#4caf50' : 'var(--gold, #ffb703)', transition: 'width 0.5s ease-out', borderRadius: '50px' }}></div>
                                </div>
                            </div>
                        )}

                        {/* Cart Items */}
                        {cart.map(item => (
                            <div key={item.variantId} className="obsidian-cart-item">
                                <div style={{ width: '90px', height: '90px', position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
                                    <Image src={item.image || '/images/placeholder.jpg'} alt={item.name} fill style={{ objectFit: 'cover' }} />
                                </div>
                                
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <h3 style={{ margin: '0 0 0.3rem', color: '#fff', fontFamily: 'var(--font-heading)', fontSize: '1.05rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.name}</h3>
                                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Size: {item.size}</p>
                                    
                                    <p style={{ margin: '0.4rem 0 0', display: 'flex', alignItems: 'center', gap: '4px', color: 'rgba(76,175,80,0.7)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
                                        {isSkfAthlete ? (
                                            <><ShieldCheck size={11} /> Ready for Dojo Pickup</>
                                        ) : (
                                            <><Truck size={11} /> Delivery: 3-5 Business Days</>
                                        )}
                                    </p>

                                    <button onClick={() => removeFromCart(item.variantId)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', padding: 0, marginTop: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color = '#ff6b6b'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
                                        <Trash2 size={12} /> Remove
                                    </button>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', flexShrink: 0 }}>
                                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                                    <div className="obsidian-stepper" style={{ transform: 'scale(0.8)', transformOrigin: 'right center' }}>
                                        <button className="obsidian-stepper__btn" onClick={() => updateQuantity(item.variantId, Math.max(1, item.quantity - 1))}>−</button>
                                        <span className="obsidian-stepper__val">{item.quantity}</span>
                                        <button className="obsidian-stepper__btn" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>+</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* RIGHT COLUMN: Summary */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        {/* Athlete Login Prompt (if Guest) */}
                        {!isSkfAthlete && isAuthenticated === false && (
                            <div style={{ background: 'rgba(255,183,3,0.04)', border: '1px solid rgba(255,183,3,0.15)', borderRadius: '16px', padding: '1.5rem' }}>
                                 <h4 style={{ margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', color: 'var(--gold, #ffb703)', fontSize: '0.8rem', letterSpacing: '1px', fontWeight: 800 }}>
                                     <UserCircle size={16} /> SKF Athlete?
                                 </h4>
                                 <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                                     Login to redeem tournament points and get free dojo pickup.
                                 </p>
                                 <Link href="/portal/login?callbackUrl=/shop/cart" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'rgba(255,183,3,0.1)', border: '1px solid rgba(255,183,3,0.3)', color: 'var(--gold, #ffb703)', padding: '0.8rem', borderRadius: '12px', textDecoration: 'none', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px', transition: 'all 0.3s' }}>
                                    <LogIn size={14} /> Login to Athlete Portal
                                 </Link>
                            </div>
                        )}

                        {/* Promo Code */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.25rem' }}>
                             <h4 style={{ margin: '0 0 0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', letterSpacing: '1px', fontWeight: 700 }}>
                                 <Tag size={14} /> Promo Code
                             </h4>
                             {activePromo ? (
                                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(76, 175, 80, 0.08)', padding: '0.7rem 1rem', borderRadius: '10px', border: '1px solid rgba(76, 175, 80, 0.2)' }}>
                                     <span style={{ color: '#4caf50', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}>{activePromo.code} Applied</span>
                                     <button onClick={removePromo} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>Remove</button>
                                 </div>
                             ) : (
                                 <div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input 
                                            value={promoInput}
                                            onChange={e => setPromoInput(e.target.value)}
                                            placeholder="Enter promo code" 
                                            className="obsidian-input" 
                                            style={{ padding: '0.7rem 1rem', fontSize: '0.9rem' }}
                                        />
                                        <button onClick={applyPromo} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '0 1.5rem', borderRadius: '12px', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.3s' }}>Apply</button>
                                    </div>
                                    {promoError && <span style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '0.5rem', display: 'block', fontWeight: 600 }}>{promoError}</span>}
                                 </div>
                             )}
                        </div>

                        {/* Order Summary */}
                        <div className="obsidian-summary-card" style={{ position: 'relative', top: '0' }}>
                            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.6)', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '1rem', fontWeight: 700 }}>Order Summary</h2>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, fontSize: '0.9rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
                                    <span style={{ color: '#fff' }}>₹{cartTotalPrice.toLocaleString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Shipping {isSkfAthlete ? '(Dojo Pickup)' : ''}</span>
                                    <span style={{ color: shippingFee === 0 ? '#4caf50' : '#fff' }}>
                                        {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                                    </span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>GST (18%)</span>
                                    <span>Included (₹{taxAmount.toFixed(0)})</span>
                                </div>
                            </div>

                            {/* Loyalty Points Widget */}
                            {isSkfAthlete && pointsBalance !== null && pointsBalance > 0 && (
                                <div style={{ background: 'rgba(255,183,3,0.05)', border: '1px solid rgba(255,183,3,0.15)', padding: '1rem', borderRadius: '12px', margin: '1.25rem 0' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                        <span style={{ color: 'var(--gold, #ffb703)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Loyalty Points</span>
                                        <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{pointsBalance} pts</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input 
                                            type="number" 
                                            value={pointsToRedeem}
                                            onChange={e => setPointsToRedeem(e.target.value)}
                                            max={cappedMaxPoints}
                                            step="100"
                                            placeholder="Points to redeem"
                                            className="obsidian-input"
                                            style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }}
                                        />
                                        <button onClick={() => setPointsToRedeem(cappedMaxPoints)} style={{ background: 'rgba(255,183,3,0.1)', border: '1px solid rgba(255,183,3,0.3)', color: 'var(--gold)', padding: '0 1rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Use Max</button>
                                    </div>
                                </div>
                            )}

                            {/* Discounts applied */}
                            {(promoDiscountAmount > 0 || pointsDiscountAmount > 0) && (
                                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem', marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    {promoDiscountAmount > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4caf50', fontWeight: 700, fontSize: '0.85rem' }}>
                                            <span>Promo ({activePromo?.code})</span>
                                            <span>−₹{promoDiscountAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {pointsDiscountAmount > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4caf50', fontWeight: 700, fontSize: '0.85rem' }}>
                                            <span>Points Redeemed</span>
                                            <span>−₹{pointsDiscountAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Total */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '1.4rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                <span>Total</span>
                                <span style={{ color: 'var(--gold, #ffb703)' }}>₹{finalTotal.toLocaleString()}</span>
                            </div>

                            {/* Checkout Button */}
                            {isAuthenticated ? (
                                <button onClick={proceedToCheckout} className="obsidian-btn-add" style={{ marginTop: '2rem' }}>
                                    PROCEED TO CHECKOUT
                                </button>
                            ) : (
                                <button onClick={() => router.push('/portal/login?callbackUrl=/shop/cart')} className="obsidian-btn-add" style={{ marginTop: '2rem', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', border: '1px solid rgba(255,183,3,0.3)' }}>
                                    <LogIn size={16} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} />
                                    LOGIN TO PLACE ORDER
                                </button>
                            )}
                            
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '1rem', color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                                <ShieldCheck size={12} /> Secure Checkout
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
