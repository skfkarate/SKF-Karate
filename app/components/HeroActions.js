'use client'

import Link from 'next/link'
import { FaArrowRight, FaPhoneAlt } from 'react-icons/fa'
import { useState } from 'react'
import ContactPopup from './ContactPopup'

export default function HeroActions() {
    const [isPopupOpen, setIsPopupOpen] = useState(false)

    return (
        <>
            <div className="hero__actions animate-in delay-4">
                <Link href="/summer-camp" className="btn btn-primary">
                    Summer Camp 2026 <FaArrowRight />
                </Link>
                <button
                    className="btn btn-secondary"
                    onClick={() => setIsPopupOpen(true)}
                >
                    <FaPhoneAlt style={{ marginRight: '8px' }} /> Contact Us
                </button>
            </div>
            
            <ContactPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
        </>
    )
}
