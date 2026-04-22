'use client'

import { useState } from 'react'
import Link from 'next/link'
import '../error-pages.css'

export default function ComingSoonPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!email) return
    setLoading(true)
    setTimeout(() => {
      setSubmitted(true)
      setLoading(false)
    }, 800)
  }

  return (
    <div className="system-page">
      <div className="system-orb system-orb--1" />
      <div className="system-orb system-orb--2" />
      <div className="system-watermark">近日公開</div>

      <div className="system-content container">
        <span className="system-badge">Evolution in Progress</span>
        <h1 className="system-code" style={{ fontSize: 'clamp(3rem, 15vw, 8rem)', letterSpacing: '-2px' }}>
          COMING <span className="text-gradient">SOON</span>
        </h1>
        <h2 className="system-title" style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', textTransform: 'none', fontWeight: 400 }}>
          We are currently crafting a premium experience for this section.
        </h2>
        
        <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
          {submitted ? (
            <div className="contact-success" style={{ padding: '2rem', background: 'rgba(37, 211, 102, 0.05)', borderRadius: '24px', border: '1px solid rgba(37, 211, 102, 0.2)' }}>
              <div className="contact-success-icon" style={{ fontSize: '2rem', marginBottom: '1rem' }}>✓</div>
              <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>You're on the list!</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>We'll notify you the moment this Dojo expansion launches.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="contact-input-wrap">
                <input 
                  type="email" 
                  placeholder="Enter your email for early access" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="contact-input"
                  style={{ paddingLeft: '1.5rem' }}
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '1.2rem' }}
              >
                {loading ? 'Registering...' : 'Join the Waitlist'}
              </button>
            </form>
          )}
        </div>

        <div className="system-actions" style={{ marginTop: '2rem' }}>
          <Link href="/" className="system-link" style={{ color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
