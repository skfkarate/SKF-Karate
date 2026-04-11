'use client'

import { useState, useEffect } from 'react'
import { FaGraduationCap, FaVideo, FaBirthdayCake, FaCoins, FaShoppingBag, FaTrophy, FaHandshake, FaMedal } from 'react-icons/fa'

const IconMap: Record<string, any> = {
    GRADING_PASS: { icon: FaGraduationCap, color: '#4caf50' },
    WATCH_VIDEO: { icon: FaVideo, color: '#2196f3' },
    BIRTHDAY: { icon: FaBirthdayCake, color: '#e91e63' },
    LOGIN_BONUS: { icon: FaCoins, color: 'var(--gold)' },
    REDEEM: { icon: FaShoppingBag, color: '#9c27b0' },
    TOURNAMENT_GOLD: { icon: FaTrophy, color: '#ffb703' },
    TOURNAMENT_SILVER: { icon: FaTrophy, color: '#e0e0e0' },
    TOURNAMENT_BRONZE: { icon: FaTrophy, color: '#cd7f32' },
    REFERRAL: { icon: FaHandshake, color: '#00bcd4' },
    DEFAULT: { icon: FaMedal, color: '#888' }
}

export default function PointsHistory() {
    const [transactions, setTransactions] = useState<any[]>([])
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [hasMore, setHasMore] = useState(true)

    const fetchHistory = async (p: number) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/points/history?page=${p}&limit=10`)
            if (res.ok) {
                const data = await res.json()
                if (p === 1) setTransactions(data.transactions)
                else setTransactions(prev => [...prev, ...data.transactions])
                
                if (data.transactions.length < 10) setHasMore(false)
            }
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchHistory(1)
    }, [])

    const loadMore = () => {
        const next = page + 1
        setPage(next)
        fetchHistory(next)
    }

    if (transactions.length === 0 && !loading) {
        return <div style={{ color: '#666', textAlign: 'center', padding: '2rem' }}>No point records found yet. Start training to earn points!</div>
    }

    return (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '2rem' }}>
            <h3 style={{ margin: '0 0 1.5rem', color: '#fff', fontSize: '1.2rem' }}>History Timeline</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {transactions.map((tx) => {
                    const match = tx.type === 'REDEEM' ? IconMap['REDEEM'] : (IconMap[tx.reason] || IconMap['DEFAULT'])
                    const Icon = match.icon
                    const sign = tx.type === 'EARN' ? '+' : ''
                    const pointColor = tx.type === 'EARN' ? '#4caf50' : '#ff4444'

                    return (
                        <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#0a0a0a', padding: '1rem', borderRadius: '8px', border: '1px solid #222' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${match.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: match.color }}>
                                <Icon />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4 style={{ margin: 0, color: '#fff', fontSize: '0.95rem' }}>{tx.reason.replace(/_/g, ' ')}</h4>
                                <span style={{ color: '#666', fontSize: '0.8rem' }}>{new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                            <div style={{ fontWeight: 'bold', color: pointColor, fontSize: '1.1rem' }}>
                                {sign}{tx.points}
                            </div>
                        </div>
                    )
                })}
            </div>

            {loading && <div style={{ textAlign: 'center', padding: '1rem', color: '#888' }}>Loading...</div>}
            
            {hasMore && !loading && (
                <button onClick={loadMore} style={{ width: '100%', background: 'transparent', color: 'var(--gold)', border: '1px solid var(--gold)', padding: '0.8rem', borderRadius: '8px', marginTop: '1.5rem', cursor: 'pointer', fontWeight: 'bold' }}>
                    Load More
                </button>
            )}
        </div>
    )
}
