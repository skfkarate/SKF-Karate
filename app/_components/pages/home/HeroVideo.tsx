'use client'

import { useRef, useEffect, useState } from 'react'

/**
 * Cinematic hero background video.
 * Loads lazily, plays muted & looping, pauses when off-screen for perf.
 */
export default function HeroVideo() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [shouldLoadVideo, setShouldLoadVideo] = useState(false)

    useEffect(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (reduceMotion) return

        let timeoutId: ReturnType<typeof setTimeout> | null = null
        let idleId: number | null = null

        const loadVideo = () => setShouldLoadVideo(true)

        if (typeof window.requestIdleCallback === 'function') {
            idleId = window.requestIdleCallback(loadVideo, { timeout: 1800 })
        } else {
            timeoutId = setTimeout(loadVideo, 900)
        }

        return () => {
            if (idleId !== null && typeof window.cancelIdleCallback === 'function') {
                window.cancelIdleCallback(idleId)
            }
            if (timeoutId !== null) {
                clearTimeout(timeoutId)
            }
        }
    }, [])

    useEffect(() => {
        const video = videoRef.current
        if (!video || !shouldLoadVideo) return

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
    }, [shouldLoadVideo])

    return (
        <video
            ref={videoRef}
            className="hero__video"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
        >
            {shouldLoadVideo ? (
                <source
                    src="/August 4th.mp4"
                    type="video/mp4"
                />
            ) : null}
        </video>
    )
}
