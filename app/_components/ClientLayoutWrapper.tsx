"use client"

import { ReactNode } from "react"
import { usePathname } from "next/navigation"

export default function ClientLayoutWrapper({ 
  children,
  navbar,
  footer,
  whatsappButton,
  backToTop
}: { 
  children: ReactNode
  navbar?: ReactNode
  footer?: ReactNode
  whatsappButton?: ReactNode
  backToTop?: ReactNode
}) {
  const pathname = usePathname()

  // Hide the public shell on admin routes and auth portal routes
  const isPublicRoute = !pathname?.startsWith('/admin') && !pathname?.startsWith('/portal')
  const showHeaderFooter = isPublicRoute

  return (
    <>
      {showHeaderFooter && navbar}
      <main id="main-content" style={{ minHeight: isPublicRoute ? 'auto' : '100dvh', background: isPublicRoute ? 'transparent' : '#0a0a0a' }}>
        {children}
      </main>
      {showHeaderFooter && (
        <>
          {footer}
          {whatsappButton}
          {backToTop}
        </>
      )}
    </>
  )
}
