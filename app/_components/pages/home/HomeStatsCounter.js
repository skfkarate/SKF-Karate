'use client'

import { useState, useEffect, useRef } from 'react'

export default function HomeStatsCounter({ target, label, suffix = '+' }) {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const started = useRef(false)

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true
                const duration = 2000
                let startTime = null

                function animate(timestamp) {
                    if (!startTime) startTime = timestamp
                    const elapsed = timestamp - startTime
                    const progress = Math.min(elapsed / duration, 1)
                    // Ease-out curve for natural deceleration
                    const eased = 1 - Math.pow(1 - progress, 3)
                    setCount(Math.floor(eased * target))
                    if (progress < 1) {
                        requestAnimationFrame(animate)
                    } else {
                        setCount(target)
                    }
                }
                requestAnimationFrame(animate)
            }
        }, { threshold: 0.5 })
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [target])

    return (
        <div className="stat" ref={ref}>
            <span className="stat__number">{count.toLocaleString()}{suffix}</span>
            <span className="stat__label">{label}</span>
        </div>
    )
}
