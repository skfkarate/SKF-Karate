'use client'

import Link from 'next/link'
import { FaPhoneAlt, FaEnvelope, FaTimes, FaArrowRight } from 'react-icons/fa'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import './ContactPopup.css'

export default function ContactPopup({ isOpen, onClose }) {
    const [shouldRender, setShouldRender] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true)
            document.body.style.overflow = 'hidden'
        } else {
            const timer = setTimeout(() => {
                setShouldRender(false)
            }, 300)
            document.body.style.overflow = 'unset'
            return () => clearTimeout(timer)
        }

        return () => { document.body.style.overflow = 'unset' }
    }, [isOpen])

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [onClose])

    if (!shouldRender || !mounted) return null

    return createPortal(
        <div className={`contact-popup-overlay ${isOpen ? 'open' : 'closed'}`} onClick={onClose}>
            <div className="contact-popup" onClick={(e) => e.stopPropagation()}>
                {/* Top accent gradient bar */}
                <div className="contact-popup__accent"></div>

                <button className="contact-popup__close" onClick={onClose} aria-label="Close">
                    <FaTimes />
                </button>

                <div className="contact-popup__body">
                    <div className="contact-popup__header">
                        <span className="contact-popup__label">Get in Touch</span>
                        <h3 className="contact-popup__title">How can we help?</h3>
                    </div>

                    <div className="contact-popup__options">
                        <a href="tel:+919019971726" className="contact-option contact-option--call">
                            <div className="contact-option__left">
                                <div className="contact-option__icon">
                                    <FaPhoneAlt />
                                </div>
                                <div className="contact-option__info">
                                    <span className="contact-option__name">Call Us Now</span>
                                    <span className="contact-option__detail">+91 90199 71726</span>
                                </div>
                            </div>
                            <FaArrowRight className="contact-option__arrow" />
                        </a>

                        <Link href="/contact" className="contact-option contact-option--form" onClick={onClose}>
                            <div className="contact-option__left">
                                <div className="contact-option__icon">
                                    <FaEnvelope />
                                </div>
                                <div className="contact-option__info">
                                    <span className="contact-option__name">Request a Callback</span>
                                    <span className="contact-option__detail">We'll reach out to you</span>
                                </div>
                            </div>
                            <FaArrowRight className="contact-option__arrow" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}

