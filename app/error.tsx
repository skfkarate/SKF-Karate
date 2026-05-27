'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'
import { reportClientError } from '@/app/_components/ClientErrorReporter'
import './error-pages.css'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
    reportClientError({
      source: 'error_boundary',
      name: error.name,
      message: error.message,
      stack: error.stack,
      digest: error.digest,
    })
  }, [error])

  return (
    <div className="system-page">
      {/* Ambient background */}
      <div className="system-orb system-orb--1" style={{ background: 'rgba(214, 40, 40, 0.18)' }} />
      <div className="system-orb system-orb--2" />
      <div className="system-orb system-orb--3" />
      <div className="system-watermark">エラー</div>

      <div className="system-content container">
        {/* Icon */}
        <div className="system-icon-wrap system-icon-wrap--error">
          <AlertTriangle className="system-icon" />
        </div>

        {/* Badge */}
        <span className="system-badge system-badge--error">Technical Issue</span>

        {/* Title */}
        <h1 className="system-title">
          Something Went <span className="text-gradient">Wrong</span>
        </h1>

        {/* Description */}
        <p className="system-text">
          We encountered an unexpected issue while loading this page.
          Our team has been automatically notified and is looking into it.
        </p>

        {/* Actions */}
        <div className="system-actions">
          <button onClick={() => reset()} className="btn btn-primary">
            <RotateCcw size={16} />
            Try Again
          </button>
          <Link href="/" className="btn btn-secondary">
            <Home size={16} />
            Go Home
          </Link>
        </div>

        {/* Footer hint */}
        <div className="system-divider" />
        <p className="system-footer">
          If this keeps happening, please{' '}
          <Link href="/contact">contact our support team</Link>.
        </p>
      </div>
    </div>
  )
}
