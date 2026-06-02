'use client'

import { useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    Cake,
    Coins,
    GraduationCap,
    Handshake,
    Loader2,
    Medal,
    ShoppingBag,
    Trophy,
    Video,
} from 'lucide-react'

export type PointsTransaction = {
    id?: string | number | null
    type?: string | null
    reason?: string | null
    created_at?: string | null
    points?: number | null
}

const IconMap: Record<string, { icon: LucideIcon; color: string }> = {
    GRADING_PASS: { icon: GraduationCap, color: '#4caf50' },
    WATCH_VIDEO: { icon: Video, color: '#2196f3' },
    BIRTHDAY: { icon: Cake, color: '#e91e63' },
    LOGIN_BONUS: { icon: Coins, color: 'var(--gold, #ffb703)' },
    REDEEM: { icon: ShoppingBag, color: '#9c27b0' },
    TOURNAMENT_GOLD: { icon: Trophy, color: '#ffb703' },
    TOURNAMENT_SILVER: { icon: Trophy, color: '#e0e0e0' },
    TOURNAMENT_BRONZE: { icon: Trophy, color: '#cd7f32' },
    REFERRAL: { icon: Handshake, color: '#00bcd4' },
    DEFAULT: { icon: Medal, color: '#888888' }
}

export default function PointsHistory({
    initialTransactions = [],
    initialHasMore = false,
}: {
    initialTransactions?: PointsTransaction[]
    initialHasMore?: boolean
}) {
    const [transactions, setTransactions] = useState<PointsTransaction[]>(initialTransactions)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const [hasMore, setHasMore] = useState(initialHasMore)

    const fetchHistory = async (p: number) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/points/history?page=${p}&limit=10`)
            if (res.ok) {
                const data = await res.json() as { transactions?: PointsTransaction[]; hasMore?: boolean }
                const nextTransactions = data.transactions || []
                if (p === 1) setTransactions(nextTransactions)
                else setTransactions(prev => [...prev, ...nextTransactions])

                setHasMore(data.hasMore ?? nextTransactions.length >= 10)
            }
        } catch {
            // The empty history state covers transient load failures.
        } finally {
            setLoading(false)
        }
    }

    const loadMore = () => {
        const next = page + 1
        setPage(next)
        void fetchHistory(next)
    }

    if (transactions.length === 0 && !loading) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.01)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Activity size={48} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ color: '#fff', fontSize: '1.25rem', marginBottom: '0.5rem', fontFamily: 'var(--font-heading, "Outfit")' }}>No Activity Yet</h3>
                <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0 }}>Start training, attending classes, and competing to earn points!</p>
            </div>
        )
    }

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem' }}>
                <Activity size={20} color="rgba(255,255,255,0.4)" />
                <h2 style={{ margin: 0, color: '#fff', fontSize: '1.5rem', fontFamily: 'var(--font-heading, "Outfit")', fontWeight: 800 }}>
                    Recent Activity
                </h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {transactions.map((tx, idx) => {
                        const transactionType = String(tx.type || '')
                        const reason = String(tx.reason || 'POINTS_ACTIVITY')
                        const match = transactionType === 'REDEEM' ? IconMap['REDEEM'] : (IconMap[reason] || IconMap['DEFAULT'])
                        const Icon = match.icon
                        const isEarn = transactionType === 'EARN'
                        const points = Number(tx.points || 0)
                        const pointColor = isEarn ? '#2dd4bf' : '#ff6b6b'
                        const createdAt = tx.created_at ? new Date(tx.created_at) : null
                        const dateLabel = createdAt && !Number.isNaN(createdAt.getTime())
                            ? createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'Recent'

                        return (
                            <div
                                key={tx.id || idx}
                                style={{ 
                                    display: 'flex', alignItems: 'center', gap: '1.25rem', 
                                    background: 'rgba(255,255,255,0.01)', padding: '1.5rem', 
                                    borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)',
                                    cursor: 'default', transition: 'background-color 0.2s ease'
                                }}
                            >
                                <div style={{ 
                                    width: '48px', height: '48px', borderRadius: '14px', 
                                    background: `radial-gradient(circle at top left, ${match.color}30, ${match.color}10)`, 
                                    border: `1px solid ${match.color}30`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: match.color,
                                    boxShadow: `inset 0 2px 10px ${match.color}20`
                                }}>
                                    <Icon size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: '0 0 0.25rem', color: '#fff', fontSize: '1.05rem', fontWeight: 700, letterSpacing: '0.02em' }}>
                                        {reason.replace(/_/g, ' ')}
                                    </h4>
                                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', fontWeight: 500 }}>
                                        {dateLabel}
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ 
                                        fontWeight: 800, color: pointColor, fontSize: '1.25rem', fontFamily: 'var(--font-heading, "Outfit")',
                                        display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end'
                                    }}>
                                        {isEarn ? '+' : '-'}{points.toLocaleString()}
                                    </div>
                                    <div style={{ 
                                        display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end',
                                        color: isEarn ? 'rgba(45,212,191,0.5)' : 'rgba(255,107,107,0.5)', 
                                        fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', marginTop: '0.15rem' 
                                    }}>
                                        {isEarn ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} 
                                        {isEarn ? 'Earned' : 'Redeemed'}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
            </div>

            {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
                    <div className="spinner">
                        <Loader2 color="var(--gold, #ffb703)" size={24} />
                    </div>
                </div>
            )}
            
            {hasMore && !loading && (
                <button 
                    onClick={loadMore} 
                    style={{ 
                        width: '100%', background: 'transparent', color: '#fff', 
                        border: '1px dashed rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '12px', 
                        marginTop: '1.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                >
                    Load More Activity
                </button>
            )}
        </div>
    )
}
