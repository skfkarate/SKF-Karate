'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * usePortalAuth — lightweight client-side session guard.
 *
 * Call this at the top of any 'use client' portal page.
 * It hits /api/auth/portal/session (GET) which verifies the
 * HttpOnly cookie server-side and returns 401 if expired.
 * On 401 the user is smoothly redirected to /portal/login.
 */
export function usePortalAuth() {
  const router = useRouter()

  useEffect(() => {
    fetch('/api/auth/portal/session', { method: 'GET', credentials: 'same-origin' })
      .then(res => {
        if (!res.ok) {
          router.replace('/portal/login')
        }
      })
      .catch(() => {
        router.replace('/portal/login')
      })
  }, [router])
}
