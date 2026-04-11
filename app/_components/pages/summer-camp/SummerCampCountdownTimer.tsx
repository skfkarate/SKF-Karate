'use client'

import { useState, useEffect } from 'react'

export default function SummerCampCountdownTimer({ targetDate }) {
    const calculateTimeLeft = () => {
        const target = new Date(targetDate).getTime()
        const now = Date.now()
        const diff = target - now

        if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }

        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
        }
    }

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft)

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(calculateTimeLeft())
        }, 1000)
        return () => clearInterval(interval)
    }, [targetDate])

    return (
        <div className="countdown" suppressHydrationWarning>
            <div className="countdown__unit">
                <span className="countdown__number" suppressHydrationWarning>{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="countdown__label">Days</span>
            </div>
            <span className="countdown__sep">:</span>
            <div className="countdown__unit">
                <span className="countdown__number" suppressHydrationWarning>{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="countdown__label">Hours</span>
            </div>
            <span className="countdown__sep">:</span>
            <div className="countdown__unit">
                <span className="countdown__number" suppressHydrationWarning>{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="countdown__label">Minutes</span>
            </div>
            <span className="countdown__sep">:</span>
            <div className="countdown__unit">
                <span className="countdown__number" suppressHydrationWarning>{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="countdown__label">Seconds</span>
            </div>
        </div>
    )
}
