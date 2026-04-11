'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const COOKIE_KEY = 'skf_cookie_consent'

export default function CookieConsent() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const consent = localStorage.getItem(COOKIE_KEY)
        if (!consent) {
            const timer = setTimeout(() => setVisible(true), 2000)
            return () => clearTimeout(timer)
        }
    }, [])

    const accept = () => {
        localStorage.setItem(COOKIE_KEY, 'accepted')
        setVisible(false)
        // Enable GA4 if configured
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('consent', 'update', {
                analytics_storage: 'granted',
            })
        }
    }

    const reject = () => {
        localStorage.setItem(COOKIE_KEY, 'rejected')
        setVisible(false)
        // Ensure GA4 stays denied
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('consent', 'update', {
                analytics_storage: 'denied',
            })
        }
    }

    if (!visible) return null

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '1.5rem',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 9998,
                width: '90%',
                maxWidth: '600px',
                background: 'rgba(10, 14, 22, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '1.5rem 2rem',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
                animation: 'fadeInUp 0.4s ease-out',
            }}
        >
            <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                We use cookies to improve your experience. By continuing you agree to our{' '}
                <Link href="/cookie-policy" style={{ color: 'var(--gold, #ffb703)', textDecoration: 'underline' }}>Cookie Policy</Link>.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                    onClick={reject}
                    style={{
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: 'rgba(255,255,255,0.6)',
                        padding: '0.5rem 1.2rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        transition: 'all 0.2s',
                    }}
                >
                    Reject
                </button>
                <button
                    onClick={accept}
                    style={{
                        background: 'var(--crimson, #dc3545)',
                        border: 'none',
                        color: '#fff',
                        padding: '0.5rem 1.2rem',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        transition: 'all 0.2s',
                    }}
                >
                    Accept All
                </button>
            </div>
        </div>
    )
}
