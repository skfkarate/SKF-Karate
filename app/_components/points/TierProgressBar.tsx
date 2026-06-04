'use client'

import { motion } from 'framer-motion'
import { Target } from 'lucide-react'
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
        <div style={{ 
            background: 'rgba(255,255,255,0.02)', 
            border: '1px solid rgba(255,255,255,0.05)', 
            padding: '2.5rem', 
            borderRadius: '24px', 
            marginBottom: '3rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Soft background glow based on current tier */}
            <div style={{
                position: 'absolute', top: '-50%', left: '-20%', width: '100%', height: '200%',
                background: `radial-gradient(circle, ${currentTierObj.color}15 0%, transparent 60%)`,
                pointerEvents: 'none', zIndex: 0
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                    <div>
                        <span style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '0.75rem', fontWeight: 800, display: 'block', marginBottom: '0.5rem' }}>
                            Current Rank
                        </span>
                        <h3 style={{ 
                            margin: 0, fontSize: '2rem', fontFamily: 'var(--font-heading, "Outfit")',
                            color: currentTierObj.color, textTransform: 'uppercase', letterSpacing: '0.05em',
                            textShadow: `0 0 20px ${currentTierObj.color}80`, lineHeight: 1
                        }}>
                            {currentTierObj.label}
                        </h3>
                        <p style={{ margin: '0.5rem 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                            Lifetime points: <strong style={{ color: '#fff' }}>{totalEarned.toLocaleString()}</strong>
                        </p>
                    </div>

                    {nextTierObj && (
                        <div style={{ textAlign: 'right', background: 'rgba(0,0,0,0.3)', padding: '1rem 1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end', marginBottom: '0.25rem' }}>
                                <Target size={14} color="rgba(255,255,255,0.4)" />
                                <span style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.75rem', fontWeight: 700 }}>Next Goal</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                <strong style={{ color: '#fff', fontSize: '1.25rem', fontFamily: 'var(--font-heading, "Outfit")' }}>{pointsToNext.toLocaleString()}</strong>
                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>pts to</span>
                                <strong style={{ color: nextTierObj.color, fontSize: '1.1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{nextTierObj.label}</strong>
                            </div>
                        </div>
                    )}
                </div>

                {/* Progress Bar Track */}
                <div style={{ position: 'relative', height: '16px', background: '#0a0e16', borderRadius: '50px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.8)' }}>
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
                        style={{ 
                            position: 'absolute', 
                            top: 0, left: 0, bottom: 0, 
                            background: `linear-gradient(90deg, ${currentTierObj.color}80, ${currentTierObj.color})`,
                            boxShadow: `0 0 20px ${currentTierObj.color}60`,
                            borderRadius: '50px',
                        }} 
                    >
                        {/* Shimmer effect inside progress bar */}
                        <motion.div 
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)', borderRadius: '50px' }}
                        />
                    </motion.div>
                </div>

                {/* Tier Markers */}
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                    {TIERS.map((tier) => {
                        const isPassed = totalEarned >= tier.min
                        const isCurrent = tier.name === currentTier
                        return (
                            <div key={tier.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', zIndex: 2 }}>
                                <div style={{ 
                                    width: isCurrent ? '24px' : '16px', 
                                    height: isCurrent ? '24px' : '16px', 
                                    borderRadius: '50%', 
                                    background: isPassed ? tier.color : '#1a202c',
                                    border: isPassed ? `2px solid #fff` : '2px solid rgba(255,255,255,0.1)',
                                    boxShadow: isPassed ? `0 0 15px ${tier.color}80` : 'none',
                                    transition: 'all 0.3s ease',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {isCurrent && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />}
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <span style={{ 
                                        display: 'block', color: isCurrent ? '#fff' : isPassed ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.3)', 
                                        fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                                        transition: 'color 0.3s ease'
                                    }}>
                                        {tier.label}
                                    </span>
                                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', fontWeight: 600 }}>
                                        {tier.min > 0 ? `${(tier.min / 1000).toFixed(tier.min % 1000 === 0 ? 0 : 1)}k` : '0'}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>

            </div>
        </div>
    )
}
