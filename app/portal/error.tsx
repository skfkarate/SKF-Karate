'use client'

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'
import { reportClientError } from '@/app/_components/ClientErrorReporter'

export default function PortalError({
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
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            marginBottom: '1.25rem',
          }}
        >
          <AlertCircle style={{ width: '28px', height: '28px', color: '#f87171' }} />
        </div>

        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#fff',
            margin: '0 0 0.5rem',
          }}
        >
          Something went wrong
        </h2>

        <p
          style={{
            fontSize: '0.875rem',
            color: 'rgba(255,255,255,0.5)',
            margin: '0 0 1.5rem',
            lineHeight: 1.5,
          }}
        >
          We ran into an issue loading this page. This is usually temporary — please try again.
        </p>

        {error?.message && process.env.NODE_ENV !== 'production' && (
          <p
            style={{
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.3)',
              fontFamily: 'monospace',
              margin: '0 0 1.5rem',
              padding: '0.75rem',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: '8px',
              wordBreak: 'break-word',
            }}
          >
            {error.message}
          </p>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#000',
              background: '#fff',
              border: 'none',
              borderRadius: '10px',
              cursor: 'pointer',
            }}
          >
            <RefreshCw style={{ width: '16px', height: '16px' }} />
            Try Again
          </button>
          <a
            href="/portal/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.25rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              textDecoration: 'none',
            }}
          >
            <Home style={{ width: '16px', height: '16px' }} />
            Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}
