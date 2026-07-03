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
 * On 401 the user is redirected to login with the current portal page preserved.
 */
export function usePortalAuth() {
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/portal/session', { method: 'GET', credentials: 'same-origin' })
      .then(res => {
        if (!res.ok) {
          router.replace(getCurrentPortalLoginUrl())
        }
      })
      .catch(() => {
        router.replace(getCurrentPortalLoginUrl())
      })
  }, [router])
}
