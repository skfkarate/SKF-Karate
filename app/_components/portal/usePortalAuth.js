'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCurrentPortalLoginUrl } from './portalClientRedirect'

/**
 * usePortalAuth — lightweight client-side session guard.
 *
 * Call this at the top of any 'use client' portal page.
 * It hits /api/auth/portal/session (GET) which verifies the
 * HttpOnly cookie server-side and returns 401 if expired.
 *
 * Only a definitive 401 redirects to login. Network errors,
 * rate limits (429) or server errors (5xx) are ignored: the page
 * content was already authorised server-side, and reacting to
 * transient failures here caused redirect loops between the client
 * and the proxy when they momentarily disagreed.
 */
export function usePortalAuth() {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false

    fetch('/api/auth/portal/session', { method: 'GET', credentials: 'same-origin' })
      .then(res => {
        if (!cancelled && res.status === 401) {
          router.replace(getCurrentPortalLoginUrl())
        }
      })
      .catch(() => {
        // Transient failure — stay on the page; a real expiry is caught
        // by the next navigation or server action.
      })

    return () => {
      cancelled = true
    }
  }, [router])
}
