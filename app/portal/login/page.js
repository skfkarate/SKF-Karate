'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { FaSpinner } from 'react-icons/fa'
import './login.css'

function DojoLoginInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/portal/dashboard'
  const [skfId, setSkfId] = useState('')
  const [dob, setDob] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Redirect if already logged in
  useEffect(() => {
    fetch('/api/auth/portal/session', { method: 'GET', credentials: 'same-origin' })
      .then(res => {
        if (res.ok) {
          router.replace(callbackUrl)
        } else {
          setLoading(false)
        }
      })
      .catch(() => {
        setLoading(false)
      })
  }, [router, callbackUrl])


  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skfId: skfId.trim(), dob: dob.trim() }),
      })
      const data = await res.json()

      if (res.ok) {
        router.push(callbackUrl)
        router.refresh()
      } else {
        setError(data.error || 'Authentication failed')
        setLoading(false)
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="dojo-login">
      {/* Background Visuals */}
      <div className="dojo-login__bg-glow" />
      <div className="dojo-login__watermark">空手道</div>

      <motion.div
        className="dojo-login__content"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="dojo-login__header">
          <motion.div
            className="dojo-login__brand"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Image
              src="/logo/SKF logo.png"
              alt="SKF Logo"
              width={34}
              height={34}
              className="dojo-login__logo"
            />
            <span className="dojo-login__brand-text">SKF Karate</span>
          </motion.div>

          <motion.h1
            className="dojo-login__title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            ATHLETE<br />PORTAL.
          </motion.h1>
          <motion.p
            className="dojo-login__subtitle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Authenticate your identity to continue.
          </motion.p>
        </div>

        <form onSubmit={handleLogin} className="dojo-login__form">
          <motion.div
            className="dojo-input-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <input
              type="text"
              id="skfId"
              className="dojo-input"
              placeholder="SKFXXXXXXX"
              value={skfId}
              onChange={(e) => setSkfId(e.target.value)}
              required
            />
            <label htmlFor="skfId">Registration ID</label>
          </motion.div>

          <motion.div
            className="dojo-input-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <input
              type="text"
              id="dob"
              className="dojo-input"
              placeholder="DD-MM-YYYY"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
            <label htmlFor="dob">Date of Birth</label>
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading || !skfId || !dob}
            className="dojo-login__submit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <FaSpinner className="spin" /> Authenticating...
              </span>
            ) : 'Access Portal'}
          </motion.button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div
              className="dojo-login__error"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {process.env.NODE_ENV === 'development' && (
          <motion.div
            className="dojo-login__test-bypass"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <button
              type="button"
              className="dojo-login__test-btn"
              onClick={() => {
                setSkfId('SKF-2018-0001')
                setDob('12-04-1995')
              }}
            >
              Dev Fill (Admin)
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

// Add this to suppress hydration warnings for AnimatePresence
import { AnimatePresence as FramerAnimatePresence } from 'framer-motion'
const AnimatePresence = ({ children }) => <FramerAnimatePresence>{children}</FramerAnimatePresence>

// Wrap in Suspense for useSearchParams compatibility
export default function DojoLogin() {
  return (
    <Suspense fallback={<div className="dojo-login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaSpinner className="spin" style={{ fontSize: '2rem', color: '#fff' }} /></div>}>
      <DojoLoginInner />
    </Suspense>
  )
}
