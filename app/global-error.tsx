'use client'

import { useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <main className="system-page">
          <div className="system-content container">
            <h1 className="system-title">Something went wrong</h1>
            <p className="system-text">The site hit an unexpected error and the team has been notified.</p>
            <button type="button" onClick={() => reset()} className="btn btn-primary">
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
