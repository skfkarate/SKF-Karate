'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowLeft, CheckCircle } from 'lucide-react'
import '../error-pages.css'

export default function ComingSoonPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setTimeout(() => {
      setSubmitted(true)
      setLoading(false)
    }, 800)
  }

  return (
    <div className="system-page">
      {/* Ambient background */}
      <div className="system-orb system-orb--1" style={{ background: 'rgba(59, 130, 246, 0.12)' }} />
      <div className="system-orb system-orb--2" style={{ background: 'rgba(139, 92, 246, 0.08)' }} />
      <div className="system-orb system-orb--3" />
      <div className="system-watermark">近日</div>

      <div className="system-content container">
        {/* Icon */}
        <div className="system-icon-wrap system-icon-wrap--soon">
          <Sparkles className="system-icon" />
        </div>

        {/* Badge */}
        <span className="system-badge system-badge--soon">In Development</span>

        {/* Title */}
        <h1 className="system-title">
          Something Great Is <span className="text-gradient">Coming</span>
        </h1>

        {/* Description */}
        <p className="system-text">
          We&apos;re building a premium experience for this section.
          Leave your email below and we&apos;ll notify you the moment it&apos;s ready.
        </p>

        {/* Form or Success State */}
        {submitted ? (
          <div className="system-success">
            <div className="system-success-icon">
              <CheckCircle size={22} />
            </div>
            <h3>You&apos;re on the list!</h3>
            <p>
              We&apos;ll send you a notification when this section launches.
              Thank you for your interest.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="system-form">
            <div className="system-input-group">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="system-input"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading}
                className="system-submit-btn"
              >
                {loading ? 'Joining...' : 'Notify Me'}
              </button>
            </div>
          </form>
        )}

        {/* Back action */}
        <div className="system-actions">
          <Link href="/" className="btn btn-secondary">
            <ArrowLeft size={16} />
            Back to Homepage
          </Link>
        </div>

        {/* Footer */}
        <div className="system-divider" />
        <p className="system-footer">
          Follow us on social media for real-time updates.
        </p>
      </div>
    </div>
  )
}
