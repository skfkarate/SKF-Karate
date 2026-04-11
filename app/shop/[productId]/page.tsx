'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { PRODUCTS, ProductVariant } from '@/lib/shop/products'
import { useCart } from '@/lib/shop/cartState'

export default function ProductDetailPage({ params }: { params: Promise<{ productId: string }> }) {
    const resolvedParams = use(params)
    const router = useRouter()
    const { addToCart } = useCart()

    const product = PRODUCTS.find(p => p.id === resolvedParams.productId)
    
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
    const [quantity, setQuantity] = useState(1)

    if (!product) {
        return <div style={{ padding: '120px 2rem', textAlign: 'center', color: '#fff' }}>Product not found.</div>
    }

    const handleAddToCart = () => {
        if (!selectedVariant) return
        addToCart({
            productId: product.id,
            variantId: selectedVariant.id,
            quantity,
            price: product.price,
            name: product.name,
            size: selectedVariant.size,
            image: product.images[0]
        })
        router.push('/shop/cart')
    }

    return (
        <div style={{ minHeight: '100vh', padding: '120px 2rem 4rem', background: '#050505', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '3rem' }}>
                
                {/* Images */}
                <div style={{ flex: '1 1 400px' }}>
                    <div style={{ background: '#111', aspectRatio: '1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
                        <div style={{ color: '#555' }}>Main Image Placeholder</div>
                    </div>
                </div>

                {/* Details */}
                <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 0.5rem', color: 'var(--gold, #ffb703)' }}>{product.name}</h1>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', marginBottom: '1.5rem' }}>₹{product.price}</div>
                    
                    <p style={{ color: '#aaa', lineHeight: 1.6, marginBottom: '2rem' }}>{product.description}</p>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <strong style={{ color: '#fff' }}>Select Size/Variant</strong>
                            <button style={{ background: 'transparent', border: 'none', color: '#4facfe', textDecoration: 'underline', cursor: 'pointer' }}>View Size Guide</button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                            {product.variants.map(variant => {
                                const isSelected = selectedVariant?.id === variant.id
                                const outOfStock = variant.stock === 0
                                return (
                                    <button
                                        key={variant.id}
                                        onClick={() => {
                                            setSelectedVariant(variant)
                                            setQuantity(1)
                                        }}
                                        disabled={outOfStock}
                                        style={{
                                            background: isSelected ? 'var(--gold, #ffb703)' : 'rgba(255,255,255,0.05)',
                                            color: isSelected ? '#000' : outOfStock ? '#444' : '#fff',
                                            border: `1px solid ${isSelected ? 'var(--gold, #ffb703)' : 'rgba(255,255,255,0.2)'}`,
                                            padding: '0.8rem 1.2rem',
                                            borderRadius: '8px',
                                            cursor: outOfStock ? 'not-allowed' : 'pointer',
                                            fontWeight: 'bold',
                                            opacity: outOfStock ? 0.5 : 1
                                        }}
                                    >
                                        {variant.size}
                                    </button>
                                )
                            })}
                        </div>
                        {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock < 3 && (
                            <div style={{ color: '#ffb703', marginTop: '0.8rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                Only {selectedVariant.stock} left in stock!
                            </div>
                        )}
                        {selectedVariant && selectedVariant.stock === 0 && (
                            <div style={{ color: '#dc3545', marginTop: '0.8rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                Currently out of stock
                            </div>
                        )}
                    </div>

                    {selectedVariant && selectedVariant.stock > 0 && (
                        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <strong style={{ color: '#fff' }}>Quantity</strong>
                            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                <button 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    style={{ padding: '0.8rem 1.2rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}
                                >−</button>
                                <div style={{ width: '40px', textAlign: 'center', fontWeight: 'bold' }}>{quantity}</div>
                                <button 
                                    onClick={() => setQuantity(Math.min(selectedVariant.stock, quantity + 1))}
                                    style={{ padding: '0.8rem 1.2rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}
                                >+</button>
                            </div>
                        </div>
                    )}

                    <button 
                        onClick={handleAddToCart}
                        disabled={!selectedVariant || selectedVariant.stock === 0}
                        style={{
                            background: !selectedVariant || selectedVariant.stock === 0 ? '#333' : '#dc3545',
                            color: !selectedVariant || selectedVariant.stock === 0 ? '#666' : '#fff',
                            border: 'none',
                            padding: '1.2rem',
                            borderRadius: '8px',
                            fontSize: '1.1rem',
                            fontWeight: 'bold',
                            cursor: !selectedVariant || selectedVariant.stock === 0 ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        {!selectedVariant ? 'Select a Size' : selectedVariant.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </div>
    )
}
