'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Client-side component that calls the logout API to clear the
 * stale session cookie, then redirects to the login page.
 * Used when the dashboard detects the athlete profile is missing.
 */
export default function ForceLogout() {
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/portal/logout', { method: 'POST', credentials: 'same-origin' })
      .finally(() => {
        router.replace('/portal/login')
      })
  }, [router])

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#030508',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'rgba(255,255,255,0.4)',
      fontFamily: 'var(--font-body, Inter, sans-serif)',
      fontSize: '0.9rem',
    }}>
      Redirecting to login…
    </div>
  )
}
