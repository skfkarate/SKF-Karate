'use client'

import { useEffect } from 'react'

const CURRENT_SW_PATH = '/sw.js'

function getScriptUrl(registration: ServiceWorkerRegistration) {
  const worker = registration.active || registration.waiting || registration.installing
  try {
    return new URL(worker?.scriptURL || '', window.location.origin).pathname
  } catch {
    return ''
  }
}

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      !('serviceWorker' in navigator) ||
      !window.isSecureContext
    ) {
      return
    }

    let cancelled = false

    // Remove registrations from retired workers (e.g. the old feetrack-sw.js).
    // A stale worker with root scope can serve broken cached pages, so this
    // cleanup must run in every environment — not just production.
    const unregisterStaleWorkers = async () => {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(
          registrations
            .filter((registration) => getScriptUrl(registration) !== CURRENT_SW_PATH)
            .map((registration) => registration.unregister())
        )
      } catch {
        // Best-effort cleanup; never block the app.
      }
    }

    const registerWorker = async () => {
      try {
        await unregisterStaleWorkers()
        if (!cancelled) {
          await navigator.serviceWorker.register(CURRENT_SW_PATH, { scope: '/' })
        }
      } catch {
        // Service workers are an enhancement; failed registration must not block the app.
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      void unregisterStaleWorkers()
      return
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
