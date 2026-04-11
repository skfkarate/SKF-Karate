'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa'

export default function ComingSoonPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if(!email) return
    setLoading(true)
    // mock API call
    setTimeout(() => {
      setSubmitted(true)
      setLoading(false)
    }, 800)
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#05080f',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      color: '#fff',
      textAlign: 'center',
      backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(214, 40, 40, 0.15), transparent 50%)'
    }}>
      <div style={{ maxWidth: '500px', width: '100%', padding: '3rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <span style={{ 
          display: 'inline-block', 
          padding: '0.5rem 1rem', 
          backgroundColor: 'rgba(255, 183, 3, 0.1)', 
          color: '#ffb703', 
          borderRadius: '100px', 
          fontSize: '0.8rem', 
          fontWeight: 800, 
          letterSpacing: '0.1em', 
          textTransform: 'uppercase',
          marginBottom: '1.5rem'
        }}>
          Currently in Development
        </span>
        
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '1rem', textTransform: 'uppercase' }}>
          Coming Soon
        </h1>
        
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '2.5rem', lineHeight: 1.6 }}>
          We are putting the final touches on this experience. Join the waitlist to be notified the moment it launches.
        </p>

        {submitted ? (
          <div style={{ padding: '1.5rem', backgroundColor: 'rgba(45, 212, 191, 0.1)', border: '1px solid rgba(45, 212, 191, 0.3)', borderRadius: '12px', color: '#2dd4bf', fontWeight: 600 }}>
            You're on the list! Oss.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', flexDirection: 'column' }}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                backgroundColor: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                outline: 'none'
              }}
            />
            <button 
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: '#d62828',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Joining...' : 'Notify Me'}
            </button>
          </form>
        )}

        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>
          <FaArrowLeft /> Back to Home
        </Link>
      </div>
    </div>
  )
}
