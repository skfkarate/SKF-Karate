'use client'

import { useEffect, useRef } from 'react'

/**
 * Cinematic hero background video.
 * Uses optimized muted variants and pauses when off-screen for perf.
 */
export default function HeroVideo() {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        video.defaultMuted = true
        video.muted = true
        video.playsInline = true

        const playVideo = () => {
            if (document.visibilityState === 'visible') {
                video.play().catch(() => {})
            }
        }

        // Pause video when hero scrolls out of view to save GPU/battery
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    playVideo()
                } else {
                    video.pause()
                }
            },
            { rootMargin: '200px 0px', threshold: 0.01 }
        )

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                playVideo()
            } else {
                video.pause()
            }
        }

        playVideo()
        observer.observe(video)
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            observer.disconnect()
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
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
            poster="/videos/home-hero-poster.jpg"
            aria-hidden="true"
        >
            <source
                src="/videos/home-hero-mobile.mp4"
                type="video/mp4"
                media="(max-width: 767px)"
            />
            <source
                src="/videos/home-hero-desktop.mp4"
                type="video/mp4"
            />
        </video>
    )
}
