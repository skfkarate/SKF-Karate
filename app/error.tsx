'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'
import './error-pages.css'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
    Sentry.captureException(error)
  }, [error])

  return (
    <div className="system-page">
      <div className="system-orb system-orb--1" style={{ background: 'rgba(214,40,40,0.3)' }} />
      <div className="system-orb system-orb--2" />
      <div className="system-watermark">エラー</div>

      <div className="system-content container">
        <span className="system-badge" style={{ color: 'var(--accent-crimson)', borderColor: 'rgba(214,40,40,0.3)' }}>
          Technical Disruption
        </span>
        <h1 className="system-code" style={{ background: 'linear-gradient(180deg, #fff 40%, rgba(214,40,40,0.4) 100%)', WebkitBackgroundClip: 'text' }}>
          500
        </h1>
        <h2 className="system-title">Something Went <span className="text-gradient">Wrong</span></h2>
        <p className="system-text">
          Our systems encountered a brief imbalance. The technical team has been notified via Sentry.
        </p>
        
        <div className="system-actions">
          <button onClick={() => reset()} className="btn btn-primary">
            Try Again
          </button>
          <Link href="/" className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.05)' }}>
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
