'use client'
import { useEffect, useRef, useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

/**
 * ScrollReveal wrapper — reveals children with a fade-up animation
 * when they scroll into the viewport using IntersectionObserver.
 *
 * On soft-navigation (e.g. portal → home), elements may already be in
 * the viewport at mount time. We handle this by eagerly checking
 * via getBoundingClientRect right after the observer is attached.
 */
export default function ScrollReveal({ children, delay = 0, className = '', threshold = 0.15 }: { children: ReactNode; delay?: number; className?: string; threshold?: number }) {
    const ref = useRef<HTMLDivElement>(null)
    const [isVisible, setIsVisible] = useState(false)
    const pathname = usePathname()

    // Reset visibility when the route changes so re-entering this page re-triggers the animation
    useEffect(() => {
        setIsVisible(false)
    }, [pathname])

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const reveal = () => {
            setIsVisible(true)
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    reveal()
                    observer.unobserve(el) // Only animate once per mount
                }
            },
            { threshold }
        )

        observer.observe(el)

        // Eagerly check if element is already in viewport at mount time.
        // IntersectionObserver's first callback is async and may miss
        // elements that are already visible (common after soft-navigation).
        requestAnimationFrame(() => {
            const rect = el.getBoundingClientRect()
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight
            const visibleFraction = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)) / rect.height
            if (visibleFraction >= threshold) {
                reveal()
                observer.unobserve(el)
            }
        })

        return () => observer.disconnect()
    }, [threshold, pathname])

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
