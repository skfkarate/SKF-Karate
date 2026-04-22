import Link from 'next/link'
import { FaCalendarPlus } from 'react-icons/fa'
import { useEffect, useState } from 'react'

export default function MobileStickyCTA() {
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
        <Link
            href="/book-trial"
            className={`mobile-sticky-cta ${isVisible ? 'visible' : ''}`}
            aria-label="Book Free Trial"
        >
            <FaCalendarPlus />
            <span>Book Free Trial</span>
        </Link>
    )
}
