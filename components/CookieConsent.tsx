'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCookieConsent, saveCookieConsent, CookieConsentData } from '../lib/cookies/consent'
import { FaTimes } from 'react-icons/fa'

export default function CookieConsent() {
  const [hasConsented, setHasConsented] = useState<boolean>(true) // default true to avoid hydration mismatch, then check
  const [showModal, setShowModal] = useState(false)
  const [preferences, setPreferences] = useState({ analytics: false, marketing: false })

  useEffect(() => {
    const consent = getCookieConsent()
    if (!consent) {
      setHasConsented(false)
    } else {
      setHasConsented(true)
      setPreferences({ analytics: consent.analytics, marketing: consent.marketing })
    }
  }, [])

  const handleAcceptAll = () => {
    saveCookieConsent(true, true)
    setHasConsented(true)
    setShowModal(false)
  }

  const handleRejectAll = () => {
    saveCookieConsent(false, false)
    setHasConsented(true)
    setShowModal(false)
  }

  const handleSavePreferences = () => {
    saveCookieConsent(preferences.analytics, preferences.marketing)
    setHasConsented(true)
    setShowModal(false)
  }

  if (hasConsented && !showModal) return null

  return (
    <>
      {!hasConsented && !showModal && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          right: '20px',
          maxWidth: '500px',
          margin: '0 auto',
          background: 'rgba(5, 8, 15, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '20px',
          zIndex: 9999,
          color: '#fff',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }} role="dialog" aria-label="Cookie consent banner">
          <div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>We value your privacy</h3>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#a0aabf', lineHeight: '1.5' }}>
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => setShowModal(true)}
              style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Customize &rarr;
            </button>
            <div style={{ flex: '1' }}></div>
            <button 
              onClick={handleRejectAll}
              style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
            >
              Reject All
            </button>
            <button 
              onClick={handleAcceptAll}
              style={{ padding: '8px 16px', background: 'var(--accent-crimson, #e53935)', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
            >
              Accept All
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(5px)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: '#05080f',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '500px',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh'
          }} role="dialog" aria-modal="true" aria-label="Customize Cookie Preferences">
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Cookie Preferences</h2>
              <button 
                onClick={() => {
                  if (hasConsented) setShowModal(false)
                  else setShowModal(false) // Just close modal, banner will show
                }}
                style={{ background: 'transparent', border: 'none', color: '#a0aabf', cursor: 'pointer' }}
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>
            
            <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#a0aabf', lineHeight: '1.5' }}>
                We use cookies to help you navigate efficiently and perform certain functions. You will find detailed information about all cookies under each consent category below.
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>Strictly Necessary</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#a0aabf' }}>Essential for the website to function. They cannot be disabled.</p>
                </div>
                <span style={{ color: '#4caf50', fontSize: '0.85rem', fontWeight: 'bold' }}>Always On</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>Analytics</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#a0aabf' }}>Allows us to measure and improve the performance of our site.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.analytics} 
                  onChange={(e) => setPreferences({...preferences, analytics: e.target.checked})}
                  aria-label="Toggle Analytics Cookies"
                  style={{ width: '20px', height: '20px', accentColor: 'var(--accent-crimson, #e53935)' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0' }}>Marketing</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: '#a0aabf' }}>Tracks visitors across websites to display relevant ads.</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={preferences.marketing} 
                  onChange={(e) => setPreferences({...preferences, marketing: e.target.checked})}
                  aria-label="Toggle Marketing Cookies"
                  style={{ width: '20px', height: '20px', accentColor: 'var(--accent-crimson, #e53935)' }}
                />
              </div>
            </div>

            <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={handleSavePreferences}
                style={{ padding: '8px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Save Preferences
              </button>
              <button 
                onClick={handleAcceptAll}
                style={{ padding: '8px 16px', background: 'var(--accent-crimson, #e53935)', border: 'none', color: '#fff', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
