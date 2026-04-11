'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PRODUCTS } from '@/lib/shop/products'

const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'uniforms', label: 'Uniforms' },
    { id: 'belts', label: 'Belts' },
    { id: 'gear', label: 'Gear' },
    { id: 'merchandise', label: 'Merchandise' }
]

export default function ShopListingPage() {
    const [activeTab, setActiveTab] = useState('all')

    const filtered = PRODUCTS.filter(p => activeTab === 'all' || p.category === activeTab)

    return (
        <div style={{ minHeight: '100vh', padding: '120px 2rem 4rem', background: '#050505', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: 0, color: 'var(--gold, #ffb703)' }}>SKF STORE</h1>
                    <p style={{ color: '#aaa', marginTop: '0.5rem' }}>Official gear and merchandise</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
                    {CATEGORIES.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setActiveTab(c.id)}
                            style={{
                                background: activeTab === c.id ? 'var(--gold, #ffb703)' : 'rgba(255,255,255,0.05)',
                                color: activeTab === c.id ? '#000' : '#fff',
                                border: '1px solid',
                                borderColor: activeTab === c.id ? 'var(--gold, #ffb703)' : 'rgba(255,255,255,0.1)',
                                padding: '0.6rem 1.5rem',
                                borderRadius: '50px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                    {filtered.map(product => {
                        const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0)
                        const outOfStock = totalStock === 0

                        return (
                            <div key={product.id} style={{ 
                                background: 'rgba(255,255,255,0.02)', 
                                border: '1px solid rgba(255,255,255,0.05)', 
                                borderRadius: '12px', 
                                overflow: 'hidden',
                                transition: 'transform 0.2s, border-color 0.2s',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,183,3,0.3)'}
                            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}>
                                
                                {outOfStock && (
                                    <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#dc3545', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.3rem 0.8rem', borderRadius: '50px', zIndex: 10 }}>
                                        OUT OF STOCK
                                    </div>
                                )}

                                <div style={{ background: '#111', aspectRatio: '1', position: 'relative', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ height: '80%', width: '80%', background: '#222', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
                                        {/* Mock Image Box */}
                                        Image Placeholder
                                    </div>
                                </div>
                                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: '#fff', flex: 1 }}>{product.name}</h3>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--gold, #ffb703)', marginBottom: '1rem' }}>
                                        ₹{product.price}
                                    </div>
                                    <Link href={`/shop/${product.id}`} style={{
                                        display: 'block',
                                        textAlign: 'center',
                                        background: outOfStock ? '#333' : 'rgba(255,255,255,0.05)',
                                        color: outOfStock ? '#666' : '#fff',
                                        padding: '0.8rem',
                                        borderRadius: '8px',
                                        textDecoration: 'none',
                                        fontWeight: 'bold',
                                        pointerEvents: outOfStock ? 'none' : 'auto',
                                        border: outOfStock ? 'none' : '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        {outOfStock ? 'Sold Out' : 'View Details'}
                                    </Link>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
