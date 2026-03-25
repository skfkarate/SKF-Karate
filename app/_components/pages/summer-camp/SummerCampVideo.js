'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FaVolumeMute, FaVolumeUp } from 'react-icons/fa'

export default function SummerCampVideo() {
    const containerRef = useRef(null)
    const videoRef = useRef(null)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start 0.85', 'end 0.15']
    })

    // Desktop: dramatic 60%→100%→60% scale  |  Mobile: subtle 88%→100%→88%
    const scale = useTransform(
        scrollYProgress,
        [0, 0.25, 0.75, 1],
        [0.88, 1, 1, 0.88]
    )

    // Desktop: 2rem→0→0→2rem  |  Mobile: 1rem→0→0→1rem (subtler)
    const borderRadius = useTransform(
        scrollYProgress,
        [0, 0.25, 0.75, 1],
        ['1rem', '0rem', '0rem', '1rem']
    )

    const [isMuted, setIsMuted] = useState(true)

    // Autoplay when it comes into view
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && videoRef.current) {
                    videoRef.current.play().catch(e => console.log('Video play prevented:', e))
                } else if (!entry.isIntersecting && videoRef.current) {
                    videoRef.current.pause()
                }
            },
            { threshold: 0.1 }
        )

        if (containerRef.current) {
            observer.observe(containerRef.current)
        }

        return () => observer.disconnect()
    }, [])

    const toggleMute = (e) => {
        // Prevent event from bubbling up if the video itself has an onclick
        e.stopPropagation()
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    return (
        <div ref={containerRef} className="scroll-video-container" style={{ position: 'relative' }}>
            <motion.div
                className="scroll-video-wrapper"
                style={{ scale, borderRadius, position: 'relative', overflow: 'hidden' }}
            >
                <video
                    ref={videoRef}
                    className="scroll-video"
                    src="/train the elite/train_the_elite_compressed.mp4"
                    autoPlay
                    loop
                    controls={true}
                    muted={isMuted}
                    playsInline
                    style={{ width: '100%', display: 'block' }}
                />
                
                {/* Custom Mute Toggle Button Overlaid on Video */}
                <button
                    onClick={toggleMute}
                    style={{
                        position: 'absolute',
                        top: '20px',
                        right: '20px',
                        background: 'rgba(0,0,0,0.6)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'white',
                        padding: '10px 16px',
                        borderRadius: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        zIndex: 10,
                        backdropFilter: 'blur(4px)',
                        transition: 'var(--transition)',
                        fontFamily: 'var(--font-heading)',
                        fontSize: '0.9rem',
                        letterSpacing: '1px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
                >
                    {isMuted ? (
                        <>
                            <FaVolumeMute />
                            <span>Tap to Unmute</span>
                        </>
                    ) : (
                        <>
                            <FaVolumeUp />
                            <span>Mute</span>
                        </>
                    )}
                </button>
            </motion.div>
        </div>
    )
}
