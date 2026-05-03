'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, ShoppingBag } from 'lucide-react'
import { SHOP_FILTER_TABS } from '@/data/constants/categories'
import { getProductTotalStock } from '@/lib/shop/logic'
import type { ShopProduct } from '@/lib/shop/types'
import './shop.css'

const CATEGORIES = SHOP_FILTER_TABS

export default function ShopListingPage() {
    const [activeTab, setActiveTab] = useState('all')
    const [products, setProducts] = useState<ShopProduct[]>([])

    useEffect(() => {
        fetch('/api/shop/catalog', { cache: 'no-store' })
            .then(res => res.json())
            .then(data => setProducts(data || []))
            .catch(() => {})
    }, [])

    const filtered = products.filter((product) => activeTab === 'all' || product.category === activeTab)

    return (
        <div className="obsidian-store" style={{ minHeight: '100dvh', color: '#fff', paddingTop: '6rem', paddingBottom: '8rem' }}>
            <div className="shop-page-wrap">

                {/* Minimal Header */}
                <header className="shop-listing-header">
                    <h1 className="shop-listing-title" style={{ fontSize: 'clamp(3rem, 15vw, 6rem)' }}>ARMORY</h1>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 'clamp(0.85rem, 2.5vw, 1rem)', maxWidth: '700px', lineHeight: 1.7, textTransform: 'uppercase', letterSpacing: '2px', margin: '1rem auto 0' }}>
                        Immersive, battle-tested apparel and equipment. Step into the Armory and equip yourself with the absolute highest standard.
                    </p>
                </header>

                {products.length > 0 ? (
                    <>
                        {/* Zara-style Filters */}
                        <div className="shop-filter-row" style={{ gap: 'clamp(1rem, 4vw, 3rem)', overflowX: 'auto', paddingBottom: '1.5rem', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            {CATEGORIES.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setActiveTab(c.id)}
                                    className={`obsidian-filter-tab ${activeTab === c.id ? 'active' : ''}`}
                                    style={{
                                        background: 'none', border: 'none', color: activeTab === c.id ? '#fff' : 'rgba(255,255,255,0.3)',
                                        fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '3px', cursor: 'pointer',
                                        position: 'relative', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', whiteSpace: 'nowrap',
                                        padding: '0.5rem 0'
                                    }}
                                >
                                    {c.label}
                                    <span style={{
                                        position: 'absolute',
                                        bottom: '-2px',
                                        left: '0',
                                        width: activeTab === c.id ? '100%' : '0%',
                                        height: '2px',
                                        background: '#fff',
                                        transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                                    }}></span>
                                </button>
                            ))}
                        </div>

                        {/* Ultra-Minimal Grid */}
                        <div className="shop-product-grid" style={{ marginTop: '2rem' }}>
                            {filtered.map((product) => {
                                const totalStock = getProductTotalStock(product)
                                const outOfStock = totalStock === 0

                                return (
                                    <Link
                                        href={`/shop/${product.id}`}
                                        key={product.id}
                                        className="shop-product-card-v2"
                                        style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', opacity: outOfStock ? 0.5 : 1, position: 'relative', transition: 'transform 0.4s ease' }}
                                    >
                                        {outOfStock && (
                                            <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10, background: 'rgba(255,255,255,0.9)', color: '#000', padding: '0.4rem 0.8rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.65rem', borderRadius: '4px' }}>
                                                Out of Stock
                                            </div>
                                        )}

                                        {/* Exclusivity Badges */}
                                        {!product.is_public && (
                                            <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 5, display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <span style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', color: '#fff', display: 'flex', alignItems: 'center', gap: '4px', borderRadius: '4px' }}>
                                                    <ShieldCheck size={10} color="var(--gold, #ffb703)" /> Athlete
                                                </span>
                                            </div>
                                        )}

                                        <div style={{ position: 'relative', width: '100%', aspectRatio: '4/5', backgroundColor: '#0a0a0a', overflow: 'hidden', marginBottom: '1.25rem', borderRadius: '4px' }}>
                                            <Image
                                                src={product.images[0] || '/og-default.jpg'}
                                                alt={product.name}
                                                fill
                                                style={{ objectFit: 'cover', transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)' }}
                                                className="zara-image-hover"
                                                sizes="(max-width: 768px) 50vw, 33vw"
                                            />
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                            <h3 style={{ margin: 0, color: '#fff', fontSize: '0.95rem', fontWeight: 600, fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '1px', lineHeight: 1.2 }}>{product.name}</h3>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{product.category.replace('-', ' ')}</span>
                                                <span style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>₹{product.price.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '40vh', color: 'rgba(255,255,255,0.5)' }}>
                        <ShoppingBag size={48} strokeWidth={1} style={{ marginBottom: '2rem' }} />
                        <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', letterSpacing: '2px', color: '#fff', margin: '0 0 1rem' }}>Restocking</h2>
                        <p style={{ maxWidth: '400px', textAlign: 'center', fontSize: '0.9rem', lineHeight: 1.6 }}>We are preparing a new lineup of premium equipment. Check back soon.</p>
                    </div>
                )}

                <style dangerouslySetInnerHTML={{__html: `
                    .zara-image-hover:hover {
                        transform: scale(1.05);
                    }
                `}} />
            </div>
        </div>
    )
}
