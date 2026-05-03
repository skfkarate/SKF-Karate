'use client'

type ActiveRouteTransition = {
  id: string
  fromPath: string
  toPath: string
  clickPerfMs: number
  clickEpochMs: number
  loadingPerfMs?: number
}

type RouteTransitionMetrics = {
  transitionId: string
  fromPath: string
  toPath: string
  clickToLoadingMs: number | null
  clickToSettledMs: number
  loadingToSettledMs: number | null
  hasLoadingSignal: boolean
}

type RouteTransitionStartDetail = {
  transitionId: string
  fromPath: string
  toPath: string
}

type RouteTransitionLoadingDetail = {
  transitionId: string
}

type RouteTransitionSettledDetail = {
  transitionId: string
  metrics: RouteTransitionMetrics
}

declare global {
  interface Window {
    __skfRouteTransition?: ActiveRouteTransition
  }

  interface WindowEventMap {
    'skf-route-transition:start': CustomEvent<RouteTransitionStartDetail>
    'skf-route-transition:loading': CustomEvent<RouteTransitionLoadingDetail>
    'skf-route-transition:settled': CustomEvent<RouteTransitionSettledDetail>
  }
}

const TRANSITION_TTL_MS = 30_000
export const ROUTE_TRANSITION_START_EVENT = 'skf-route-transition:start'
export const ROUTE_TRANSITION_LOADING_EVENT = 'skf-route-transition:loading'
export const ROUTE_TRANSITION_SETTLED_EVENT = 'skf-route-transition:settled'

function dispatchTransitionEvent<T>(eventName: string, detail: T) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(eventName, { detail }))
}

function nowPerfMs() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

function normalizePath(pathLike: string | null | undefined) {
  if (!pathLike) return null

  const trimmed = pathLike.trim()
  if (!trimmed || trimmed.startsWith('#')) return null

  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const url = new URL(trimmed)
      return `${url.pathname}${url.search}`
    }
  } catch {
    return null
  }

  if (trimmed.startsWith('?')) {
    if (typeof window === 'undefined') return null
    return `${window.location.pathname}${trimmed}`
  }

  if (trimmed.startsWith('/')) return trimmed
  return `/${trimmed.replace(/^\/+/, '')}`
}

function parsePath(pathLike: string) {
  try {
    const url = new URL(pathLike, 'https://skfkarate.org')
    const pathname = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, '') : url.pathname
    return {
      pathname,
      search: url.search || '',
    }
  } catch {
    return {
      pathname: pathLike,
      search: '',
    }
  }
}

function sameRoute(firstPathLike: string | null | undefined, secondPathLike: string | null | undefined) {
  const first = firstPathLike ? parsePath(firstPathLike) : null
  const second = secondPathLike ? parsePath(secondPathLike) : null
  if (!first || !second) return false
  return first.pathname === second.pathname && first.search === second.search
}

export function startRouteTransition(toPathLike: string | null | undefined) {
  if (typeof window === 'undefined') return

  const toPath = normalizePath(toPathLike)
  if (!toPath) return

  const currentPath = `${window.location.pathname}${window.location.search}`
  if (sameRoute(toPath, currentPath)) {
    return
  }

  const existing = window.__skfRouteTransition
  if (
    existing &&
    sameRoute(existing.toPath, toPath) &&
    sameRoute(existing.fromPath, currentPath) &&
    Date.now() - existing.clickEpochMs < 1_000
  ) {
    return
  }

  const transition: ActiveRouteTransition = {
    id: `rt_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36)}`,
    fromPath: currentPath,
    toPath,
    clickPerfMs: nowPerfMs(),
    clickEpochMs: Date.now(),
  }
  window.__skfRouteTransition = transition

  dispatchTransitionEvent<RouteTransitionStartDetail>(ROUTE_TRANSITION_START_EVENT, {
    transitionId: transition.id,
    fromPath: transition.fromPath,
    toPath: transition.toPath,
  })
}

export function markRouteLoadingVisible() {
  if (typeof window === 'undefined') return
  const active = window.__skfRouteTransition
  if (!active || active.loadingPerfMs !== undefined) return
  active.loadingPerfMs = nowPerfMs()

  dispatchTransitionEvent<RouteTransitionLoadingDetail>(ROUTE_TRANSITION_LOADING_EVENT, {
    transitionId: active.id,
  })
}

export function consumeRouteTransition(currentPathLike: string): RouteTransitionMetrics | null {
  if (typeof window === 'undefined') return null

  const active = window.__skfRouteTransition
  if (!active) return null

  const ageMs = Date.now() - active.clickEpochMs
  if (ageMs > TRANSITION_TTL_MS) {
    window.__skfRouteTransition = undefined
    return null
  }

  const currentPath = normalizePath(currentPathLike)
  if (!currentPath) return null

  const expected = parsePath(active.toPath)
  const actual = parsePath(currentPath)

  if (expected.pathname !== actual.pathname) {
    return null
  }

  const settledPerfMs = nowPerfMs()
  const clickToLoadingMs =
    typeof active.loadingPerfMs === 'number'
      ? Math.max(0, Math.round(active.loadingPerfMs - active.clickPerfMs))
      : null
  const clickToSettledMs = Math.max(0, Math.round(settledPerfMs - active.clickPerfMs))
  const loadingToSettledMs =
    typeof active.loadingPerfMs === 'number'
      ? Math.max(0, Math.round(settledPerfMs - active.loadingPerfMs))
      : null

  const metrics: RouteTransitionMetrics = {
    transitionId: active.id,
    fromPath: active.fromPath,
    toPath: currentPath,
    clickToLoadingMs,
    clickToSettledMs,
    loadingToSettledMs,
    hasLoadingSignal: active.loadingPerfMs !== undefined,
  }
  window.__skfRouteTransition = undefined

  dispatchTransitionEvent<RouteTransitionSettledDetail>(ROUTE_TRANSITION_SETTLED_EVENT, {
    transitionId: active.id,
    metrics,
  })

  return metrics
}
