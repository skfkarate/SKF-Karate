'use client'

import { useEffect } from 'react'
import { startRouteTransition } from './routeTransitionTelemetry'

function getInternalPathFromAnchor(anchor: HTMLAnchorElement) {
  const rawHref = anchor.getAttribute('href')
  if (!rawHref) return null

  const blockedPrefixes = ['#', 'mailto:', 'tel:', 'javascript:']
  if (blockedPrefixes.some((prefix) => rawHref.startsWith(prefix))) {
    return null
  }

  try {
    const url = new URL(anchor.href, window.location.href)
    if (url.origin !== window.location.origin) return null
    return `${url.pathname}${url.search}`
  } catch {
    return null
  }
}

export default function RouteTransitionClickCapture() {
  useEffect(() => {
    const maybeStartTransition = (target: EventTarget | null) => {
      const element = target as Element | null
      const anchor = element?.closest('a[href]') as HTMLAnchorElement | null
      if (!anchor) return

      const targetAttr = anchor.getAttribute('target')
      if (targetAttr && targetAttr !== '_self') return
      if (anchor.hasAttribute('download')) return

      const internalPath = getInternalPathFromAnchor(anchor)
      if (!internalPath) return

      startRouteTransition(internalPath)
    }

    const hasModifierKey = (event: MouseEvent | PointerEvent) =>
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey

    const handlePointerDown = (event: PointerEvent) => {
      if (event.defaultPrevented || event.button !== 0 || hasModifierKey(event)) {
        return
      }

      maybeStartTransition(event.target)
    }

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        hasModifierKey(event)
      ) {
        return
      }

      maybeStartTransition(event.target)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.key !== 'Enter') return
      maybeStartTransition(event.target)
    }

    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('click', handleClick, true)
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('click', handleClick, true)
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [])

  return null
}
