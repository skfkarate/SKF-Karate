'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Package, Lock, Ruler, X, User, ShoppingCart, Check } from 'lucide-react'
import { useCart } from '@/lib/shop/cartState'
import { getShopProductImages, getShopProductPrimaryImage } from '@/lib/shop/productImages'
import type { ShopProduct } from '@/lib/shop/types'
import { BELT_HIERARCHY } from '@/lib/shop/types'
import ShopProductSkeleton from '@/components/skeletons/ShopProductSkeleton'
import '../shop.css'

export default function ProductDetailPage() {
    const params = useParams()
    const router = useRouter()
    const productId = params.productId as string

    const [product, setProduct] = useState<ShopProduct | null>(null)
    const { addToCart, cart } = useCart()

    const [selectedImage, setSelectedImage] = useState(0)
    const [selectedVariant, setSelectedVariant] = useState('')
    const [quantity, setQuantity] = useState(1)

    // Toast notification state
    const [showToast, setShowToast] = useState(false)

    // Gamification & Auth State
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
    const [athleteBelt, setAthleteBelt] = useState<string>('white')

    // Sizing Calculator Modal State
    const [isSizingModalOpen, setIsSizingModalOpen] = useState(false)
    const [calcHeight, setCalcHeight] = useState('')
    const [calcWeight, setCalcWeight] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.authenticated) {
                    setIsAuthenticated(true)
                    setAthleteBelt(data.user?.belt?.toLowerCase() || 'white')
                }
            })
            .catch(() => {})

        fetch('/api/shop/catalog', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => {
                const target = data.find((p: ShopProduct) => p.id === productId)
                if (target) {
                    setProduct(target)
                    setSelectedVariant(target.variants[0]?.id || '')
                }
                setIsLoading(false)
            })
            .catch(() => setIsLoading(false))
    }, [productId])

    if (isLoading) return <ShopProductSkeleton />
    if (!product) return <div className="obsidian-store" style={{ minHeight: '100dvh', padding: '6rem', color: '#fff', textAlign: 'center', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '2px' }}>Product not found.</div>

    const activeVariantObj = product.variants.find(v => v.id === selectedVariant)
    const productImages = getShopProductImages(product)
    const isOutOfStock = activeVariantObj?.stock === 0
    const requiresApproval = activeVariantObj?.requiresApproval === true

    const reqBeltIndex = product.requires_belt
        ? BELT_HIERARCHY.indexOf(product.requires_belt.toLowerCase() as (typeof BELT_HIERARCHY)[number])
        : 0
    const athleteBeltIndex = BELT_HIERARCHY.indexOf(athleteBelt as (typeof BELT_HIERARCHY)[number])
    const isBeltLocked = product.requires_belt && athleteBeltIndex < reqBeltIndex

    const existingCartItem = cart.find(item => item.variantId === selectedVariant)
    const maxPurchasableQuantity = Math.max(0, (activeVariantObj?.stock || 0) - (existingCartItem?.quantity || 0))
    const maxSelectableQuantity = Math.max(1, maxPurchasableQuantity || 1)
    const selectedQuantity = Math.min(quantity, maxSelectableQuantity)
    const hasReachedCartLimit = !isOutOfStock && maxPurchasableQuantity === 0

    const determineSize = (h: number) => {
        if (h < 140) return 'xs'
        if (h < 150) return 's'
        if (h < 160) return 'm'
        if (h < 170) return 'l'
        return 'xl'
    }

    const runSizingCalculator = () => {
        const h = Number(calcHeight)
        if (!h) return

        const sizePrefix = determineSize(h)
        const targetVar = product.variants.find((v) => v.id.toLowerCase().endsWith(sizePrefix))

        if (targetVar) {
            setSelectedVariant(targetVar.id)
            setQuantity(1)
            setIsSizingModalOpen(false)
            setCalcHeight('')
            setCalcWeight('')
        } else {
            alert("No standard size found for those dimensions. Please consult Sensei.")
        }
    }

    const handleAddToCart = () => {
        if (!product.is_public && !isAuthenticated) {
            router.push('/portal/login?callbackUrl=/shop/' + product.id)
            return
        }

        const quantityToAdd = Math.min(selectedQuantity, maxPurchasableQuantity)

        if (!activeVariantObj || isOutOfStock || isBeltLocked || quantityToAdd <= 0) return

        addToCart({
            productId: product.id,
            variantId: activeVariantObj.id,
            name: product.name,
            price: product.price,
            size: activeVariantObj.size,
            image: getShopProductPrimaryImage(product),
            quantity: quantityToAdd,
            requiresApproval
        })

        setShowToast(true)
        setTimeout(() => setShowToast(false), 3500)
    }

    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

    let buttonUI = null;
    if (!product.is_public && !isAuthenticated) {
        buttonUI = (
            <button onClick={handleAddToCart} style={{ width: '100%', background: '#fff', color: '#000', padding: '1.2rem', borderRadius: '50px', border: 'none', fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <User size={16} /> LOGIN TO UNLOCK PURCHASE
            </button>
        )
    } else if (isBeltLocked) {
        buttonUI = (
            <button disabled style={{ width: '100%', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.3)', padding: '1.2rem', borderRadius: '50px', fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Lock size={16} /> REQUIRES {product.requires_belt?.toUpperCase()} BELT
            </button>
        )
    } else {
        buttonUI = (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock || hasReachedCartLimit}
                    style={{ flex: 1, background: '#fff', color: '#000', padding: '1.2rem', borderRadius: '50px', border: 'none', fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', cursor: (isOutOfStock || hasReachedCartLimit) ? 'not-allowed' : 'pointer', opacity: (isOutOfStock || hasReachedCartLimit) ? 0.5 : 1, transition: 'opacity 0.2s' }}
                    onMouseEnter={e => { if (!(isOutOfStock || hasReachedCartLimit)) e.currentTarget.style.opacity = '0.9' }}
                    onMouseLeave={e => { if (!(isOutOfStock || hasReachedCartLimit)) e.currentTarget.style.opacity = '1' }}
                >
                    {isOutOfStock
                        ? 'OUT OF STOCK'
                        : hasReachedCartLimit
                            ? 'MAX IN CART'
                            : requiresApproval
                                ? 'ADD — NEEDS APPROVAL'
                                : 'ADD TO CART'}
                </button>
                {cartItemCount > 0 && (
                    <Link
                        href="/shop/cart"
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '0 1.5rem', background: 'transparent',
                            border: '1px solid #fff', borderRadius: '50px',
                            color: '#fff', textDecoration: 'none', position: 'relative',
                            transition: 'all 0.3s'
                        }}
                    >
                        <ShoppingCart size={20} />
                        <span style={{
                            position: 'absolute', top: '-2px', right: '0px',
                            background: '#fff', color: '#000',
                            width: '20px', height: '20px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: 900
                        }}>{cartItemCount}</span>
                    </Link>
                )}
            </div>
        )
    }

    return (
        <div className="obsidian-store" style={{ minHeight: '100dvh', color: '#fff', paddingTop: '6rem', paddingBottom: '8rem' }}>

            {showToast && (
                <div style={{
                    position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
                    background: '#fff', color: '#000',
                    borderRadius: '50px', padding: '0.75rem 1.5rem 0.75rem 0.75rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check size={18} strokeWidth={3} />
                    </div>
                    <div style={{ flex: 1, paddingRight: '1rem' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Added to Bag
                        </div>
                    </div>
                    <Link href="/shop/cart" style={{ color: '#000', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', textDecoration: 'underline' }}>
                        View
                    </Link>
                </div>
            )}

            {isSizingModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#000', border: '1px solid rgba(255,255,255,0.2)', padding: '3rem', width: '90%', maxWidth: '450px', position: 'relative' }}>
                        <button onClick={() => setIsSizingModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>

                        <h3 style={{ margin: '0 0 2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '1.5rem' }}>
                            <Ruler size={24} /> Sizing Matrix
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2.5rem' }}>
                            <div>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem', fontWeight: 700 }}>Athlete Height (cm)</label>
                                <input type="number" placeholder="e.g. 145" value={calcHeight} onChange={e => setCalcHeight(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '0.5rem 0', fontSize: '1.5rem', outline: 'none' }} onFocus={e => e.currentTarget.style.borderBottomColor = '#fff'} onBlur={e => e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.3)'} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '0.5rem', fontWeight: 700 }}>Athlete Weight (kg)</label>
                                <input type="number" placeholder="e.g. 40" value={calcWeight} onChange={e => setCalcWeight(e.target.value)} style={{ width: '100%', background: 'transparent', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.3)', color: '#fff', padding: '0.5rem 0', fontSize: '1.5rem', outline: 'none' }} onFocus={e => e.currentTarget.style.borderBottomColor = '#fff'} onBlur={e => e.currentTarget.style.borderBottomColor = 'rgba(255,255,255,0.3)'} />
                            </div>
                        </div>

                        <button onClick={runSizingCalculator} style={{ width: '100%', background: '#fff', color: '#000', padding: '1.2rem', border: 'none', fontFamily: 'var(--font-heading)', fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', cursor: 'pointer' }}>
                            CALCULATE EXACT SIZE
                        </button>
                    </div>
                </div>
            )}

            <div className="shop-page-wrap">
                <Link href="/shop" className="shop-back-link">
                    <ArrowLeft size={16} /> Back to Armory
                </Link>

                <div className="shop-two-col">

                    {/* LEFT: MINIMAL GALLERY */}
                    <div className="shop-detail-gallery">
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '3/4', background: '#111' }}>
                            <Image src={productImages[selectedImage] || productImages[0] || '/og-default.jpg'} alt={product.name} fill style={{ objectFit: 'cover' }} priority />
                        </div>
                        {productImages.length > 1 && (
                            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                                {productImages.map((img: string, i: number) => (
                                    <div key={i} onClick={() => setSelectedImage(i)} style={{ width: '100px', height: '100px', position: 'relative', background: '#111', cursor: 'pointer', border: selectedImage === i ? '1px solid #fff' : '1px solid transparent', opacity: selectedImage === i ? 1 : 0.5, transition: 'all 0.2s' }}>
                                        <Image src={img} alt={`Gallery ${i}`} fill style={{ objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: INFO & ACTIONS */}
                    <div className="shop-detail-info">

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: 'rgba(255,255,255,0.5)' }}>
                                {product.category.replace('-', ' ')}
                            </span>
                            {!product.is_public && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#fff' }}>
                                    <ShieldCheck size={12} /> Athletes Only
                                </span>
                            )}
                            {product.requires_belt && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', color: '#fff' }}>
                                    <Lock size={12} /> {product.requires_belt} Belt+
                                </span>
                            )}
                        </div>

                        <h1 className="shop-detail-product-title">
                            {product.name}
                        </h1>

                        <div style={{ fontSize: '1.5rem', fontWeight: 400, color: '#fff', marginBottom: '2.5rem' }}>
                            ₹{product.price.toLocaleString()}
                        </div>

                        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.8, marginBottom: '3rem', fontWeight: 300 }}>
                            {product.description}
                        </p>

                        {/* VARIANTS */}
                        <div style={{ marginBottom: '3rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.75rem', fontWeight: 700 }}>Select Size</h3>
                                {product.category === 'uniforms' && (
                                    <button onClick={() => setIsSizingModalOpen(true)} style={{ background: 'transparent', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '2px', textDecoration: 'underline' }}>
                                        <Ruler size={12} /> Size Guide
                                    </button>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                {product.variants.map((v) => (
                                    <button
                                        key={v.id}
                                        onClick={() => {
                                            if (v.stock <= 0) return
                                            setSelectedVariant(v.id)
                                            setQuantity(1)
                                        }}
                                        disabled={v.stock === 0}
                                        style={{
                                            background: selectedVariant === v.id ? '#fff' : 'transparent',
                                            color: selectedVariant === v.id ? '#000' : '#fff',
                                            border: selectedVariant === v.id ? '1px solid #fff' : '1px solid rgba(255,255,255,0.2)',
                                            padding: '0.8rem 1.5rem',
                                            fontSize: '0.85rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                            cursor: v.stock === 0 ? 'not-allowed' : 'pointer',
                                            opacity: v.stock === 0 ? 0.3 : 1,
                                            transition: 'all 0.2s',
                                            borderRadius: '50px'
                                        }}
                                        onMouseEnter={e => { if (v.stock > 0 && selectedVariant !== v.id) e.currentTarget.style.borderColor = '#fff' }}
                                        onMouseLeave={e => { if (v.stock > 0 && selectedVariant !== v.id) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                                    >
                                        {v.size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ADD TO CART ACTION BAR */}
                        <div>
                            {requiresApproval && (
                                <div style={{ marginBottom: '1.5rem', color: '#fff', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.6rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    <ShieldCheck size={14} />
                                    Approval Required After Purchase
                                </div>
                            )}

                            {/* Quantity */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50px', overflow: 'hidden' }}>
                                    <button onClick={() => setQuantity(Math.max(1, selectedQuantity - 1))} style={{ background: 'transparent', border: 'none', color: '#fff', padding: '0.8rem 1.2rem', cursor: 'pointer', fontSize: '1.2rem' }}>−</button>
                                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px', fontSize: '1rem', fontWeight: 600 }}>{selectedQuantity}</span>
                                    <button onClick={() => setQuantity(Math.min(maxSelectableQuantity, selectedQuantity + 1))} style={{ background: 'transparent', border: 'none', color: '#fff', padding: '0.8rem 1.2rem', cursor: 'pointer', fontSize: '1.2rem' }}>+</button>
                                </div>
                                <div style={{ color: isOutOfStock ? '#ff6b6b' : 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>
                                    {isOutOfStock
                                        ? 'Out of Stock'
                                        : hasReachedCartLimit
                                            ? 'Limit Reached'
                                            : `${maxPurchasableQuantity} Available`}
                                </div>
                            </div>

                            {buttonUI}

                            <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><ShieldCheck size={14} /> Official SKF Approved Gear</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}><Package size={14} /> Free Dojo Pickup for Athletes</div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slideInRight {
                    from { transform: translateX(120%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}} />
        </div>
    )
}
