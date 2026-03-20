'use client'
import { useEffect, useRef, useState } from 'react'

/**
 * CountUp — animates a number from 0 to `end` when it scrolls into view.
 * Supports a suffix like "+" and a prefix.
 */
export default function CountUp({ end, suffix = '', prefix = '', duration = 2000 }) {
    const ref = useRef(null)
    const [count, setCount] = useState(0)
    const [started, setStarted] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !started) {
                    setStarted(true)
                    observer.unobserve(el)
                }
            },
            { threshold: 0.3 }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [started])

    useEffect(() => {
        if (!started) return

        const numericEnd = typeof end === 'string' ? parseInt(end.replace(/[^0-9]/g, '')) : end
        if (isNaN(numericEnd)) return

        let startTime = null
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * numericEnd))
            if (progress < 1) {
                requestAnimationFrame(step)
            }
        }
        requestAnimationFrame(step)
    }, [started, end, duration])

    return (
        <span ref={ref}>
            {prefix}{count.toLocaleString()}{suffix}
        </span>
    )
}
