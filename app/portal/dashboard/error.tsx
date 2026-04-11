'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard Error:', error)
  }, [error])

  return (
    <div style={{ padding: '6rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem', color: 'var(--crimson, #d62828)' }}>
        Data temporarily unavailable
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '2rem' }}>
        We couldn't load some sections of your dashboard right now. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="btn btn-outline-dynamic"
      >
        Try Again
      </button>
    </div>
  )
}
