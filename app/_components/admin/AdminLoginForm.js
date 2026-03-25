'use client'

import { useState, useRef, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [clickCount, setClickCount] = useState(0)
  const [showForm, setShowForm] = useState(false)
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const clickTimeoutRef = useRef(null)

  // Handle hidden activation sequence (triple click)
  const handleSecretClick = () => {
    setClickCount(prev => prev + 1)
    
    // Reset click count if not clicked in 1.5 seconds
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current)
    clickTimeoutRef.current = setTimeout(() => {
      setClickCount(0)
    }, 1500)
  }

  useEffect(() => {
    if (clickCount >= 3) {
      setShowForm(true)
      setClickCount(0)
    }
  }, [clickCount])

  const onSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const res = await signIn('credentials', {
        redirect: false,
        username,
        password,
      })

      if (res?.error) {
        setError('Connection failed.') // Vague error to mislead attackers
        return
      }

      router.push(searchParams?.get('callbackUrl') || '/admin')
      router.refresh()
    } catch (err) {
      setError('Connection failed.')
    } finally {
      setIsLoading(false)
    }
  }

  // State 1: Fake 404 Page (Loud and obvious)
  if (!showForm) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'monospace'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '6rem', margin: 0, fontWeight: 900, letterSpacing: '-0.05em', color: '#333' }}>
            {/* The secret trigger is the number 4 */}
            <span 
              onClick={handleSecretClick} 
              style={{ cursor: 'default', userSelect: 'none' }}
            >
              4
            </span>
            04
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.4)', marginTop: '1rem', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
            Page Not Found
          </p>
          <div style={{ marginTop: '3rem' }}>
            <Link 
              href="/"
              style={{
                display: 'inline-block',
                padding: '0.75rem 2rem',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)',
                textDecoration: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                fontSize: '0.8rem',
                transition: 'all 0.2s',
                borderRadius: 4
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff' }}
              onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' }}
            >
              Return to Website
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // State 2: Stealth Login Form (No branding, no labels)
  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ width: '100%', maxWidth: 320, padding: '2rem' }}>
        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid #333',
              color: '#fff',
              outline: 'none',
              fontFamily: 'monospace',
              fontSize: '0.9rem'
            }}
            placeholder="—"
            autoComplete="off"
            spellCheck="false"
            autoFocus
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid #333',
              color: '#fff',
              outline: 'none',
              fontFamily: 'monospace',
              fontSize: '0.9rem'
            }}
            placeholder="—"
            autoComplete="off"
          />

          {error && (
            <p style={{ color: '#ef4444', fontSize: '0.75rem', fontFamily: 'monospace', margin: 0 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            style={{
              marginTop: '1.5rem',
              width: '100%',
              padding: '0.75rem',
              background: '#111',
              color: '#666',
              border: '1px solid #222',
              cursor: (isLoading || !username || !password) ? 'not-allowed' : 'pointer',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              transition: 'all 0.2s',
              opacity: (isLoading || !username || !password) ? 0.5 : 1
            }}
            onMouseOver={e => { if (!isLoading && username && password) { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#444' } }}
            onMouseOut={e => { if (!isLoading && username && password) { e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = '#222' } }}
          >
            {isLoading ? '...' : '>'}
          </button>
        </form>
      </div>
    </div>
  )
}
