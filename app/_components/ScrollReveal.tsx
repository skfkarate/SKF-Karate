'use client'
import { useEffect, useRef, useState, ReactNode } from 'react'

/**
 * ScrollReveal wrapper — reveals children with a fade-up animation
 * when they scroll into the viewport using IntersectionObserver.
 */
export default function ScrollReveal({ children, delay = 0, className = '', threshold = 0.15 }: { children: ReactNode; delay?: number; className?: string; threshold?: number }) {
    const ref = useRef(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.unobserve(el) // Only animate once
                }
            },
            { threshold }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [threshold])

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: `opacity 0.7s cubic-bezier(0.165, 0.84, 0.44, 1) ${delay}s, transform 0.7s cubic-bezier(0.165, 0.84, 0.44, 1) ${delay}s`,
            }}
        >
            {children}
        </div>
    )
}
