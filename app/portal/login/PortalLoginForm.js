'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AlertCircle, Loader2 } from 'lucide-react'

function getPortalLoginErrorMessage(payload) {
  if (typeof payload?.error === 'string') {
    return payload.error
  }

  if (typeof payload?.error?.message === 'string') {
    return payload.error.message
  }

  if (typeof payload?.message === 'string') {
    return payload.message
  }

  return 'Authentication failed'
}

export default function PortalLoginForm({ callbackUrl }) {
  const router = useRouter()
  const [skfId, setSkfId] = useState('')
  const [dob, setDob] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDobChange = (event) => {
    const input = event.target.value

    if (input.length < dob.length) {
      setDob(input)
      return
    }

    const digits = input.replace(/\D/g, '').slice(0, 8)

    let formatted = digits
    if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`
    } else if (digits.length > 2) {
      formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`
    }

    setDob(formatted)
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skfId: skfId.trim(), dob: dob.trim() }),
      })
      const data = await res.json().catch(() => null)

      if (res.ok) {
        router.replace(callbackUrl)
        router.refresh()
      } else {
        setError(getPortalLoginErrorMessage(data))
        setLoading(false)
      }
    } catch {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="dojo-login">
      <div className="dojo-login__bg-glow" />
      <div className="dojo-login__watermark">空手道</div>

      <div className="dojo-login__content">
        <div className="dojo-login__header">
          <div className="dojo-login__brand">
            <Image
              src="/logo/SKF logo.png"
              alt="SKF Logo"
              width={34}
              height={34}
              className="dojo-login__logo"
            />
            <span className="dojo-login__brand-text">SKF Karate</span>
          </div>

          <h1 className="dojo-login__title">ATHLETE<br />PORTAL.</h1>
          <p className="dojo-login__subtitle">Authenticate your identity to continue.</p>
        </div>

        <form onSubmit={handleLogin} className="dojo-login__form">
          <div className="dojo-input-group dojo-login__stagger dojo-login__stagger--1">
            <input
              type="text"
              id="skfId"
              className="dojo-input"
              placeholder="SKFXXXXXXX"
              value={skfId}
              onChange={(event) => setSkfId(event.target.value)}
              required
            />
            <label htmlFor="skfId">SKF ID</label>
          </div>

          <div className="dojo-input-group dojo-login__stagger dojo-login__stagger--2">
            <input
              type="text"
              id="dob"
              className="dojo-input"
              placeholder="DD-MM-YYYY"
              value={dob}
              onChange={handleDobChange}
              required
            />
            <label htmlFor="dob">Date of Birth</label>
          </div>

          <button
            type="submit"
            disabled={loading || !skfId || !dob}
            className="dojo-login__submit dojo-login__stagger dojo-login__stagger--3"
          >
            {loading ? (
              <span className="dojo-login__submit-label">
                <Loader2 className="spin" size={17} /> Authenticating...
              </span>
            ) : 'Access Portal'}
          </button>
        </form>

        {error ? (
          <div className="dojo-login__error" role="alert">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          </div>
        ) : null}

        {process.env.NODE_ENV === 'development' && (
          <div className="dojo-login__test-bypass">
            <button
              type="button"
              className="dojo-login__test-btn"
              onClick={() => {
                setSkfId('SKF01MP999')
                setDob('15-08-1992')
              }}
            >
              Dev Fill (Reference Athlete)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
