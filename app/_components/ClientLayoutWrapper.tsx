"use client"

import { ReactNode, Suspense } from "react"
import { usePathname } from "next/navigation"
import GlobalRouteProgress from "@/components/navigation/GlobalRouteProgress"
import RouteTransitionClickCapture from "@/components/navigation/RouteTransitionClickCapture"
import ClientErrorReporter from "@/app/_components/ClientErrorReporter"

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

  // Hide the public shell on private operational areas.
  const isPrivateRoute =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/fee') ||
    pathname?.startsWith('/portal') ||
    pathname?.startsWith('/admission')
  const isPublicRoute = !isPrivateRoute
  const showHeaderFooter = isPublicRoute
  // Shop screens have fixed cart/product controls, so the floating WhatsApp button stays hidden there only.
  const showWhatsAppButton = showHeaderFooter && !pathname?.startsWith('/shop')

  return (
    <>
      {/* Top-of-page route-transition progress bar */}
      <ClientErrorReporter />

      <Suspense fallback={null}>
        <GlobalRouteProgress />
      </Suspense>

      {/* Captures all internal link clicks to fire transition events */}
      <RouteTransitionClickCapture />

      {showHeaderFooter && navbar}
      <main id="main-content" style={{ minHeight: isPublicRoute ? 'auto' : '100dvh', background: isPublicRoute ? 'transparent' : '#020408' }}>
        {children}
      </main>
      {showHeaderFooter && (
        <>
          {footer}
          {showWhatsAppButton && whatsappButton}
        </>
      )}
    </>
  )
}
