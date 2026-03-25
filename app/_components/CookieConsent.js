'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaCookieBite, FaTimes } from 'react-icons/fa'
import './CookieConsent.css'

const CONSENT_KEY = 'skf_cookie_consent'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY)
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'accepted')
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem(CONSENT_KEY, 'declined')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="cookie-banner" role="dialog" aria-label="Cookie consent" aria-describedby="cookie-desc">
      <div className="cookie-banner__body">
        <div className="cookie-banner__icon-text">
          <FaCookieBite className="cookie-banner__icon" />
          <div>
            <h4 className="cookie-banner__title">We Value Your Privacy</h4>
            <p className="cookie-banner__desc" id="cookie-desc">
              This website uses essential cookies to ensure it functions correctly.
              By clicking &quot;Accept&quot;, you consent to our use of cookies.
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="cookie-banner__close"
          aria-label="Dismiss cookie banner"
        >
          <FaTimes />
        </button>
      </div>

      <div className="cookie-banner__actions">
        <Link href="/privacy-policy" className="cookie-banner__policy-link">
          Privacy Policy
        </Link>
        <button onClick={handleDecline} className="cookie-banner__btn cookie-banner__btn--decline">
          Decline
        </button>
        <button onClick={handleAccept} className="cookie-banner__btn cookie-banner__btn--accept">
          Accept Cookies
        </button>
      </div>
    </div>
  )
}
