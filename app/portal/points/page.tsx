'use client'

import { useState, useEffect } from 'react'
import { POINT_RULES } from '@/lib/points/pointsService'
import TierProgressBar from '@/app/_components/points/TierProgressBar'
import PointsHistory from '@/app/_components/points/PointsHistory'
import { FaCoins, FaInfoCircle, FaTrophy } from 'react-icons/fa'

export default function PointsPageClient() {
    const [data, setData] = useState<any>(null)
    const [leaderboard, setLeaderboard] = useState<any[]>([])
    const [showHowToEarn, setShowHowToEarn] = useState(false)

    useEffect(() => {
        fetch('/api/points/balance').then(r => r.json()).then(d => setData(d)).catch(console.error)
        fetch('/api/points/leaderboard').then(r => r.json()).then(d => setLeaderboard(d.leaderboard || [])).catch(console.error)
    }, [])

    if (!data) return <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading gamification logic...</div>

    return (
        <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', padding: '3rem 2rem', fontFamily: 'system-ui, sans-serif' }}>
            <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                
                {/* Header Section */}
                <div style={{ textAlign: 'center', background: 'linear-gradient(180deg, rgba(255, 183, 3, 0.1) 0%, rgba(0,0,0,0) 100%)', borderRadius: '16px', padding: '3rem 1rem', border: '1px solid rgba(255,183,3,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <FaCoins style={{ fontSize: '3rem', color: 'var(--gold, #ffb703)' }} />
                        <h1 style={{ fontSize: '4.5rem', fontWeight: 800, margin: 0, lineHeight: 1, textShadow: '0 0 20px rgba(255, 183, 3, 0.4)' }}>{data.balance}</h1>
                    </div>
                    <p style={{ color: '#aaa', fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>Current Balance</p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'revert', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                        <TierProgressBar currentTier={data.tier} totalEarned={data.totalEarned} />
                        
                        {/* How To Earn Collapsible */}
                        <div style={{ background: '#0a0a0a', border: '1px solid #222', borderRadius: '12px', overflow: 'hidden' }}>
                            <button onClick={() => setShowHowToEarn(!showHowToEarn)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'transparent', color: '#fff', border: 'none', padding: '1.5rem', cursor: 'pointer', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FaInfoCircle style={{ color: '#4caf50' }} /> How to Earn Points</span>
                                <span>{showHowToEarn ? '−' : '+'}</span>
                            </button>
                            {showHowToEarn && (
                                <div style={{ borderTop: '1px solid #222' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                        <tbody>
                                            {Object.entries(POINT_RULES).map(([key, val]) => (
                                                <tr key={key} style={{ borderBottom: '1px solid #111' }}>
                                                    <td style={{ padding: '1rem 1.5rem', color: '#ccc' }}>{key.replace(/_/g, ' ')}</td>
                                                    <td style={{ padding: '1rem 1.5rem', color: '#4caf50', fontWeight: 'bold', textAlign: 'right' }}>+{val}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <PointsHistory />
                    </div>

                    {/* Leaderboard Section */}
                    <div style={{ background: 'rgba(255, 183, 3, 0.02)', border: '1px solid rgba(255, 183, 3, 0.1)', borderRadius: '12px', padding: '2rem', height: 'fit-content' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
                            <FaTrophy style={{ color: 'var(--gold)', fontSize: '1.5rem' }} />
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#fff' }}>Leaderboard (This Month)</h3>
                        </div>
                        
                        {leaderboard.length === 0 ? (
                            <p style={{ color: '#666', fontSize: '0.9rem', textAlign: 'center' }}>No points earned this month yet.</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {leaderboard.map((lb, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#000', padding: '0.8rem 1rem', borderRadius: '8px', border: idx < 3 ? `1px solid var(--gold)` : '1px solid #222', boxShadow: idx < 3 ? '0 0 10px rgba(255,183,3,0.1)' : 'none' }}>
                                        <div style={{ width: '24px', fontWeight: 'bold', color: idx === 0 ? 'var(--gold)' : idx === 1 ? '#e0e0e0' : idx === 2 ? '#cd7f32' : '#666', fontSize: '1.1rem' }}>
                                            #{lb.rank}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 500 }}>{lb.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#888', textTransform: 'capitalize' }}>{lb.belt} Belt</div>
                                        </div>
                                        <div style={{ color: '#4caf50', fontWeight: 'bold' }}>
                                            {lb.points} pts
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}
