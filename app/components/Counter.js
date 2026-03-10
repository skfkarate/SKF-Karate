'use client'

import { useState, useEffect, useRef } from 'react'

export default function Counter({ target, label, suffix = '+' }) {
    const [count, setCount] = useState(0)
    const ref = useRef(null)
    const started = useRef(false)

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !started.current) {
                started.current = true
                const duration = 2000
                const steps = 60
                const increment = target / steps
                let current = 0
                const timer = setInterval(() => {
                    current += increment
                    if (current >= target) {
                        setCount(target)
                        clearInterval(timer)
                    } else {
                        setCount(Math.floor(current))
                    }
                }, duration / steps)
            }
        }, { threshold: 0.5 })
        if (ref.current) observer.observe(ref.current)
        return () => observer.disconnect()
    }, [target])

    return (
        <div className="stat" ref={ref}>
            <span className="stat__number">{count}{suffix}</span>
            <span className="stat__label">{label}</span>
        </div>
    )
}
