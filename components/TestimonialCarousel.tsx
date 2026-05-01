'use client'

import { useState, useRef } from 'react'
import { testimonials } from '@/data/seed/testimonials'
import { FaStar } from 'react-icons/fa'

export default function TestimonialCarousel() {
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
            <style>{`
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
                    width: 350px;
                    margin: 0 1rem;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-top: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 20px;
                    padding: 2.5rem 2rem;
                    backdrop-filter: blur(24px);
                    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
                    transition: transform 0.4s, background 0.4s, border-color 0.4s, box-shadow 0.4s;
                    flex-shrink: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                }
                .t-card:hover {
                    transform: translateY(-6px);
                    background: rgba(255, 255, 255, 0.06);
                    border-color: rgba(255, 183, 3, 0.4);
                    box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.8), 0 0 20px rgba(255, 183, 3, 0.1);
                }
                @media (max-width: 480px) {
                    .t-card {
                        width: 280px;
                        padding: 2rem 1.5rem;
                        margin: 0 0.5rem;
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
                            <p style={{ fontSize: '1rem', fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.7, marginBottom: '2rem' }}>
                                &quot;{t.quote}&quot;
                            </p>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                            <div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>{t.name}</h4>
                                <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Parent of {t.parentOf}</span>
                            </div>
                            <span style={{ 
                                background: 'rgba(214, 40, 40, 0.1)', 
                                border: '1px solid rgba(214, 40, 40, 0.3)',
                                color: 'var(--crimson, #dc3545)', 
                                padding: '0.2rem 0.6rem', 
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase'
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
