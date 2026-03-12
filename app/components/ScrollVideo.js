'use client'

import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

export default function ScrollVideo() {
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
        offset: isMobile
            ? ['start 0.85', 'end 0.15']   // Tighter range on mobile — kicks in sooner, finishes sooner
            : ['start end', 'end start']     // Full cinematic range on desktop
    })

    // Desktop: dramatic 60%→100%→60% scale  |  Mobile: subtle 88%→100%→88%
    const scale = useTransform(
        scrollYProgress,
        isMobile
            ? [0, 0.25, 0.75, 1]
            : [0, 0.4, 0.6, 1],
        isMobile
            ? [0.88, 1, 1, 0.88]
            : [0.6, 1, 1, 0.6]
    )

    // Desktop: 2rem→0→0→2rem  |  Mobile: 1rem→0→0→1rem (subtler)
    const borderRadius = useTransform(
        scrollYProgress,
        isMobile
            ? [0, 0.25, 0.75, 1]
            : [0, 0.4, 0.6, 1],
        isMobile
            ? ['1rem', '0rem', '0rem', '1rem']
            : ['2rem', '0rem', '0rem', '2rem']
    )

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
            { threshold: 0.3 }
        )

        if (containerRef.current) {
            observer.observe(containerRef.current)
        }

        return () => observer.disconnect()
    }, [])

    return (
        <div ref={containerRef} className="scroll-video-container">
            <motion.div
                className="scroll-video-wrapper"
                style={{ scale, borderRadius }}
            >
                <video
                    ref={videoRef}
                    className="scroll-video"
                    src="/train the elite/train_the_elite_compressed.mp4"
                    autoPlay
                    loop
                    controls
                    playsInline
                />
            </motion.div>
        </div>
    )
}
