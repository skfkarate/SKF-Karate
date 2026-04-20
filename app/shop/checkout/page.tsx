'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCart } from '@/lib/shop/cartState'
import { ArrowLeft, ShieldCheck, MapPin, UserCheck } from 'lucide-react'
import '../shop.css'

const guestCheckoutSchema = z.object({
    fullName: z.string().min(2, 'Name is required'),
    phone: z.string().regex(/^\+91[0-9]{10}$/, 'Must be +91 followed by 10 digits'),
    addressLine1: z.string().min(5, 'Address is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().regex(/^[0-9]{6}$/, 'Must be 6 digits')
})

type GuestCheckoutFormData = z.infer<typeof guestCheckoutSchema>

export default function CheckoutPage() {
    const { cart, cartTotalPrice, clearCart } = useCart()
    const router = useRouter()
    
    const [submitting, setSubmitting] = useState(false)
    
    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [athleteProfile, setAthleteProfile] = useState<any>(null)

    // Loaded Values from Cart
    const [pointsToRedeem, setPointsToRedeem] = useState(0)
    const [promoCode, setPromoCode] = useState<string | null>(null)
    const [shippingFee, setShippingFee] = useState(0)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const pts = localStorage.getItem('skf_checkout_points')
            if (pts) setPointsToRedeem(Number(pts))
            
            const promo = localStorage.getItem('skf_checkout_promo')
            if (promo) setPromoCode(promo)

            const shipping = localStorage.getItem('skf_checkout_shipping')
            if (shipping) setShippingFee(Number(shipping))

            fetch('/api/auth/me')
                .then(res => res.json())
                .then(data => {
                    if (data.authenticated && data.user) {
                        setIsAuthenticated(true)
                        setAthleteProfile(data.user)
                        setShippingFee(0) // Override shipping safely to 0 for Athletes
                    } else {
                        // Velvet Rope: unauthenticated users must login first
                        router.push('/portal/login?callbackUrl=/shop/cart')
                    }
                })
                .catch(() => {})
        }
    }, [])

    // Math Match
    const pointsDiscount = Math.floor(pointsToRedeem / 100) * 25
    const promoDiscount = promoCode ? cartTotalPrice * 0.10 : 0 
    const taxAmount = cartTotalPrice - (cartTotalPrice / 1.18); 
    const finalTotal = cartTotalPrice + shippingFee - pointsDiscount - promoDiscount

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<GuestCheckoutFormData>({
        resolver: zodResolver(guestCheckoutSchema),
        defaultValues: { phone: '+91' }
    })

    const handlePincodeBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const pin = e.target.value
        if (pin.length === 6) {
            try {
                const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`)
                const data = await res.json()
                if (data[0].Status === 'Success') {
                    const postOffice = data[0].PostOffice[0]
                    setValue('city', postOffice.District)
                    setValue('state', postOffice.State)
                }
            } catch (err) {
                console.error('Failed to fetch pincode details')
            }
        }
    }

    const processOrderBypass = async (addressPayload: any) => {
        setSubmitting(true)

        try {
            const skfId = athleteProfile?.skfId || 'GUEST'

            const verifyRes = await fetch('/api/shop/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentBypass: true, // Secure flag telling backend Razorpay is intentionally skipped
                    skfId: skfId,
                    items: cart,
                    total: finalTotal,
                    discount: pointsDiscount + promoDiscount,
                    pointsUsed: pointsToRedeem,
                    address: addressPayload
                })
            })

            const verifyData = await verifyRes.json()
            
            if (verifyData.success) {
                clearCart()
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('skf_checkout_points')
                    localStorage.removeItem('skf_checkout_promo')
                    localStorage.removeItem('skf_checkout_shipping')
                }
                router.push('/shop/orders?success=true')
            } else {
                alert('Order creation failed!')
                setSubmitting(false)
            }

        } catch (e) {
            console.error(e)
            alert('Something went wrong during checkout.')
            setSubmitting(false)
        }
    }

    const onGuestSubmit = async (data: GuestCheckoutFormData) => {
        await processOrderBypass(data)
    }

    const onAthleteSubmit = async () => {
        const athleteAddressMock = {
            fullName: athleteProfile.name,
            phone: athleteProfile.phone,
            addressLine1: 'CLASS PICKUP',
            addressLine2: `Branch: ${athleteProfile.branch}`,
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '000000'
        }
        await processOrderBypass(athleteAddressMock)
    }

    if (cart.length === 0) {
        return (
            <div className="obsidian-store" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                <h1 className="obsidian-header__title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Cart Empty</h1>
                <Link href="/shop" className="obsidian-btn-add" style={{ textDecoration: 'none', width: 'auto', padding: '1rem 3rem', marginTop: '2rem' }}>
                    RETURN TO STORE
                </Link>
            </div>
        )
    }

    return (
        <div className="obsidian-store">
            <div className="obsidian-container">
                
                <Link href="/shop/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 600, marginBottom: '2rem', transition: 'color 0.2s', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                    <ArrowLeft size={16} />
                    Back to Cart
                </Link>

                <h1 className="obsidian-header__title" style={{ fontSize: '3rem', textAlign: 'left', marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ShieldCheck size={40} color="var(--gold, #ffb703)" /> Secure Checkout
                </h1>
                
                <div className="obsidian-detail-layout" style={{ gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)' }}>
                    
                    {/* LEFT SECTION: Contextual Form vs Unified View */}
                    <div>
                        {isAuthenticated && athleteProfile ? (
                            <div className="obsidian-summary-card" style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--gold, #ffb703)', marginBottom: '1.5rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    <UserCheck size={28} /> Athlete Profile Synced
                                </div>
                                <h3 style={{ margin: '0 0 1.5rem', fontSize: '1.8rem', color: '#fff', fontFamily: 'var(--font-heading)' }}>{athleteProfile.name}</h3>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ padding: '1.5rem', background: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>Primary Contact</div>
                                        <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 600 }}>{athleteProfile.phone}</div>
                                    </div>

                                    <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0) 100%)', border: '1px solid rgba(76, 175, 80, 0.3)', borderRadius: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: '#4caf50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem', fontWeight: 800 }}>
                                            <MapPin size={16} /> Fulfillment Method
                                        </div>
                                        <div style={{ fontSize: '1.2rem', color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span>CLASS PICKUP</span>
                                            <span style={{ fontSize: '0.9rem', color: '#4caf50' }}>FREE</span>
                                        </div>
                                        <div style={{ marginTop: '0.5rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                                            Branch: <strong style={{ color: '#fff' }}>{athleteProfile.branch}</strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onGuestSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="obsidian-cart-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                                    <h3 style={{ margin: '0 0 1rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>Shipping Intelligence</h3>
                                    
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label className="obsidian-label">Full Name</label>
                                        <input {...register('fullName')} className="obsidian-input" />
                                        {errors.fullName && <span style={{ color: 'var(--crimson, #d62828)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block', fontWeight: 800, textTransform: 'uppercase' }}>{errors.fullName.message}</span>}
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <label className="obsidian-label">Contact Number</label>
                                        <input {...register('phone')} placeholder="+91" className="obsidian-input" />
                                        {errors.phone && <span style={{ color: 'var(--crimson, #d62828)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block', fontWeight: 800, textTransform: 'uppercase' }}>{errors.phone.message}</span>}
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <label className="obsidian-label">Pincode (Auto-fills City/State)</label>
                                        <input {...register('pincode')} onBlur={handlePincodeBlur} maxLength={6} className="obsidian-input" />
                                        {errors.pincode && <span style={{ color: 'var(--crimson, #d62828)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block', fontWeight: 800, textTransform: 'uppercase' }}>{errors.pincode.message}</span>}
                                    </div>

                                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                                        <div style={{ flex: 1 }}>
                                            <label className="obsidian-label">City</label>
                                            <input {...register('city')} className="obsidian-input" />
                                            {errors.city && <span style={{ color: 'var(--crimson, #d62828)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block', fontWeight: 800, textTransform: 'uppercase' }}>{errors.city.message}</span>}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <label className="obsidian-label">State</label>
                                            <input {...register('state')} className="obsidian-input" />
                                            {errors.state && <span style={{ color: 'var(--crimson, #d62828)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block', fontWeight: 800, textTransform: 'uppercase' }}>{errors.state.message}</span>}
                                        </div>
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <label className="obsidian-label">Address Line 1</label>
                                        <input {...register('addressLine1')} className="obsidian-input" />
                                        {errors.addressLine1 && <span style={{ color: 'var(--crimson, #d62828)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block', fontWeight: 800, textTransform: 'uppercase' }}>{errors.addressLine1.message}</span>}
                                    </div>

                                    <div>
                                        <label className="obsidian-label">Address Line 2 (Optional)</label>
                                        <input {...register('addressLine2')} className="obsidian-input" />
                                    </div>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* RIGHT SECTION: Order Digest */}
                    <div>
                         <div className="obsidian-summary-card">
                            <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '2px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>Order Digest</h2>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                {cart.map(item => (
                                    <div key={item.variantId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        <span><strong style={{ color: '#fff' }}>{item.quantity}x</strong> {item.name} ({item.size})</span>
                                        <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>

                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Subtotal</span>
                                        <span>₹{cartTotalPrice.toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Shipping {isAuthenticated ? '(Dojo)' : ''}</span>
                                        <span style={{ color: shippingFee === 0 ? '#4caf50' : 'inherit' }}>
                                            {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Est. GST (18%)</span>
                                        <span>Included (₹{taxAmount.toFixed(0)})</span>
                                    </div>
                                </div>
                                
                                {(pointsDiscount > 0 || promoDiscount > 0) && (
                                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dotted rgba(255,255,255,0.2)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {promoDiscount > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4caf50', fontWeight: 800 }}>
                                                <span>Promo ({promoCode})</span>
                                                <span>−₹{promoDiscount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {pointsDiscount > 0 && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4caf50', fontWeight: 800 }}>
                                                <span>Loyalty Discount</span>
                                                <span>−₹{pointsDiscount.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '1.5rem', fontWeight: 900, color: '#fff', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    <span>Total Payable</span>
                                    <span style={{ color: 'var(--gold, #ffb703)' }}>₹{finalTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            {isAuthenticated ? (
                                <button 
                                    type="button"
                                    onClick={onAthleteSubmit}
                                    disabled={submitting}
                                    className="obsidian-btn-add"
                                    style={{ marginTop: '2.5rem' }}
                                >
                                    {submitting ? 'CONFIRMING...' : `CONFIRM DOJO PICKUP`}
                                </button>
                            ) : (
                                <button 
                                    type="button"
                                    onClick={handleSubmit(onGuestSubmit)}
                                    disabled={submitting}
                                    className="obsidian-btn-add"
                                    style={{ marginTop: '2.5rem' }}
                                >
                                    {submitting ? 'CONFIRMING...' : `PLACE ORDER (₹${finalTotal.toLocaleString()})`}
                                </button>
                            )}

                            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Payment processing will be handled at Fulfillment.
                            </p>
                         </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
