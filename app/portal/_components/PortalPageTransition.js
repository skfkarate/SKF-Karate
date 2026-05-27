'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * PortalPageTransition
 * 
 * Client-side wrapper that handles two things on every portal navigation:
 * 1. Scrolls to top instantly — prevents layout jumps when navigating
 *    from a scrolled position on a taller page to a shorter page.
 * 2. Wraps children in a keyed div with a CSS fade-in animation —
 *    the `key={pathname}` forces React to unmount/remount the wrapper
 *    on route change, re-triggering the `hub-main__page` animation
 *    defined in portal.css.
 */
export default function PortalPageTransition({ children }) {
  const pathname = usePathname()

  // Scroll to top on portal page navigation to prevent layout jumps
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  if (pathname === '/portal/login') {
    return children
  }

  return (
    <div key={pathname} className="hub-main__page">
      {children}
    </div>
  )
}
