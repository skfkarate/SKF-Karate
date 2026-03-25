"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/app/_components/Navbar"
import Footer from "@/app/_components/Footer"
import CookieConsent from "@/app/_components/CookieConsent"

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname()

  // Hide the public shell on admin routes and auth portal routes
  const isPublicRoute = !pathname?.startsWith('/admin') && !pathname?.startsWith('/portal')

  return (
    <>
      {isPublicRoute && <Navbar />}
      <main id="main-content" style={{ minHeight: isPublicRoute ? 'auto' : '100vh', background: isPublicRoute ? 'transparent' : '#0a0a0a' }}>
        {children}
      </main>
      {isPublicRoute && (
        <>
          <Footer />
          <CookieConsent />
        </>
      )}
    </>
  )
}
