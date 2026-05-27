'use client'

import { useEffect } from 'react'

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' ||
      !('serviceWorker' in navigator) ||
      !window.isSecureContext
    ) {
      return
    }

    let cancelled = false

    const registerWorker = async () => {
      try {
        if (!cancelled) {
          await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        }
      } catch {
        // Service workers are an enhancement; failed registration must not block the app.
      }
    }

    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(() => {
        void registerWorker()
      })

      return () => {
        cancelled = true
        window.cancelIdleCallback(idleId)
      }
    }

    const timeoutId = globalThis.setTimeout(() => {
      void registerWorker()
    }, 1500)

    return () => {
      cancelled = true
      globalThis.clearTimeout(timeoutId)
    }
  }, [])

  return null
}
