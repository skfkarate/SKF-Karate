'use client'

import { useState, useEffect, useRef } from 'react'
import { TESTIMONIALS } from '@/lib/shop/testimonials'
import { FaStar, FaChevronLeft, FaChevronRight } from 'react-icons/fa'

export default function TestimonialCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isHovered, setIsHovered] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [cardsPerView, setCardsPerView] = useState(3)
    
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setCardsPerView(1)
            } else if (window.innerWidth < 1024) {
                setCardsPerView(2)
            } else {
                setCardsPerView(3)
            }
        }
        
        handleResize()
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsVisible(entry.isIntersecting)
        }, { threshold: 0.1 })

        if (containerRef.current) {
            observer.observe(containerRef.current)
        }
        return () => observer.disconnect()
    }, [])

    const maxIndex = Math.max(0, TESTIMONIALS.length - cardsPerView)

    useEffect(() => {
        if (!isVisible || isHovered) return

        const timer = setInterval(() => {
            setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1))
        }, 4000)

        return () => clearInterval(timer)
    }, [isVisible, isHovered, maxIndex])

    const next = () => setCurrentIndex(p => p >= maxIndex ? 0 : p + 1)
    const prev = () => setCurrentIndex(p => p <= 0 ? maxIndex : p - 1)

    return (
        <div 
            ref={containerRef}
            style={{ width: '100%', overflow: 'hidden', position: 'relative', padding: '1rem 0 3rem' }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <style>{`
                .t-carousel-track {
                    display: flex;
                    gap: 2rem;
                    transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
                }
                .t-card {
                    flex: 0 0 calc((100% - ${(cardsPerView - 1) * 2}rem) / ${cardsPerView});
                    background: var(--bg-card, rgba(20, 33, 61, 0.4));
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 16px;
                    padding: 2.5rem 2rem;
                    backdrop-filter: blur(20px);
                    transition: transform 0.3s, background 0.3s, border-color 0.3s;
                }
                .t-card:hover {
                    transform: translateY(-5px);
                    background: rgba(255,255,255,0.06);
                    border-color: rgba(255, 183, 3, 0.3);
                }
                @media (prefers-reduced-motion: reduce) {
                    .t-carousel-track {
                        transition: none;
                    }
                    .t-card {
                        transition: none;
                    }
                    .t-card:hover {
                        transform: none;
                    }
                }
            `}</style>
            
            <div 
                className="t-carousel-track"
                style={{
                    transform: `translateX(calc(-${currentIndex * (100 / cardsPerView)}% - ${currentIndex * (2 / cardsPerView)}rem))`
                }}
            >
                {TESTIMONIALS.map((t, idx) => (
                    <div className="t-card" key={t.id} style={{ opacity: (idx >= currentIndex && idx < currentIndex + cardsPerView) ? 1 : 0.4 }}>
                        <div style={{ display: 'flex', gap: '0.2rem', color: 'var(--gold, #ffb703)', marginBottom: '1.2rem' }}>
                            {[...Array(t.rating)].map((_, i) => <FaStar key={i} />)}
                        </div>
                        <p style={{ fontSize: '1.05rem', fontStyle: 'italic', color: '#fff', lineHeight: 1.6, marginBottom: '2rem' }}>
                            "{t.quote}"
                        </p>
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

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginTop: '3rem' }}>
                <button onClick={prev} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                    <FaChevronLeft />
                </button>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                    {[...Array(maxIndex + 1)].map((_, i) => (
                        <button 
                            key={i} 
                            onClick={() => setCurrentIndex(i)}
                            style={{ 
                                width: i === currentIndex ? '30px' : '10px', 
                                height: '10px', 
                                borderRadius: '10px', 
                                background: i === currentIndex ? 'var(--gold, #ffb703)' : 'rgba(255,255,255,0.2)',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }} 
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
                <button onClick={next} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.1)'} onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.05)'}>
                    <FaChevronRight />
                </button>
            </div>
        </div>
    )
}
