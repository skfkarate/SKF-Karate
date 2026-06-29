'use client'

import { usePathname } from 'next/navigation'
import { useLayoutEffect, useRef } from 'react'

function scrollToDocumentTop() {
  const scrollingElement = document.scrollingElement || document.documentElement

  if (typeof scrollingElement.scrollTo === 'function') {
    scrollingElement.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  } else {
    scrollingElement.scrollTop = 0
  }

  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
}

export default function RouteScrollReset() {
  const pathname = usePathname()
  const previousPathnameRef = useRef<string | null>(null)

  useLayoutEffect(() => {
    if (!pathname) return

    const previousPathname = previousPathnameRef.current
    previousPathnameRef.current = pathname

    if (previousPathname === null || previousPathname === pathname) return
    if (pathname.startsWith('/portal')) return
    if (window.location.hash) return

    const frameId = window.requestAnimationFrame(scrollToDocumentTop)
    return () => window.cancelAnimationFrame(frameId)
  }, [pathname])

  return null
}
