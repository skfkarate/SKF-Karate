'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Lock, ShieldCheck } from 'lucide-react'
import { SHOP_FILTER_TABS } from '@/data/constants/categories'
import './shop.css'

const CATEGORIES = SHOP_FILTER_TABS

export default function ShopListingPage() {
    const [activeTab, setActiveTab] = useState('all')
    const [products, setProducts] = useState<any[]>([])

    useEffect(() => {
        fetch('/api/shop/catalog')
            .then(res => res.json())
            .then(data => setProducts(data || []))
            .catch(() => {})
    }, [])

    const filtered = products.filter((p: any) => activeTab === 'all' || p.category === activeTab)

    return (
        <div className="obsidian-store">
            <div className="obsidian-container">
                
                {/* HERO HEADER */}
                <header className="obsidian-header">
                    <h1 className="obsidian-header__title">Official Gear</h1>
                    <p className="obsidian-header__subtitle">
                        Immersive, battle-tested apparel and equipment. Step into the Armory and equip yourself with the absolute highest standard in martial arts.
                    </p>
                </header>

                {/* FILTERS */}
                <div className="obsidian-filters">
                    {CATEGORIES.map(c => (
                        <button
                            key={c.id}
                            onClick={() => setActiveTab(c.id)}
                            className={`obsidian-filter-btn ${activeTab === c.id ? 'active' : ''}`}
                        >
                            {c.label}
                        </button>
                    ))}
                </div>

                {/* THE GRID */}
                <div className="obsidian-grid">
                    {filtered.map((product: any) => {
                        const totalStock = product.variants.reduce((acc: number, v: any) => acc + v.stock, 0)
                        const outOfStock = totalStock === 0

                        return (
                            <Link 
                                href={`/shop/${product.id}`} 
                                key={product.id} 
                                className={`obsidian-card ${outOfStock ? 'card-sold-out' : ''}`}
                            >
                                {outOfStock && (
                                    <div className="obsidian-badge-soldout">Sold Out</div>
                                )}

                                {/* Exclusivity Badges */}
                                {!product.is_public && (
                                    <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 5, display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(214,40,40,0.85)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '50px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: '#fff' }}>
                                            <ShieldCheck size={10} /> Athletes Only
                                        </span>
                                        {product.requires_belt && (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(255,183,3,0.85)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '50px', fontSize: '0.65rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: '#000' }}>
                                                <Lock size={10} /> {product.requires_belt}+
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div className="obsidian-card__image-wrapper">
                                    <Image 
                                        src={product.images[0] || '/images/placeholder.jpg'} 
                                        alt={product.name}
                                        fill
                                        className="obsidian-card__image"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    />
                                </div>
                                
                                <div className="obsidian-card__info">
                                    <span className="obsidian-card__category">{product.category.replace('-', ' ')}</span>
                                    <h3 className="obsidian-card__title">{product.name}</h3>
                                    
                                    <div className="obsidian-card__price-row">
                                        <span className="obsidian-card__price">₹{product.price.toLocaleString()}</span>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
                
            </div>
        </div>
    )
}
