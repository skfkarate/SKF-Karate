"use client"

import { useTrialModal } from './TrialModalContext'
import { FaCalendarPlus } from 'react-icons/fa'
import { useEffect, useState } from 'react'

export default function MobileStickyCTA() {
    const { openModal } = useTrialModal()
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Show after scrolling past the first screen
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll() // Trigger on mount to check initial position
        
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <button
            className={`mobile-sticky-cta ${isVisible ? 'visible' : ''}`}
            onClick={(e) => {
                e.preventDefault();
                openModal();
            }}
            aria-label="Book Free Trial"
        >
            <FaCalendarPlus />
            <span>Book Free Trial</span>
        </button>
    )
}
