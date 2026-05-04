'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import ShopCheckoutSkeleton from '@/components/skeletons/ShopCheckoutSkeleton'
import { useCart } from '@/lib/shop/cartState'
import { SHOP_IMAGE_FALLBACK } from '@/lib/shop/productImages'
import {
    calculatePointsRedemption,
    calculatePromoDiscount,
    calculateShippingFee,
} from '@/lib/shop/logic'
import {
    isValidIndianMobileNumber,
    normalizeIndianMobileNumber,
    SHOP_PHONE_ERROR_MESSAGE,
} from '@/lib/shop/phone'
import { ArrowLeft, MapPin, UserCheck, Check, UploadCloud, ShoppingBag, ArrowRight } from 'lucide-react'
import { flushCheckoutQueue, queueCheckoutSubmission } from './checkoutQueue'
import '../shop.css'

const guestCheckoutSchema = z.object({
    parentName: z.string().min(2, 'Parent name is required'),
    studentName: z.string().min(2, 'Student name is required'),
    age: z.string().min(1, 'Age is required'),
    phone: z
        .string()
        .max(64, SHOP_PHONE_ERROR_MESSAGE)
        .refine(isValidIndianMobileNumber, SHOP_PHONE_ERROR_MESSAGE)
        .transform((value) => normalizeIndianMobileNumber(value) ?? value),
})

type GuestCheckoutFormData = z.infer<typeof guestCheckoutSchema>

type CheckoutAddressPayload = {
    fullName: string
    parentName?: string
    studentName?: string
    age?: string
    phone: string
    addressLine1: string
    addressLine2?: string
    city: string
    state: string
    pincode: string
}

type AthleteProfile = {
    name: string
    phone: string
    branch: string
}

type CheckoutStep = 'DELIVERY' | 'PAYMENT' | 'SUCCESS'

