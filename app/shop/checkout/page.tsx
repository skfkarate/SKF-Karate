'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCart } from '@/lib/shop/cartState'

const checkoutSchema = z.object({
    fullName: z.string().min(2, 'Name is required'),
    phone: z.string().regex(/^\+91[0-9]{10}$/, 'Must be +91 followed by 10 digits'),
    addressLine1: z.string().min(5, 'Address is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().regex(/^[0-9]{6}$/, 'Must be 6 digits')
})

type CheckoutFormData = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
    const { cart, cartTotalPrice, clearCart } = useCart()
    const router = useRouter()
    
    const [submitting, setSubmitting] = useState(false)
    const [pointsToRedeem, setPointsToRedeem] = useState(0)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const pts = localStorage.getItem('skf_checkout_points')
            if (pts) setPointsToRedeem(Number(pts))
        }
    }, [])

    const pointsDiscount = Math.floor(pointsToRedeem / 100) * 25
    const finalTotal = cartTotalPrice - pointsDiscount

    const { register, handleSubmit, setValue, formState: { errors } } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
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

    const onSubmit = async (data: CheckoutFormData) => {
        setSubmitting(true)
        try {
            // Include Razorpay Script dynamically
            const loadScript = () => new Promise((resolve) => {
                const script = document.createElement('script')
                script.src = 'https://checkout.razorpay.com/v1/checkout.js'
                script.onload = () => resolve(true)
                script.onerror = () => resolve(false)
                document.body.appendChild(script)
            })

            const isLoaded = await loadScript()
            if (!isLoaded) {
                alert('Razorpay SDK failed to load. Are you online?')
                setSubmitting(false)
                return
            }

            // Create Order
            const res = await fetch('/api/shop/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: finalTotal })
            })
            const orderData = await res.json()

            if (!orderData.id) {
                throw new Error('Order creation failed')
            }

            const options = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'SKF Karate',
                description: 'SKF Merchandise Store',
                order_id: orderData.id,
                prefill: {
                    name: data.fullName,
                    contact: data.phone
                },
                theme: { color: '#dc3545' },
                handler: async function (response: any) {
                    // Verify Payment
                    const verifyRes = await fetch('/api/shop/orders', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            skfId: localStorage.getItem('skf_active_user') || 'GUEST', // We usually decode from session but JWT is http-only. The server accepts GUEST if skfId is not provided from auth context.
                            items: cart,
                            total: finalTotal,
                            discount: pointsDiscount,
                            pointsUsed: pointsToRedeem,
                            address: data
                        })
                    })

                    const verifyData = await verifyRes.json()
                    
                    if (verifyData.success) {
                        clearCart()
                        localStorage.removeItem('skf_checkout_points')
                        router.push('/shop/orders?success=true')
                    } else {
                        alert('Payment verification failed!')
                        setSubmitting(false)
                    }
                },
                modal: {
                    ondismiss: function () {
                        setSubmitting(false)
                    }
                }
            }

            const rzp = new (window as any).Razorpay(options)
            rzp.open()

        } catch (e) {
            console.error(e)
            alert('Something went wrong during checkout.')
            setSubmitting(false)
        }
    }

    if (cart.length === 0) {
        return <div style={{ padding: '120px 2rem', textAlign: 'center', color: '#fff' }}>Your cart is empty.</div>
    }

    return (
        <div style={{ minHeight: '100vh', padding: '120px 2rem 4rem', background: '#050505', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1.5fr)', gap: '3rem' }}>
                
                {/* Form Section */}
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 2rem', color: 'var(--gold)' }}>Checkout Details</h1>
                    
                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Full Name</label>
                            <input {...register('fullName')} style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
                            {errors.fullName && <span style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>{errors.fullName.message}</span>}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Phone Number</label>
                            <input {...register('phone')} placeholder="+91" style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
                            {errors.phone && <span style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>{errors.phone.message}</span>}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Pincode</label>
                            <input {...register('pincode')} onBlur={handlePincodeBlur} maxLength={6} style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
                            {errors.pincode && <span style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>{errors.pincode.message}</span>}
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>City</label>
                                <input {...register('city')} style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
                                {errors.city && <span style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>{errors.city.message}</span>}
                            </div>
                            <div style={{ flex: 1 }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>State</label>
                                <input {...register('state')} style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
                                {errors.state && <span style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>{errors.state.message}</span>}
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Address Line 1</label>
                            <input {...register('addressLine1')} style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
                            {errors.addressLine1 && <span style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '0.2rem', display: 'block' }}>{errors.addressLine1.message}</span>}
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#ccc' }}>Address Line 2 (Optional)</label>
                            <input {...register('addressLine2')} style={{ width: '100%', padding: '0.8rem', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
                        </div>

                    </form>
                </div>

                {/* Summary Section */}
                <div>
                     <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '2rem', position: 'sticky', top: '100px' }}>
                        <h2 style={{ margin: '0 0 1.5rem', fontSize: '1.2rem', borderBottom: '1px solid #222', paddingBottom: '1rem' }}>Your Items</h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                            {cart.map(item => (
                                <div key={item.variantId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#ccc' }}>
                                    <span>{item.quantity}x {item.name} ({item.size})</span>
                                    <span>₹{item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ borderTop: '1px solid #222', paddingTop: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#aaa' }}>
                                <span>Subtotal</span>
                                <span>₹{cartTotalPrice}</span>
                            </div>
                            
                            {pointsDiscount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: '#4caf50' }}>
                                    <span>Points Discount</span>
                                    <span>−₹{pointsDiscount}</span>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #333', fontSize: '1.3rem', fontWeight: 'bold', color: '#fff' }}>
                                <span>Total Payable</span>
                                <span style={{ color: 'var(--gold)' }}>₹{finalTotal}</span>
                            </div>
                        </div>

                        <button 
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            disabled={submitting}
                            style={{ 
                                width: '100%', background: submitting ? '#666' : '#dc3545', color: '#fff', 
                                border: 'none', padding: '1rem', borderRadius: '8px', 
                                fontSize: '1.1rem', fontWeight: 'bold', marginTop: '2rem', 
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s'
                            }}
                        >
                            {submitting ? 'Processing...' : `Pay ₹${finalTotal} via Razorpay`}
                        </button>
                     </div>
                </div>

            </div>
        </div>
    )
}
