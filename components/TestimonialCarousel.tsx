'use client'

import { useState } from 'react'
import { testimonials } from '@/data/seed/testimonials'
import { FaStar } from 'react-icons/fa'
import { useNonce } from '@/components/NonceProvider'

export default function TestimonialCarousel() {
    const nonce = useNonce()
    const [isHovered, setIsHovered] = useState(false)
    
    // Duplicate testimonials to ensure enough content for smooth infinite scrolling
    const infiniteTestimonials = [...testimonials, ...testimonials, ...testimonials, ...testimonials]

    return (
        <div 
            style={{ 
                width: '100%', 
                overflow: 'hidden', 
                position: 'relative', 
                padding: '2rem 0 4rem' 
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <style nonce={nonce}>{`
                .t-marquee-container {
                    display: flex;
                    width: max-content;
                    animation: marquee 40s linear infinite;
                }
                .t-marquee-container.paused {
                    animation-play-state: paused;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .t-card {
                    width: 400px;
                    margin: 0 2rem;
                    background: transparent;
                    border: none;
                    padding: 2rem 1rem;
                    transition: transform 0.4s, opacity 0.4s;
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    opacity: 0.6;
                }
                .t-card:hover {
                    transform: translateY(-4px);
                    opacity: 1;
                }
                @media (max-width: 480px) {
                    .t-card {
                        width: 300px;
                        margin: 0 1rem;
                    }
                }
                @media (prefers-reduced-motion: reduce) {
                    .t-marquee-container {
                        animation: none;
                        flex-wrap: wrap;
                        justify-content: center;
                        width: 100%;
                    }
                    .t-card {
                        margin-bottom: 2rem;
                    }
                }
            `}</style>
            
            {/* Left/Right Fade Masks for Marquee */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '100px', background: 'linear-gradient(to right, #000, transparent)', zIndex: 10, pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '100px', background: 'linear-gradient(to left, #000, transparent)', zIndex: 10, pointerEvents: 'none' }} />

            <div className={`t-marquee-container ${isHovered ? 'paused' : ''}`}>
                {infiniteTestimonials.map((t, idx) => (
                    <div className="t-card" key={`${t.id}-${idx}`}>
                        <div>
                            <div style={{ display: 'flex', gap: '0.2rem', color: 'var(--gold, #ffb703)', marginBottom: '1.2rem' }}>
                                {[...Array(t.rating)].map((_, i) => <FaStar key={i} />)}
                            </div>
                            <p style={{ fontSize: '1.25rem', fontStyle: 'italic', color: '#fff', lineHeight: 1.6, marginBottom: '2rem', fontFamily: 'var(--font-heading)' }}>
                                &quot;{t.quote}&quot;
                            </p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                            <div>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--gold)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>{t.name}</h4>
                                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>Parent of {t.parentOf}</span>
                            </div>
                            <span style={{ 
                                color: 'rgba(255,255,255,0.3)', 
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '2px'
                            }}>
                                {t.branch}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
