'use client'

import { useState } from 'react'
import { AdminProduct } from '@/lib/server/repositories/products'
import { saveProductDetails } from './actions'

export default function AdminProductClient({ initialProducts }: { initialProducts: AdminProduct[] }) {
    const [products, setProducts] = useState(initialProducts)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleTogglePublic = async (product: AdminProduct) => {
        setLoading(true)
        const updated = { ...product, is_public: !product.is_public, requires_belt: !product.is_public ? null : product.requires_belt }
        const { success } = await saveProductDetails(updated)
        if (success) {
            setProducts(products.map(p => p.id === product.id ? updated : p))
        } else {
            alert('Supabase Table likely missing. Please run the SQL schema first.')
        }
        setLoading(false)
    }

    const handleChangeBelt = async (product: AdminProduct, belt: string) => {
        setLoading(true)
        const updated = { ...product, requires_belt: belt === 'None' ? undefined : belt, is_public: false }
        const { success } = await saveProductDetails(updated)
        if (success) {
            setProducts(products.map(p => p.id === product.id ? updated : p))
        } else {
            alert('Supabase Table likely missing. Please run the SQL schema first.')
        }
        setLoading(false)
    }

    return (
        <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.02)', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>
                        <th style={{ padding: '1.5rem', borderBottom: '1px solid #222' }}>Product Name</th>
                        <th style={{ padding: '1.5rem', borderBottom: '1px solid #222' }}>Category & Price</th>
                        <th style={{ padding: '1.5rem', borderBottom: '1px solid #222' }}>Open to Public</th>
                        <th style={{ padding: '1.5rem', borderBottom: '1px solid #222' }}>Requires Belt Rank</th>
                    </tr>
                </thead>
                <tbody style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                    {products.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                            <td style={{ padding: '1.5rem', fontWeight: 600, color: '#fff' }}>
                                {p.name}
                                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>ID: {p.id}</div>
                            </td>
                            <td style={{ padding: '1.5rem', color: '#ccc' }}>
                                <div style={{ textTransform: 'capitalize', color: 'var(--gold, #ffb703)' }}>{p.category}</div>
                                <div>₹{p.price}</div>
                            </td>
                            <td style={{ padding: '1.5rem' }}>
                                <button 
                                    onClick={() => handleTogglePublic(p)}
                                    style={{ 
                                        padding: '0.5rem 1rem', 
                                        background: p.is_public ? '#1b4332' : '#4a0000', 
                                        color: p.is_public ? '#4caf50' : '#ff4d4d',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {p.is_public ? 'PUBLIC (GUESTS)' : 'ATHLETES ONLY'}
                                </button>
                            </td>
                            <td style={{ padding: '1.5rem' }}>
                                <select 
                                    value={p.requires_belt || 'None'}
                                    disabled={p.is_public}
                                    onChange={(e) => handleChangeBelt(p, e.target.value)}
                                    style={{ 
                                        padding: '0.5rem', 
                                        background: '#000', 
                                        border: '1px solid #333', 
                                        color: p.is_public ? '#444' : '#fff',
                                        borderRadius: '6px',
                                        opacity: p.is_public ? 0.3 : 1
                                    }}
                                >
                                    <option value="None">None (All Athletes)</option>
                                    <option value="White">White Belt+</option>
                                    <option value="Yellow">Yellow Belt+</option>
                                    <option value="Orange">Orange Belt+</option>
                                    <option value="Green">Green Belt+</option>
                                    <option value="Blue">Blue Belt+</option>
                                    <option value="Brown">Brown Belt+</option>
                                    <option value="Black">Black Belt Only</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
