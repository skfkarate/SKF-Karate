'use client'

import { TIERS } from '@/lib/points/pointsService'

export default function TierProgressBar({ currentTier, totalEarned }: { currentTier: string, totalEarned: number }) {
    
    let currentIndex = TIERS.findIndex(t => t.name === currentTier)
    if (currentIndex === -1) currentIndex = 0
    
    const currentTierObj = TIERS[currentIndex]
    const nextTierObj = TIERS[currentIndex + 1]

    let progress = 100
    if (nextTierObj) {
        const span = nextTierObj.min - currentTierObj.min
        const currentSpan = totalEarned - currentTierObj.min
        progress = Math.min(100, Math.max(0, (currentSpan / span) * 100))
    }

    const pointsToNext = nextTierObj ? nextTierObj.min - totalEarned : 0

    return (
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1rem' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: currentTierObj.color, textTransform: 'capitalize', textShadow: `0 0 10px ${currentTierObj.color}40` }}>
                        {currentTierObj.label}
                    </h3>
                    <p style={{ margin: '0.5rem 0 0', color: '#888', fontSize: '0.9rem' }}>Lifetime points: <strong>{totalEarned}</strong></p>
                </div>
                {nextTierObj && (
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem' }}>
                            <strong style={{ color: '#fff' }}>{pointsToNext}</strong> points to
                        </p>
                        <p style={{ margin: '0.2rem 0 0', color: nextTierObj.color, fontSize: '0.9rem', fontWeight: 'bold' }}>
                            {nextTierObj.label}
                        </p>
                    </div>
                )}
            </div>

            <div style={{ position: 'relative', height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '50px', marginBottom: '1rem', overflow: 'hidden' }}>
                <div style={{ 
                    position: 'absolute', 
                    top: 0, left: 0, bottom: 0, 
                    width: `${progress}%`, 
                    background: currentTierObj.color,
                    boxShadow: `0 0 10px ${currentTierObj.color}`,
                    borderRadius: '50px',
                    transition: 'width 1s ease-out'
                }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#666' }}>
                {TIERS.map((tier, idx) => {
                    const isPassed = totalEarned >= tier.min
                    const isCurrent = tier.name === currentTier
                    return (
                        <div key={tier.name} style={{ textAlign: 'center', opacity: isPassed ? 1 : 0.5, position: 'relative' }}>
                            <div style={{ 
                                width: '12px', height: '12px', borderRadius: '50%', background: isPassed ? tier.color : '#333',
                                border: isCurrent ? `2px solid #fff` : 'none',
                                margin: '0 auto 0.5rem',
                                boxShadow: isCurrent ? `0 0 10px ${tier.color}` : 'none'
                            }} />
                            <span style={{ color: isCurrent ? '#fff' : 'inherit' }}>{tier.min > 0 ? `${tier.min / 1000}k` : '0'}</span>
                        </div>
                    )
                })}
            </div>
            {nextTierObj && (
                <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: '#aaa', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px' }}>
                    <strong style={{ color: '#fff' }}>Upcoming Perk:</strong> Reach {nextTierObj.label} to unlock exclusive redemption catalog tiers.
                </div>
            )}
        </div>
    )
}
