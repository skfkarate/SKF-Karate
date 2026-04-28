"use client"

import { ReactNode, Suspense } from "react"
import { usePathname } from "next/navigation"
import GlobalRouteProgress from "@/components/navigation/GlobalRouteProgress"
import RouteTransitionClickCapture from "@/components/navigation/RouteTransitionClickCapture"

export default function ClientLayoutWrapper({ 
  children,
  navbar,
  footer,
  whatsappButton
}: { 
  children: ReactNode
  navbar?: ReactNode
  footer?: ReactNode
  whatsappButton?: ReactNode
}) {
  const pathname = usePathname()

  // Hide the public shell on admin routes and auth portal routes
  const isPublicRoute = !pathname?.startsWith('/admin') && !pathname?.startsWith('/portal')
  const showHeaderFooter = isPublicRoute

  return (
    <>
      {/* Top-of-page route-transition progress bar */}
      <Suspense fallback={null}>
        <GlobalRouteProgress />
      </Suspense>

      {/* Captures all internal link clicks to fire transition events */}
      <RouteTransitionClickCapture />

      {showHeaderFooter && navbar}
      <main id="main-content" style={{ minHeight: isPublicRoute ? 'auto' : '100dvh', background: isPublicRoute ? 'transparent' : '#0a0a0a' }}>
        {children}
      </main>
      {showHeaderFooter && (
        <>
          {footer}
          {whatsappButton}
        </>
      )}
    </>
  )
}
