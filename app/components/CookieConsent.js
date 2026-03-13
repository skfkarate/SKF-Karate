'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaCookieBite, FaTimes } from 'react-icons/fa'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('skf_cookie_consent')
    if (!hasConsented) {
      // Small delay so it doesn't appear immediately on load
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('skf_cookie_consent', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '500px',
      backgroundColor: 'var(--bg-card-hover)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid var(--border-active)',
      borderRadius: '16px',
      padding: '1.25rem 1.5rem',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 100%); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
      
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
          <FaCookieBite style={{ color: 'var(--gold)', fontSize: '1.25rem', flexShrink: 0, marginTop: '3px' }} />
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontFamily: 'var(--font-heading)', letterSpacing: '0.5px' }}>
              We Value Your Privacy
            </h4>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--text-light)', lineHeight: 1.5 }}>
              This website uses cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking &quot;Accept&quot;, you consent to our use of cookies.
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          style={{ 
            background: 'none', border: 'none', color: 'var(--text-muted)', 
            cursor: 'pointer', padding: '0.25rem', display: 'flex' 
          }}
          aria-label="Close"
        >
          <FaTimes />
        </button>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Link href="/privacy-policy" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'underline', marginRight: 'auto' }}>
          Privacy Policy
        </Link>
        <button 
          onClick={() => setIsVisible(false)}
          style={{ 
            background: 'transparent', color: 'var(--text-light)', border: '1px solid var(--border-subtle)',
            padding: '0.5rem 1.25rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer'
          }}
        >
          Decline
        </button>
        <button 
          onClick={handleAccept}
          style={{ 
            background: 'linear-gradient(135deg, var(--crimson), #a51c1c)', color: 'white', border: 'none',
            padding: '0.5rem 1.25rem', borderRadius: '50px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 15px var(--crimson-glow)'
          }}
        >
          Accept Core Cookies
        </button>
      </div>
    </div>
  )
}
