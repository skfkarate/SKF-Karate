'use client'

import { useState, useRef, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import './login.css'

type FlowStep = 'id' | 'pin-login' | 'pin-setup-1' | 'pin-setup-2'

export default function PortalLogin() {
  const router = useRouter()
  
  const [step, setStep] = useState<FlowStep>('id')
  const [skfId, setSkfId] = useState('')
  const [pin, setPin] = useState('')
  const [pendingSetupPin, setPendingSetupPin] = useState('')
  
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [shake, setShake] = useState(false)
  
  // Hidden input ref for capturing PIN reliably
  const hiddenInputRef = useRef<HTMLInputElement>(null)

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  const handleIdSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (skfId.trim().length < 3) {
      setError('Please enter a valid SKF ID')
      triggerShake()
      return
    }
    setError('')
    // Assume user goes to login phase. If login returns 404 PIN not set, we'll flip to setup.
    setStep('pin-login')
    setPin('')
    setTimeout(() => hiddenInputRef.current?.focus(), 100)
  }

  const handlePinChange = async (val: string) => {
    const onlyNums = val.replace(/\D/g, '').substring(0, 4)
    setPin(onlyNums)
    setError('')
    
    if (onlyNums.length === 4) {
      if (step === 'pin-login') {
        await submitLogin(onlyNums)
      } else if (step === 'pin-setup-1') {
        setPendingSetupPin(onlyNums)
        setStep('pin-setup-2')
        setPin('')
        setTimeout(() => hiddenInputRef.current?.focus(), 100)
      } else if (step === 'pin-setup-2') {
        if (onlyNums !== pendingSetupPin) {
          setError("PINs don't match. Try again.")
          triggerShake()
          setPin('')
          setStep('pin-setup-1')
        } else {
          await submitSetup(pendingSetupPin)
        }
      }
    }
  }

  const submitLogin = async (attemptPin: string) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skfId: skfId.toUpperCase(), pin: attemptPin })
      })
      const data = await res.json()
      
      if (res.status === 404 && data.error.includes('not set')) {
        // Switch to setup flow automatically
        setError("PIN not set. Let's create one.")
        setStep('pin-setup-1')
        setPin('')
      } else if (!res.ok) {
        setError(data.error || 'Authentication failed')
        triggerShake()
        setPin('')
      } else {
        // Success
        router.push('/portal/dashboard')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      triggerShake()
      setPin('')
    } finally {
      setIsLoading(false)
      setTimeout(() => hiddenInputRef.current?.focus(), 100)
    }
  }
  
  const submitSetup = async (finalPin: string) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/portal/set-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          skfId: skfId.toUpperCase(), 
          pin: finalPin, 
          confirmPin: finalPin 
        })
      })
      const data = await res.json()
      
      if (!res.ok) {
        setError(data.error || 'Setup failed')
        triggerShake()
        setPin('')
        setStep('pin-setup-1')
      } else {
        router.push('/portal/dashboard')
      }
    } catch (err) {
      setError('Network error. Please try again.')
      triggerShake()
    } finally {
      setIsLoading(false)
      setTimeout(() => hiddenInputRef.current?.focus(), 100)
    }
  }

  return (
    <div className="login-wrapper">
      {/* Background Ambience */}
      <div className="login-bg-glow login-bg-glow--left" />
      <div className="login-bg-glow login-bg-glow--right" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-card"
      >
        <div className="login-header">
          <div className="login-logo-wrap">
            <Image 
              src="/logo/SKF logo.png" 
              alt="SKF" 
              width={60} 
              height={60} 
              className="login-logo"
            />
          </div>
          <h1 className="login-title">Athlete Portal</h1>
          <p className="login-subtitle">
            {step === 'id' && "Enter your SKF ID to continue"}
            {step === 'pin-login' && `Welcome back, Enter your PIN`}
            {step === 'pin-setup-1' && "Create your 4-digit PIN"}
            {step === 'pin-setup-2' && "Confirm your 4-digit PIN"}
          </p>
        </div>

        <motion.div 
          animate={shake ? { x: [-10, 10, -10, 10, -5, 5, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="login-body"
        >
          <AnimatePresence mode="wait">
            {step === 'id' ? (
              <motion.form 
                key="id-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleIdSubmit}
                className="id-form"
              >
                <input
                  type="text"
                  placeholder="SKF20410001"
                  value={skfId}
                  onChange={(e) => setSkfId(e.target.value.toUpperCase())}
                  className="id-input"
                  autoFocus
                />
                <button type="submit" className="login-btn" disabled={!skfId.trim() || isLoading}>
                  {isLoading ? <Loader2 className="spinner" /> : "Continue"}
                </button>
              </motion.form>
            ) : (
              <motion.div 
                key="pin-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="pin-form-wrap"
                onClick={() => hiddenInputRef.current?.focus()}
              >
                {/* Visual dots */}
                <div className="pin-dots">
                  {[0, 1, 2, 3].map(i => (
                    <div 
                      key={i} 
                      className={`pin-dot ${pin.length > i ? 'filled' : ''} ${pin.length === i ? 'pulse' : ''}`}
                    />
                  ))}
                </div>
                
                {/* Hidden real input */}
                <input
                  ref={hiddenInputRef}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  className="hidden-pin-input"
                  disabled={isLoading}
                  autoComplete="one-time-code"
                />
                
                {isLoading && (
                  <div className="loading-overlay">
                    <Loader2 className="spinner" />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {error && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="login-error"
            >
              {error}
            </motion.p>
          )}
        </motion.div>

        {step !== 'id' && (
          <div className="login-footer">
            <button 
              className="text-btn"
              onClick={() => {
                setStep('id')
                setPin('')
                setError('')
              }}
            >
              Change ID
            </button>
            {step === 'pin-login' && (
              <button 
                className="text-btn"
                onClick={() => setError("Contact your branch admin to reset your PIN.")}
              >
                Forgot PIN?
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
