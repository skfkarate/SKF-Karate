'use client'

import { useEffect, useRef, useState } from 'react'

const VIDEO_LOAD_DELAY_MS = 6500

type NetworkConnectionHint = {
    saveData?: boolean
    effectiveType?: string
}

function shouldSkipBackgroundVideo() {
    if (typeof window === 'undefined') return true

    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return true

    const connection = (navigator as Navigator & { connection?: NetworkConnectionHint }).connection
    if (connection?.saveData) return true
    if (connection?.effectiveType && ['slow-2g', '2g'].includes(connection.effectiveType)) {
        return true
    }

    return false
}

/**
 * Cinematic hero background video.
 * Keeps the poster in the first paint and loads video after the page is settled.
 */
export default function HeroVideo() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [shouldLoadVideo, setShouldLoadVideo] = useState(false)

    useEffect(() => {
        if (shouldSkipBackgroundVideo()) return

        let cancelled = false
        let loadDelay: number | undefined

        const enableVideo = () => {
            if (!cancelled) {
                setShouldLoadVideo(true)
            }
        }

        const scheduleVideo = () => {
            loadDelay = window.setTimeout(enableVideo, VIDEO_LOAD_DELAY_MS)
        }

        if (document.readyState === 'complete') {
            scheduleVideo()
        } else {
            window.addEventListener('load', scheduleVideo, { once: true })
        }

        return () => {
            cancelled = true
            window.removeEventListener('load', scheduleVideo)
            if (loadDelay) window.clearTimeout(loadDelay)
        }
    }, [])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        video.defaultMuted = true
        video.muted = true
        video.playsInline = true
        video.controls = false
        video.loop = true
        video.autoplay = true
        video.disablePictureInPicture = true
        video.setAttribute('webkit-playsinline', 'true')
        video.setAttribute('x5-playsinline', 'true')
        video.setAttribute('x5-video-player-type', 'h5-page')
        video.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback')

        const playVideo = () => {
            if (document.visibilityState === 'visible') {
                video.play().catch(() => {})
            }
        }

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                playVideo()
            } else {
                video.pause()
            }
        }

        if (shouldLoadVideo) {
            video.load()
            playVideo()
        }
        video.addEventListener('loadeddata', playVideo)
        video.addEventListener('canplay', playVideo)
        document.addEventListener('visibilitychange', handleVisibilityChange)

        return () => {
            video.removeEventListener('loadeddata', playVideo)
            video.removeEventListener('canplay', playVideo)
            document.removeEventListener('visibilitychange', handleVisibilityChange)
        }
    }, [shouldLoadVideo])

    return (
        <video
            ref={videoRef}
            className="hero__video"
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            disablePictureInPicture
            disableRemotePlayback
            preload="metadata"
            poster="/videos/august-4th-poster.webp"
            tabIndex={-1}
            aria-hidden="true"
        >
            {shouldLoadVideo ? (
                <>
                    <source
                        src="/videos/august-4th.webm"
                        type="video/webm"
                    />
                    <source
                        src="/videos/august-4th.mp4"
                        type="video/mp4"
                    />
                </>
            ) : null}
        </video>
    )
}
