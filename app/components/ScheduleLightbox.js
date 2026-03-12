'use client'

import { useState, useEffect, useCallback } from 'react'

export default function ScheduleLightbox({ src, alt, title }) {
    const [isOpen, setIsOpen] = useState(false)

    const close = useCallback(() => setIsOpen(false), [])

    useEffect(() => {
        if (!isOpen) return

        const handleKey = (e) => {
            if (e.key === 'Escape') close()
        }

        document.addEventListener('keydown', handleKey)
        document.body.style.overflow = 'hidden'

        return () => {
            document.removeEventListener('keydown', handleKey)
            document.body.style.overflow = ''
        }
    }, [isOpen, close])

    return (
        <>
            <div className="schedule__image-card glass-card" onClick={() => setIsOpen(true)}>
                <h3>{title}</h3>
                <img src={src} alt={alt} />
                <div className="schedule__image-hint">Tap to view full schedule</div>
            </div>

            {isOpen && (
                <div className="lightbox-overlay" onClick={close}>
                    <button className="lightbox-close" aria-label="Close">&times;</button>
                    <img src={src} alt={alt} className="lightbox-image" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </>
    )
}