export default function CheckoutPage() {
    const { cart, cartTotalPrice, clearCart } = useCart()

    const [step, setStep] = useState<CheckoutStep>('DELIVERY')
    const [submitting, setSubmitting] = useState(false)

    const [guestData, setGuestData] = useState<GuestCheckoutFormData | null>(null)
    const [paymentProofBase64, setPaymentProofBase64] = useState('')
    const [paymentProofName, setPaymentProofName] = useState('')
    const [successOrderId, setSuccessOrderId] = useState<string | null>(null)

    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const [athleteProfile, setAthleteProfile] = useState<AthleteProfile | null>(null)

    // Loaded Values from Cart
    const [pointsToRedeem, setPointsToRedeem] = useState(0)
    const [promoCode, setPromoCode] = useState<string | null>(null)

    useEffect(() => {
        flushCheckoutQueue()
        const id = window.setTimeout(() => {
        if (typeof window !== 'undefined') {
            const pts = localStorage.getItem('skf_checkout_points')
            if (pts) setPointsToRedeem(Number(pts))

            const promo = localStorage.getItem('skf_checkout_promo')
            if (promo) setPromoCode(promo)

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
        }
        }, 0)
        return () => window.clearTimeout(id)
    }, [])

    const shippingFee = calculateShippingFee(cartTotalPrice, {
        authenticated: Boolean(isAuthenticated && athleteProfile),
    })
    const { promoDiscount } = calculatePromoDiscount(cartTotalPrice, promoCode)
    const { pointsUsed, pointsDiscount } = calculatePointsRedemption(
        cartTotalPrice,
        pointsToRedeem,
        Number.MAX_SAFE_INTEGER,
        { authenticated: Boolean(isAuthenticated && athleteProfile) }
    )
    const finalTotal = cartTotalPrice + shippingFee - pointsDiscount - promoDiscount

    const { register, handleSubmit, formState: { errors } } = useForm<GuestCheckoutFormData>({
        resolver: zodResolver(guestCheckoutSchema),
        defaultValues: { phone: '+91' }
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB')
                return
            }
            const reader = new FileReader()
            reader.onloadend = () => {
                setPaymentProofBase64(reader.result as string)
                setPaymentProofName(file.name)
            }
            reader.readAsDataURL(file)
        }
    }

    const onDeliverySubmit = (data: GuestCheckoutFormData) => {
        setGuestData(data)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setStep('PAYMENT')
    }

    const onDeliveryContinueAthlete = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setStep('PAYMENT')
    }

    const submitFinalOrder = async () => {
        if (!paymentProofBase64) {
            alert('Please upload a screenshot of your payment to proceed.')
            return
        }

        let addressPayload: CheckoutAddressPayload
        if (isAuthenticated && athleteProfile) {
            addressPayload = {
                fullName: athleteProfile.name,
                phone: athleteProfile.phone,
                addressLine1: 'CLASS PICKUP',
                addressLine2: `Branch: ${athleteProfile.branch}`,
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '000000'
            }
        } else if (guestData) {
            addressPayload = {
                fullName: guestData.parentName,
                parentName: guestData.parentName,
                studentName: guestData.studentName,
                age: guestData.age,
                phone: guestData.phone,
                addressLine1: 'SKF FREE TRAINING CAMP PICKUP',
                addressLine2: `Student: ${guestData.studentName} (Age: ${guestData.age}) | Delivery to training camp/class`,
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '000000',
            }
        } else {
            alert('Missing delivery details.')
            setStep('DELIVERY')
            return
        }

        setSubmitting(true)

        try {
            const verifyRes = await fetch('/api/shop/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paymentProofBase64,
                    paymentProofName: paymentProofName || undefined,
                    items: cart,
                    promoCode: promoCode || undefined,
                    pointsUsed,
                    address: addressPayload,
                }),
            })

            const verifyData = await verifyRes.json().catch(() => null)
            if (!verifyRes.ok || !verifyData?.success) {
                const errorMessage = verifyData?.error || verifyData?.message || 'Order creation failed.'
                if (verifyRes.status >= 500) {
                    throw new Error(errorMessage)
                }
                alert(errorMessage)
                setSubmitting(false)
                return
            }

            clearCart()
            if (typeof window !== 'undefined') {
                localStorage.removeItem('skf_checkout_points')
                localStorage.removeItem('skf_checkout_promo')
            }

            setSuccessOrderId(verifyData.orderId)
            window.scrollTo({ top: 0, behavior: 'smooth' })
            setStep('SUCCESS')
        } catch (e) {
            console.error('Submission error:', e)
            queueCheckoutSubmission({
                paymentProofBase64,
                paymentProofName: paymentProofName || undefined,
                items: cart,
                promoCode: promoCode || undefined,
                pointsUsed,
                address: addressPayload,
            })

            clearCart()
            if (typeof window !== 'undefined') {
                localStorage.removeItem('skf_checkout_points')
                localStorage.removeItem('skf_checkout_promo')
            }

            setSuccessOrderId('QUEUED-PENDING-NETWORK')
            window.scrollTo({ top: 0, behavior: 'smooth' })
            setStep('SUCCESS')
            alert('Network error detected. Your order has been securely saved locally and will be automatically submitted once your connection is restored.')
            setSubmitting(false)
        }
    }

    if (step === 'SUCCESS') {
        return (
            <div className="obsidian-store" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '90dvh', paddingTop: '4rem' }}>
                <div className="shop-page-wrap" style={{ maxWidth: '800px', width: '100%', animation: 'fadeIn 0.8s ease' }}>
                    <div className="obsidian-summary-card" style={{
                        textAlign: 'center',
                        padding: '5rem 2rem',
                        background: 'rgba(255, 255, 255, 0.01)',
                        backdropFilter: 'blur(40px)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '32px'
                    }}>
                        {/* Success Icon with Glow */}
                        <div style={{
                            width: '120px',
                            height: '120px',
                            background: 'linear-gradient(135deg, var(--gold, #ffb703) 0%, #cc9200 100%)',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 3rem',
                            color: '#000',
                            boxShadow: '0 20px 60px rgba(255, 183, 3, 0.25)',
                            position: 'relative'
                        }}>
                            <Check size={56} strokeWidth={3} />
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: '50%', border: '2px solid var(--gold, #ffb703)', animation: 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite', opacity: 0.5 }}></div>
                        </div>

                        <div style={{ color: 'var(--gold, #ffb703)', fontWeight: 800, letterSpacing: '5px', textTransform: 'uppercase', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                            Order Received
                        </div>

                        <h1 style={{
                            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
                            color: '#fff',
                            fontFamily: 'var(--font-heading)',
                            textTransform: 'uppercase',
                            marginBottom: '2rem',
                            letterSpacing: '-1px',
                            lineHeight: 1
                        }}>
                            You&apos;re All Set
                        </h1>

                        <div style={{
                            maxWidth: '550px',
                            margin: '0 auto 4rem',
                            padding: '2rem',
                            borderRadius: '24px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)'
                        }}>
                            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: '2rem', fontWeight: 300 }}>
                                Your order <strong style={{ color: '#fff', fontWeight: 700, letterSpacing: '1px' }}>#{successOrderId}</strong> has been queued for verification.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#4caf50', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                        <Check size={14} color="#fff" strokeWidth={4} />
                                    </div>
                                    <div>
                                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Submission Successful</div>
                                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Your order details and payment proof have been saved.</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.4)' }}></div>
                                    </div>
                                    <div>
                                        <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Manual Verification</div>
                                        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>Admin will verify your payment screenshot within 24-48 hours.</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                            <Link href="/shop" className="shop-cta-pill" style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                maxWidth: '350px',
                                textDecoration: 'none'
                            }}>
                                <ShoppingBag size={20} />
                                RETURN TO STORE
                            </Link>

                            <Link href="/shop/orders" style={{
                                color: 'rgba(255,255,255,0.4)',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
                            >
                                VIEW MY ORDERS <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
                <style jsx>{`
                    @keyframes ping {
                        75%, 100% { transform: scale(2); opacity: 0; }
                    }
                    @media (max-width: 600px) {
                        .obsidian-summary-card { padding: 4rem 1.5rem !important; }
                        h1 { font-size: 2.5rem !important; }
                    }
                `}</style>
            </div>
        )
    }

    if (cart.length === 0) {
        return (
            <div className="obsidian-store" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', minHeight: '70vh' }}>
                <h1 className="obsidian-header__title" style={{ fontSize: '3rem', marginBottom: '1rem' }}>Cart Empty</h1>
                <Link href="/shop" style={{ display: 'inline-block', background: '#fff', color: '#000', padding: '1.2rem 4rem', borderRadius: '50px', textDecoration: 'none', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 800, fontSize: '0.9rem', transition: 'all 0.3s', marginTop: '2rem' }}>
                    RETURN TO STORE
                </Link>
            </div>
        )
    }

    if (isAuthenticated === null) {
        return <ShopCheckoutSkeleton />
    }

    return (
        <div className="obsidian-store" style={{ minHeight: '100dvh', paddingTop: '6rem', paddingBottom: '8rem' }}>
            <div className="shop-page-wrap">

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(2rem, 8vw, 4rem)', gap: '1rem', flexWrap: 'wrap' }}>
                    <Link href="/shop/cart" className="shop-back-link" style={{ marginBottom: 0 }}>
                        <ArrowLeft size={16} /> <span className="hide-on-mobile">Back to Cart</span><span className="show-on-mobile">Back</span>
                    </Link>

                    {/* Progress Tracker */}
                    <div className="checkout-step-tracker" style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.5rem, 3vw, 1.5rem)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step === 'DELIVERY' ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'color 0.3s', fontSize: '0.75rem' }}>
                            <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: step === 'DELIVERY' ? '#fff' : 'rgba(255,255,255,0.1)', color: step === 'DELIVERY' ? '#000' : 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem' }}>1</span>
                            <span className="hide-on-xs">Delivery</span>
                        </div>
                        <div style={{ width: 'clamp(10px, 5vw, 40px)', height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: step === 'PAYMENT' ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'color 0.3s', fontSize: '0.75rem' }}>
                            <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: step === 'PAYMENT' ? '#fff' : 'rgba(255,255,255,0.1)', color: step === 'PAYMENT' ? '#000' : 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.7rem' }}>2</span>
                            <span className="hide-on-xs">Payment</span>
                        </div>
                    </div>
                </div>

                <div className="shop-two-col">

                    {/* LEFT SECTION: Dynamic Step View */}
                    <div className="shop-col-main" style={{ animation: 'fadeIn 0.5s ease' }}>

                        {step === 'DELIVERY' && (
                            <div>
                                <h1 className="checkout-huge-title">Where should<br/>we deliver?</h1>

                                {isAuthenticated && athleteProfile ? (
                                    <div style={{ paddingBottom: '2rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--gold, #ffb703)', marginBottom: '2rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.85rem' }}>
                                            <UserCheck size={20} /> Athlete Synced
                                        </div>
                                        <div style={{ fontSize: '1.8rem', color: '#fff', fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>{athleteProfile.name}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', marginBottom: '3rem' }}>{athleteProfile.phone}</div>

                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem', marginBottom: '3rem' }}>
                                            <div style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem' }}>Fulfillment Method</div>
                                            <div style={{ fontSize: '1.2rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <MapPin size={24} color="#4caf50" />
                                                Class Pickup — {athleteProfile.branch}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={onDeliveryContinueAthlete}
                                            className="shop-cta-pill"
                                        >
                                            CONTINUE TO PAYMENT
                                        </button>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit(onDeliverySubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        <div style={{ marginBottom: '1rem' }}>
                                            <strong style={{ color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem', fontWeight: 700 }}>Training Camp Pickup</strong>
                                            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', lineHeight: 1.6 }}>Orders are delivered directly to the training camp or class. No residential address is required.</span>
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: '0.75rem' }}>Parent / Guardian Name</label>
                                            <input {...register('parentName')} className="checkout-input" placeholder="Enter full name" />
                                            {errors.parentName && <span style={{ color: 'var(--crimson, #d62828)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block', fontWeight: 800, textTransform: 'uppercase' }}>{errors.parentName.message}</span>}
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: '0.75rem' }}>Student Name</label>
                                            <input {...register('studentName')} className="checkout-input" placeholder="Enter student name" />
                                            {errors.studentName && <span style={{ color: 'var(--crimson, #d62828)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block', fontWeight: 800, textTransform: 'uppercase' }}>{errors.studentName.message}</span>}
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: '0.75rem' }}>Student Age</label>
                                            <input {...register('age')} type="number" min="1" max="99" className="checkout-input" placeholder="Enter student age" />
                                            {errors.age && <span style={{ color: 'var(--crimson, #d62828)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block', fontWeight: 800, textTransform: 'uppercase' }}>{errors.age.message}</span>}
                                        </div>

                                        <div style={{ marginBottom: '1rem' }}>
                                            <label style={{ display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700, marginBottom: '0.75rem' }}>Contact Number</label>
                                            <input {...register('phone')} placeholder="+91" className="checkout-input" />
                                            {errors.phone && <span style={{ color: 'var(--crimson, #d62828)', fontSize: '0.8rem', marginTop: '0.5rem', display: 'block', fontWeight: 800, textTransform: 'uppercase' }}>{errors.phone.message}</span>}
                                        </div>

                                        <button type="submit" className="shop-cta-pill" style={{ marginTop: '1rem' }}>
                                            CONTINUE TO PAYMENT
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                        {step === 'PAYMENT' && (
                            <div style={{ animation: 'fadeIn 0.5s ease' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
                                    <h1 className="checkout-huge-title" style={{ margin: 0 }}>Payment<br/>Verification</h1>
                                    <button onClick={() => setStep('DELIVERY')} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline' }}>Edit Delivery</button>
                                </div>

                                <p style={{ margin: '0 0 4rem', color: 'rgba(255,255,255,0.6)', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: '400px' }}>
                                    Scan the QR code below to transfer exactly <strong style={{ color: '#fff' }}>₹{finalTotal.toLocaleString()}</strong>.
                                </p>

                                <div className="checkout-qr-wrapper">
                                    {/* Left: QR Code */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{ width: '250px', background: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                                            <Image src="/scanner-to-pay.jpeg" alt="UPI QR Code" width={400} height={400} style={{ width: '100%', height: 'auto', display: 'block' }} />
                                        </div>
                                        <a href="/scanner-to-pay.jpeg" download="skf-qr-code.jpeg" style={{ width: '250px', textAlign: 'center', display: 'block', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', padding: '1rem', borderRadius: '50px', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '2px', fontWeight: 800, textDecoration: 'none', transition: 'all 0.2s' }} onMouseEnter={e => {e.currentTarget.style.borderColor = '#fff'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#000';}} onMouseLeave={e => {e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff';}}>
                                            Download QR
                                        </a>
                                    </div>

                                    {/* Right: Details */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', justifyContent: 'center' }}>
                                        <div>
                                            <div style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '2px', fontSize: '0.75rem', fontWeight: 700 }}>UPI ID</div>
                                            <div style={{ color: '#fff', fontWeight: 600, fontSize: '1.2rem' }}>skfkarate@axl</div>
                                        </div>
                                        <div>
                                            <div style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.5rem', letterSpacing: '2px', fontSize: '0.75rem', fontWeight: 700 }}>Phone Number</div>
                                            <div style={{ color: '#fff', fontWeight: 600, fontSize: '1.2rem' }}>9611990869</div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '4rem' }}>
                                    <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem' }}>Upload Screenshot Verification</label>
                                    <label
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            width: '100%',
                                            padding: '1.5rem 2rem',
                                            background: 'transparent',
                                            border: '1px solid rgba(255,255,255,0.2)',
                                            borderRadius: '50px',
                                            color: '#fff',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#fff'; }}
                                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <UploadCloud size={24} color={paymentProofName ? '#4caf50' : '#fff'} strokeWidth={1.5} />
                                            <span style={{ fontSize: '0.9rem', color: paymentProofName ? '#4caf50' : '#fff', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                                {paymentProofName ? paymentProofName : 'Select File (Max 5MB)'}
                                            </span>
                                        </div>
                                        {paymentProofName && <Check size={20} color="#4caf50" strokeWidth={3} />}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            style={{ display: 'none' }}
                                        />
                                    </label>
                                </div>

                                <button
                                    type="button"
                                    onClick={submitFinalOrder}
                                    disabled={submitting}
                                    className="shop-cta-pill"
                                    style={{ opacity: submitting ? 0.5 : 1 }}
                                >
                                    {submitting ? 'PROCESSING...' : `COMPLETE ORDER`}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* RIGHT SECTION: Minimalist Order Digest */}
                    <div className="shop-col-side">
                        <h2 style={{ margin: '0 0 2rem', fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 700 }}>Order Summary</h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '3rem' }}>
                            {cart.map(item => (
                                <div key={item.variantId} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <div style={{ width: '48px', height: '60px', background: '#111', borderRadius: '8px', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                                        <Image src={item.image || SHOP_IMAGE_FALLBACK} alt={item.name} fill style={{ objectFit: 'cover', opacity: 0.8 }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem', lineHeight: 1.3 }}>{item.name}</div>
                                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Size: {item.size} • Qty: {item.quantity}</div>
                                    </div>
                                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>
                                        ₹{(item.price * item.quantity).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
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

                            {(pointsDiscount > 0 || promoDiscount > 0) && (
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {promoDiscount > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4caf50', fontSize: '0.9rem' }}>
                                            <span>Promo ({promoCode})</span>
                                            <span>−₹{promoDiscount.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {pointsDiscount > 0 && (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4caf50', fontSize: '0.9rem' }}>
                                            <span>Loyalty</span>
                                            <span>−₹{pointsDiscount.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '1.4rem', color: '#fff', fontFamily: 'var(--font-heading)' }}>
                                <span>Total</span>
                                <span>₹{finalTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
