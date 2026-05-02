'use client'

import { useRef, useEffect } from 'react'

/**
 * Cinematic hero background video.
 * Loads lazily, plays muted & looping, pauses when off-screen for perf.
 */
export default function HeroVideo() {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        // Pause video when hero scrolls out of view to save GPU/battery
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    video.play().catch(() => {})
                } else {
                    video.pause()
                }
            },
            { threshold: 0.1 }
        )

        observer.observe(video)
        return () => observer.disconnect()
    }, [])

    return (
        <video
            ref={videoRef}
            className="hero__video"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
        >
            <source
                src="/August 4th.mp4"
                type="video/mp4"
            />
        </video>
    )
}
