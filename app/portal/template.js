'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

/**
 * Portal Template
 * 
 * Using template.js instead of layout.js wrapper ensures that Next.js 
 * natively remounts this component ONLY when the new route data has resolved.
 * This completely fixes the "flashing old page" issue while preserving
 * the CSS fade-in transition and instant scroll-to-top.
 */
export default function PortalTemplate({ children }) {
  const pathname = usePathname()

  // Scroll to top on portal page navigation to prevent layout jumps
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  if (pathname === '/portal/login') {
    return children
  }

  return (
    <div className="hub-main__page">
      {children}
    </div>
  )
}
