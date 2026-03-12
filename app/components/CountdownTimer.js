'use client'

import { useState, useEffect } from 'react'

export default function CountdownTimer({ targetDate }) {
    const [mounted, setMounted] = useState(false)
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })

    useEffect(() => {
        setMounted(true)
        const target = new Date(targetDate).getTime()

        const update = () => {
            const now = Date.now()
            const diff = target - now

            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
                return
            }

            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60),
            })
        }

        update()
        const interval = setInterval(update, 1000)
        return () => clearInterval(interval)
    }, [targetDate])

    if (!mounted) {
        return (
            <div className="countdown">
                {['Days', 'Hours', 'Minutes', 'Seconds'].map((label, i) => (
                    <div key={label} style={{ display: 'contents' }}>
                        {i > 0 && <span className="countdown__sep">:</span>}
                        <div className="countdown__unit">
                            <span className="countdown__number">--</span>
                            <span className="countdown__label">{label}</span>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="countdown">
            <div className="countdown__unit">
                <span className="countdown__number">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="countdown__label">Days</span>
            </div>
            <span className="countdown__sep">:</span>
            <div className="countdown__unit">
                <span className="countdown__number">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="countdown__label">Hours</span>
            </div>
            <span className="countdown__sep">:</span>
            <div className="countdown__unit">
                <span className="countdown__number">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="countdown__label">Minutes</span>
            </div>
            <span className="countdown__sep">:</span>
            <div className="countdown__unit">
                <span className="countdown__number">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="countdown__label">Seconds</span>
            </div>
        </div>
    )
}
