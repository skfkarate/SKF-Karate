'use client'

import { useState, useEffect } from 'react'
import { getCookieConsent, saveCookieConsent } from '../lib/cookies/consent'
import { FaTimes, FaCookieBite } from 'react-icons/fa'
import './CookieConsent.css'

export default function CookieConsent() {
  const [hasConsented, setHasConsented] = useState<boolean>(true) // default true to avoid hydration mismatch, then check
  const [showModal, setShowModal] = useState(false)
  const [preferences, setPreferences] = useState({ analytics: false, marketing: false })

  useEffect(() => {
    const id = window.setTimeout(() => {
      const consent = getCookieConsent()
      if (!consent) {
        setHasConsented(false)
      } else {
        setHasConsented(true)
        setPreferences({ analytics: consent.analytics, marketing: consent.marketing })
      }
    }, 0)
    return () => window.clearTimeout(id)
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
        <div className="cookie-banner" role="dialog" aria-label="Cookie consent banner">
          <div className="cookie-content">
            <h3 className="cookie-title">
              <FaCookieBite /> We value your privacy
            </h3>
            <p className="cookie-text">
              We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
            </p>
          </div>

          <div className="cookie-actions">
            <div className="cookie-btn-row">
              <button
                onClick={handleRejectAll}
                className="cookie-btn"
              >
                Reject All
              </button>
              <button
                onClick={handleAcceptAll}
                className="cookie-btn cookie-btn--primary"
              >
                Accept All
              </button>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="cookie-link"
            >
              Customize Preferences
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="cookie-modal-overlay">
          <div className="cookie-modal" role="dialog" aria-modal="true" aria-label="Customize Cookie Preferences">
            <div className="cookie-modal-header">
              <h2>Cookie Preferences</h2>
              <button
                onClick={() => setShowModal(false)}
                className="cookie-modal-close"
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            <div className="cookie-modal-body">
              <p className="cookie-modal-text">
                We use cookies to help you navigate efficiently and perform certain functions. Detailed information about all cookies is below.
              </p>

              <div className="cookie-option">
                <div className="cookie-option-info">
                  <h4>Strictly Necessary</h4>
                  <p>Essential for the website to function. They cannot be disabled.</p>
                </div>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }}>Always On</span>
              </div>

              <div className="cookie-option">
                <div className="cookie-option-info">
                  <h4>Analytics</h4>
                  <p>Allows us to measure and improve the performance of our site.</p>
                </div>
                <button
                  type="button"
                  className={`cookie-toggle ${preferences.analytics ? 'cookie-toggle--active' : ''}`}
                  onClick={() => setPreferences({...preferences, analytics: !preferences.analytics})}
                  aria-label="Toggle analytics cookies"
                  aria-pressed={preferences.analytics}
                >
                  <div className="cookie-toggle-dot" />
                </button>
              </div>

              <div className="cookie-option">
                <div className="cookie-option-info">
                  <h4>Marketing</h4>
                  <p>Tracks visitors across websites to display relevant ads.</p>
                </div>
                <button
                  type="button"
                  className={`cookie-toggle ${preferences.marketing ? 'cookie-toggle--active' : ''}`}
                  onClick={() => setPreferences({...preferences, marketing: !preferences.marketing})}
                  aria-label="Toggle marketing cookies"
                  aria-pressed={preferences.marketing}
                >
                  <div className="cookie-toggle-dot" />
                </button>
              </div>
            </div>

            <div className="cookie-modal-footer">
              <button
                onClick={handleSavePreferences}
                className="cookie-btn"
                style={{ flex: 'none', padding: '0.6rem 1.2rem' }}
              >
                Save
              </button>
              <button
                onClick={handleAcceptAll}
                className="cookie-btn cookie-btn--primary"
                style={{ flex: 'none', padding: '0.6rem 1.2rem' }}
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
