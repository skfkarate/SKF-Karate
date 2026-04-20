'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Star, Package, Lock, Ruler, X, User, ShoppingCart, Check } from 'lucide-react'
import { useCart } from '@/lib/shop/cartState'
import '../shop.css'
import { AdminProduct } from '@/lib/server/repositories/products'

// Standard Karate belt progression
const BELT_HIERARCHY = ['white', 'yellow', 'orange', 'green', 'blue', 'purple', 'brown', 'black']

export default function ProductDetailPage() {
    const params = useParams()
    const router = useRouter()
    const productId = params.productId as string
    
    const [product, setProduct] = useState<AdminProduct | null>(null)
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
        // Fetch Auth & Belt
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.authenticated) {
                    setIsAuthenticated(true)
                    setAthleteBelt(data.user?.belt?.toLowerCase() || 'white')
                }
            })
            .catch(() => {})

        // Fetch Live Catalog
        fetch('/api/shop/catalog')
            .then(res => res.json())
            .then(data => {
                const target = data.find((p: AdminProduct) => p.id === productId)
                if (target) {
                    setProduct(target)
                    setSelectedVariant(target.variants[0]?.id || '')
                }
                setIsLoading(false)
            })
            .catch(() => setIsLoading(false))
    }, [productId])

    if (isLoading) return <div className="obsidian-store" style={{ padding: '6rem', color: '#fff', textAlign: 'center' }}>Loading Armory...</div>
    if (!product) return <div className="obsidian-store" style={{ padding: '6rem', color: '#fff', textAlign: 'center' }}>Product not found.</div>

    const activeVariantObj = product.variants.find((v: any) => v.id === selectedVariant)
    const isOutOfStock = activeVariantObj?.stock === 0
    const requiresApproval = activeVariantObj?.requiresApproval === true

    // Belt Gate Logic
    const reqBeltIndex = product.requires_belt ? BELT_HIERARCHY.indexOf(product.requires_belt.toLowerCase()) : 0
    const athleteBeltIndex = BELT_HIERARCHY.indexOf(athleteBelt)
    const isBeltLocked = product.requires_belt && athleteBeltIndex < reqBeltIndex

    // Check if this variant is already in cart
    const existingCartItem = cart.find(item => item.variantId === selectedVariant)

    // Sizing Matrix Engine
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
        const targetVar = product.variants.find((v: any) => v.id.toLowerCase().endsWith(sizePrefix))
        
        if (targetVar) {
            setSelectedVariant(targetVar.id)
            setIsSizingModalOpen(false)
            setCalcHeight('')
            setCalcWeight('')
        } else {
            alert("No standard size found for those dimensions. Please consult Sensei.")
        }
    }

    const handleAddToCart = () => {
        // Unauthenticated Velvet Rope interception
        if (!product.is_public && !isAuthenticated) {
            router.push('/portal/login?callbackUrl=/shop/' + product.id)
            return
        }

        if (!activeVariantObj || isOutOfStock || isBeltLocked) return
        
        addToCart({
            productId: product.id,
            variantId: activeVariantObj.id,
            name: product.name,
            price: product.price,
            size: activeVariantObj.size,
            image: product.images[0],
            quantity: quantity,
            requiresApproval
        })
        
        // Show floating toast
        setShowToast(true)
        setTimeout(() => setShowToast(false), 3500)
    }

    // Total items in cart for badge
    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)

    // Determine the state of the checkout button
    let buttonUI = null;
    if (!product.is_public && !isAuthenticated) {
        buttonUI = (
            <button className="obsidian-btn-add" onClick={handleAddToCart} style={{ width: '100%', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)', border: '1px solid rgba(255,183,3,0.3)' }}>
                <User size={18} style={{ marginRight: '8px', verticalAlign: 'text-bottom' }} /> LOGIN TO UNLOCK PURCHASE
            </button>
        )
    } else if (isBeltLocked) {
        buttonUI = (
            <button disabled className="obsidian-btn-add" style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.4)', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem' }}>
                <Lock size={18} /> REQUIRES {product.requires_belt?.toUpperCase()} BELT
            </button>
        )
    } else {
        buttonUI = (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="obsidian-btn-add"
                    style={{ flex: 1, opacity: isOutOfStock ? 0.5 : 1 }}
                >
                    {isOutOfStock ? 'OUT OF STOCK' : requiresApproval ? 'ADD — NEEDS APPROVAL' : 'ADD TO CART'}
                </button>
                {cartItemCount > 0 && (
                    <Link
                        href="/shop/cart"
                        style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'center', 
                            padding: '0 1.5rem', background: 'rgba(255,255,255,0.08)', 
                            border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px',
                            color: '#fff', textDecoration: 'none', position: 'relative',
                            transition: 'all 0.3s'
                        }}
                    >
                        <ShoppingCart size={20} />
                        <span style={{ 
                            position: 'absolute', top: '-6px', right: '-6px',
                            background: 'var(--gold, #ffb703)', color: '#000',
                            width: '22px', height: '22px', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.7rem', fontWeight: 900
                        }}>{cartItemCount}</span>
                    </Link>
                )}
            </div>
        )
    }

    return (
        <div className="obsidian-store">
            {/* FLOATING TOAST NOTIFICATION */}
            {showToast && (
                <div style={{
                    position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
                    background: '#111', border: '1px solid rgba(76,175,80,0.4)',
                    borderRadius: '16px', padding: '1.2rem 1.5rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                    animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    maxWidth: '420px'
                }}>
                    <div style={{ 
                        width: '40px', height: '40px', borderRadius: '10px', 
                        background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                        <Check size={20} color="#4caf50" />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>
                            Added to Cart
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem' }}>
                            {product.name} — {activeVariantObj?.size}
                        </div>
                    </div>
                    <Link href="/shop/cart" style={{ 
                        background: '#fff', color: '#000', padding: '0.6rem 1.2rem', 
                        borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800, 
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                        textDecoration: 'none', whiteSpace: 'nowrap'
                    }}>
                        View Cart
                    </Link>
                </div>
            )}

            {/* SIZING CALCULATOR MODAL */}
            {isSizingModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ background: '#050505', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '400px', position: 'relative' }}>
                        <button onClick={() => setIsSizingModalOpen(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
                        
                        <h3 style={{ margin: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fff', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <Ruler size={20} color="var(--gold, #ffb703)" /> Sizing Matrix
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label className="obsidian-label">Athlete Height (cm)</label>
                                <input type="number" placeholder="e.g. 145" value={calcHeight} onChange={e => setCalcHeight(e.target.value)} className="obsidian-input" />
                            </div>
                            <div>
                                <label className="obsidian-label">Athlete Weight (kg)</label>
                                <input type="number" placeholder="e.g. 40" value={calcWeight} onChange={e => setCalcWeight(e.target.value)} className="obsidian-input" />
                            </div>
                        </div>

                        <button onClick={runSizingCalculator} className="obsidian-btn-add" style={{ width: '100%', padding: '1rem' }}>
                            CALCULATE EXACT SIZE
                        </button>
                        <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '1rem', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Powered by SKF Official Dimension Charts</p>
                    </div>
                </div>
            )}

            <div className="obsidian-container" style={{ paddingTop: '6rem' }}>
                <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontWeight: 600, marginBottom: '2rem', transition: 'color 0.2s', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                    <ArrowLeft size={16} />
                    Back to Armory
                </Link>

                <div className="obsidian-detail-layout">
                    {/* LEFT: IMAGE GALLERY */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: '24px', overflow: 'hidden', background: '#000', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Image src={product.images[selectedImage] || product.images[0] || '/images/placeholder.jpg'} alt={product.name} fill style={{ objectFit: 'cover' }} priority />
                        </div>
                        {product.images.length > 1 && (
                            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }}>
                                {product.images.map((img: string, i: number) => (
                                    <div key={i} onClick={() => setSelectedImage(i)} style={{ width: '80px', height: '80px', position: 'relative', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', border: selectedImage === i ? '2px solid var(--gold)' : '1px solid rgba(255,255,255,0.1)', opacity: selectedImage === i ? 1 : 0.6 }}>
                                        <Image src={img} alt={`Gallery ${i}`} fill style={{ objectFit: 'cover' }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: INFO & ACTIONS */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        
                        {/* Badges */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                            <span style={{ background: 'rgba(255,255,255,0.08)', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: 'rgba(255,255,255,0.7)' }}>
                                {product.category.replace('-', ' ')}
                            </span>
                            {!product.is_public && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,183,3,0.1)', border: '1px solid rgba(255,183,3,0.3)', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--gold, #ffb703)' }}>
                                    <ShieldCheck size={12} /> Athletes Only
                                </span>
                            )}
                            {product.requires_belt && (
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,183,3,0.08)', border: '1px solid rgba(255,183,3,0.2)', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.7rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--gold, #ffb703)' }}>
                                    <Lock size={12} /> {product.requires_belt} Belt+
                                </span>
                            )}
                        </div>

                        <h1 style={{ fontSize: '3rem', margin: '0 0 0.5rem', color: '#fff', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '1px', lineHeight: 1.1 }}>
                            {product.name}
                        </h1>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
                            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--gold, #ffb703)' }}>
                                ₹{product.price.toLocaleString()}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 600 }}>
                                <Star size={14} fill="var(--gold)" color="var(--gold)" />
                                <span>{product.rating}</span>
                                <span>({product.review_count} Reviews)</span>
                            </div>
                        </div>

                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem', fontWeight: 400 }}>
                            {product.description}
                        </p>

                        {/* VARIANTS */}
                        <div style={{ marginBottom: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                                <h3 style={{ margin: 0, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', fontWeight: 700 }}>Select Size</h3>
                                {product.category === 'uniforms' && (
                                    <button onClick={() => setIsSizingModalOpen(true)} style={{ background: 'transparent', border: 'none', color: '#4caf50', display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        <Ruler size={14} /> Size Guide
                                    </button>
                                )}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                {product.variants.map((v: any) => (
                                    <button
                                        key={v.id}
                                        className={`obsidian-variant-btn ${selectedVariant === v.id ? 'active' : ''} ${v.stock === 0 ? 'out-of-stock' : ''}`}
                                        onClick={() => v.stock > 0 && setSelectedVariant(v.id)}
                                        disabled={v.stock === 0}
                                        style={selectedVariant === v.id ? { background: '#fff', color: '#000', borderColor: '#fff' } : {}}
                                    >
                                        {v.size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ADD TO CART ACTION BAR */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem', borderRadius: '16px' }}>
                            
                            {requiresApproval && (
                                <div style={{ marginBottom: '1rem', padding: '0.8rem 1rem', background: 'rgba(255,183,3,0.08)', border: '1px solid rgba(255,183,3,0.25)', borderRadius: '10px', color: 'rgba(255,255,255,0.7)', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                    <ShieldCheck size={16} color="var(--gold, #ffb703)" />
                                    This item will need instructor approval after ordering.
                                </div>
                            )}

                            {/* Quantity + Stock */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                                <div className="obsidian-stepper">
                                    <button className="obsidian-stepper__btn" onClick={() => setQuantity(Math.max(1, quantity - 1))}>−</button>
                                    <span className="obsidian-stepper__val">{quantity}</span>
                                    <button className="obsidian-stepper__btn" onClick={() => setQuantity(quantity + 1)}>+</button>
                                </div>
                                <div style={{ color: isOutOfStock ? '#ff6b6b' : 'rgba(255,255,255,0.45)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Package size={14} /> 
                                    {isOutOfStock ? 'Out of Stock' : `${activeVariantObj?.stock} available`}
                                </div>
                            </div>

                            {/* Already in cart indicator */}
                            {existingCartItem && (
                                <div style={{ marginBottom: '1rem', padding: '0.6rem 1rem', background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.2)', borderRadius: '10px', color: '#4caf50', fontSize: '0.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Check size={14} /> {existingCartItem.quantity} already in your cart
                                </div>
                            )}
                            
                            {buttonUI}

                            <div style={{ marginTop: '1.2rem', paddingTop: '1.2rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldCheck size={12} color="rgba(76,175,80,0.6)" /> Official SKF Approved Gear</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Package size={12} color="rgba(76,175,80,0.6)" /> Free Dojo Pickup for Athletes</div>
                            </div>
                        </div>

                    </div>
                </div>

            </div>

            {/* Toast animation keyframes */}
            <style jsx>{`
                @keyframes slideInRight {
                    from { transform: translateX(120%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    )
}
