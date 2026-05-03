'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo } from 'react'
import type { ComponentProps, FocusEventHandler, MouseEventHandler } from 'react'
import LinkPendingIndicator from './LinkPendingIndicator'
import { startRouteTransition } from './routeTransitionTelemetry'

type NextLinkProps = ComponentProps<typeof Link>

const PREFETCH_DEDUPE_MS = 30_000
const prefetchedAtByRoute = new Map<string, number>()

type PrefetchLinkProps = NextLinkProps & {
  prefetchRoutes?: string[]
  prefetchOnMount?: boolean
  showPendingIndicator?: boolean
  pendingClassName?: string
}

export default function PrefetchLink({
  href,
  children,
  prefetchRoutes,
  prefetchOnMount = false,
  showPendingIndicator = true,
  pendingClassName,
  onMouseEnter,
  onFocus,
  onTouchStart,
  onClick,
  ...rest
}: PrefetchLinkProps) {
  const router = useRouter()

  const routesToPrefetch = useMemo(() => {
    const primaryHref =
      typeof href === 'string'
        ? href
        : typeof href?.pathname === 'string'
          ? href.pathname
          : null

    return Array.from(new Set([primaryHref, ...(prefetchRoutes ?? [])].filter(Boolean) as string[]))
  }, [href, prefetchRoutes])

  const prefetchIntentRoutes = useCallback(() => {
    const now = Date.now()

    for (const route of routesToPrefetch) {
      if (!route.startsWith('/')) continue

      const lastPrefetchedAt = prefetchedAtByRoute.get(route) || 0
      if (now - lastPrefetchedAt < PREFETCH_DEDUPE_MS) continue

      prefetchedAtByRoute.set(route, now)
      router.prefetch(route)
    }
  }, [routesToPrefetch, router])

  useEffect(() => {
    if (!prefetchOnMount) return
    prefetchIntentRoutes()
  }, [prefetchOnMount, prefetchIntentRoutes])

  const handleMouseEnter: MouseEventHandler<HTMLAnchorElement> = (event) => {
    prefetchIntentRoutes()
    onMouseEnter?.(event)
  }

  const handleFocus: FocusEventHandler<HTMLAnchorElement> = (event) => {
    prefetchIntentRoutes()
    onFocus?.(event)
  }

  const handleClick: MouseEventHandler<HTMLAnchorElement> = (event) => {
    onClick?.(event)
    if (event.defaultPrevented) return

    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return
    }

    const destination =
      typeof href === 'string'
        ? href
        : typeof href?.pathname === 'string'
          ? href.pathname
          : null

    startRouteTransition(destination)
  }

  return (
    <Link
      href={href}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      onTouchStart={onTouchStart}
      onClick={handleClick}
      {...rest}
    >
      {children}
      {showPendingIndicator ? <LinkPendingIndicator className={pendingClassName} /> : null}
    </Link>
  )
}
