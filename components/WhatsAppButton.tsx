'use client'

import { useState, useEffect } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { BRANCH_WHATSAPP_NUMBERS } from '@/data/constants/contact'

type Props = {
    branch?: string
}

const BRANCH_NUMBERS = BRANCH_WHATSAPP_NUMBERS

export default function WhatsAppButton({ branch }: Props) {
    const [isVisible, setIsVisible] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(true)
        }, 5000)

        return () => clearTimeout(timer)
    }, [])

    if (!isVisible) return null

    const phoneNumber = (branch && BRANCH_NUMBERS[branch]) ? BRANCH_NUMBERS[branch] : BRANCH_NUMBERS.default
    const branchText = branch ? ` ${branch.charAt(0).toUpperCase() + branch.slice(1)}` : ''
    const defaultMessage = `Hi, I'm interested in enrolling at SKF Karate${branchText}. Can you help me?`

    const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`

    return (
        <>
        <style dangerouslySetInnerHTML={{__html: `
            .wa-btn-override { bottom: 2rem; right: 2rem; }
            @media (max-width: 768px) { .wa-btn-override { bottom: 5rem !important; } }
        `}} />
        <a 
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="wa-btn-override"
            style={{
                position: 'fixed',
                zIndex: 1000,
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                fontFamily: 'system-ui, sans-serif'
            }}
            aria-label="Chat with us on WhatsApp"
        >
            <div style={{
                background: '#fff',
                color: '#25D366',
                padding: '0.6rem 1.2rem',
                borderRadius: '50px',
                fontWeight: 'bold',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                marginRight: '0.8rem',
                transform: isHovered ? 'translateX(0)' : 'translateX(20px)',
                opacity: isHovered ? 1 : 0,
                transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s',
                pointerEvents: isHovered ? 'auto' : 'none',
                whiteSpace: 'nowrap'
            }}>
                Chat with us
            </div>
            
            <div style={{
                background: '#25D366',
                color: '#fff',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
                transition: 'transform 0.3s, box-shadow 0.3s',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
                cursor: 'pointer'
            }}>
                <FaWhatsapp size={32} />
            </div>
        </a>
        </>
    )
}
