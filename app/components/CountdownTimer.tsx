'use client';
import { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate }) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const timer = setInterval(() => {
            const difference = new Date(targetDate) - new Date();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                });
            } else {
                clearInterval(timer);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    // Prevent hydration mismatch by optionally rendering a skeleton until mounted
    if (!isMounted) return <div className="countdown" style={{ opacity: 0 }}></div>;

    return (
        <div className="countdown">
            <div className="countdown__unit">
                <span className="countdown__number">{timeLeft.days.toString().padStart(2, '0')}</span>
                <span className="countdown__label">Days</span>
            </div>
            <span className="countdown__sep">:</span>
            <div className="countdown__unit">
                <span className="countdown__number">{timeLeft.hours.toString().padStart(2, '0')}</span>
                <span className="countdown__label">Hours</span>
            </div>
            <span className="countdown__sep">:</span>
            <div className="countdown__unit">
                <span className="countdown__number">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                <span className="countdown__label">Minutes</span>
            </div>
            <span className="countdown__sep">:</span>
            <div className="countdown__unit">
                <span className="countdown__number">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                <span className="countdown__label">Seconds</span>
            </div>
        </div>
    );
}
