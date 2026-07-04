'use client'

import { useEffect, useRef, useState } from 'react'

export default function HeroVideo() {
    const videoRef = useRef<HTMLVideoElement>(null)

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

        if (document.visibilityState === 'visible') {
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
    }, [])

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
            preload="auto"
            poster="/videos/august-4th-poster.webp"
            tabIndex={-1}
            aria-hidden="true"
        >
            <source
                src="/videos/august-4th.webm"
                type="video/webm"
            />
            <source
                src="/videos/august-4th.mp4"
                type="video/mp4"
            />
        </video>
    )
}
