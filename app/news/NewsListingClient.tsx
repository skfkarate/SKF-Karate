'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Announcement } from '@/types'

export default function NewsListingClient({ initialAnnouncements }: { initialAnnouncements: Announcement[] }) {
    // Generate branch options dynamically based on available data, plus 'All'
    const branchesSet = new Set(initialAnnouncements.map(a => a.branch).filter(b => b !== 'ALL'))
    const branches = ['All', 'All Branches', ...Array.from(branchesSet)]

    const [activeBranch, setActiveBranch] = useState('All')

    const filtered = initialAnnouncements.filter(a => {
        if (activeBranch === 'All') return true
        if (activeBranch === 'All Branches' && a.branch === 'ALL') return true
        return a.branch === activeBranch
    })

    return (
        <div>
            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
                {branches.map(branch => (
                    <button
                        key={branch}
                        onClick={() => setActiveBranch(branch)}
                        style={{
                            background: activeBranch === branch ? 'var(--crimson, #dc3545)' : 'rgba(255,255,255,0.05)',
                            color: '#fff',
                            border: '1px solid',
                            borderColor: activeBranch === branch ? 'var(--crimson, #dc3545)' : 'rgba(255,255,255,0.1)',
                            padding: '0.5rem 1.2rem',
                            borderRadius: '50px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap',
                            fontSize: '0.9rem'
                        }}
                    >
                        {branch}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#666', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                    No announcements available for this branch right now.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                    {filtered.map(post => {
                        const isAll = post.branch === 'ALL'
                        return (
                            <Link href={`/news/${post.slug}`} key={post.slug} style={{
                                textDecoration: 'none',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                borderRadius: '16px',
                                padding: '2rem',
                                transition: 'transform 0.2s, background 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                cursor: 'pointer'
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                                    <span style={{ 
                                        background: isAll ? 'rgba(255, 183, 3, 0.15)' : 'rgba(220, 53, 69, 0.15)', 
                                        color: isAll ? 'var(--gold, #ffb703)' : 'var(--crimson, #dc3545)',
                                        padding: '0.3rem 0.8rem',
                                        borderRadius: '50px',
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        textTransform: 'uppercase'
                                    }}>
                                        {isAll ? 'All Branches' : post.branch}
                                    </span>
                                    <span style={{ color: '#888', fontSize: '0.8rem' }}>
                                        {new Date(post.publishedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </div>
                                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0 0 1rem', color: '#fff', lineHeight: 1.4 }}>
                                    {post.title}
                                </h2>
                                <p style={{ color: '#aaa', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem', flex: 1 }}>
                                    {post.body.length > 150 ? post.body.substring(0, 150) + '...' : post.body}
                                </p>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                    <span style={{ color: '#666', fontSize: '0.85rem' }}>{post.author}</span>
                                    <span style={{ color: 'var(--crimson, #dc3545)', fontWeight: 'bold', fontSize: '0.9rem' }}>Read More →</span>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
