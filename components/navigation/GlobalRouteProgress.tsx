'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  ROUTE_TRANSITION_LOADING_EVENT,
  ROUTE_TRANSITION_SETTLED_EVENT,
  ROUTE_TRANSITION_START_EVENT,
} from './routeTransitionTelemetry'

const ACTIVE_PROGRESS_CAP = 0.72
const LOADING_PROGRESS_CAP = 0.9
const TICK_INTERVAL_MS = 140
const FALLBACK_COMPLETE_MS = 6_000
const HIDE_AFTER_COMPLETE_MS = 220

export default function GlobalRouteProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [visible, setVisible] = useState(false)
  const [progress, setProgress] = useState(0)
  const lastRouteRef = useRef<string>('')
  const loadingSeenRef = useRef(false)
  const tickTimerRef = useRef<number | null>(null)
  const fallbackTimerRef = useRef<number | null>(null)
  const hideTimerRef = useRef<number | null>(null)

  const clearTickAndFallback = useCallback(() => {
    if (tickTimerRef.current !== null) {
      window.clearInterval(tickTimerRef.current)
      tickTimerRef.current = null
    }

    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current)
      fallbackTimerRef.current = null
    }
  }, [])

  const completeProgress = useCallback(() => {
    clearTickAndFallback()
    setProgress(1)

    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current)
    }

    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false)
      setProgress(0)
      loadingSeenRef.current = false
    }, HIDE_AFTER_COMPLETE_MS)
  }, [clearTickAndFallback])

  const beginProgress = useCallback(() => {
    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = null
    }

    setVisible(true)
    setProgress((current) => Math.max(current, 0.1))

    if (tickTimerRef.current === null) {
      tickTimerRef.current = window.setInterval(() => {
        setProgress((current) => {
          const cap = loadingSeenRef.current ? LOADING_PROGRESS_CAP : ACTIVE_PROGRESS_CAP
          if (current >= cap) return current
          const step = loadingSeenRef.current ? 0.1 : 0.07
          return Math.min(cap, current + (1 - current) * step)
        })
      }, TICK_INTERVAL_MS)
    }

    if (fallbackTimerRef.current !== null) {
      window.clearTimeout(fallbackTimerRef.current)
    }
    fallbackTimerRef.current = window.setTimeout(() => {
      completeProgress()
    }, FALLBACK_COMPLETE_MS)
  }, [completeProgress])

  const markLoadingProgress = useCallback(() => {
    loadingSeenRef.current = true
    setProgress((current) => Math.max(current, 0.5))
  }, [])

  useEffect(() => {
    const routeSignature = `${pathname || ''}?${searchParams?.toString() || ''}`
    if (!routeSignature) return

    if (!lastRouteRef.current) {
      lastRouteRef.current = routeSignature
      return
    }

    if (lastRouteRef.current !== routeSignature) {
      lastRouteRef.current = routeSignature
      completeProgress()
    }
  }, [completeProgress, pathname, searchParams])

  useEffect(() => {
    const handleStart = () => {
      beginProgress()
    }

    const handleLoading = () => {
      beginProgress()
      markLoadingProgress()
    }

    const handleSettled = () => {
      completeProgress()
    }

    window.addEventListener(ROUTE_TRANSITION_START_EVENT, handleStart)
    window.addEventListener(ROUTE_TRANSITION_LOADING_EVENT, handleLoading)
    window.addEventListener(ROUTE_TRANSITION_SETTLED_EVENT, handleSettled)

    return () => {
      window.removeEventListener(ROUTE_TRANSITION_START_EVENT, handleStart)
      window.removeEventListener(ROUTE_TRANSITION_LOADING_EVENT, handleLoading)
      window.removeEventListener(ROUTE_TRANSITION_SETTLED_EVENT, handleSettled)
      clearTickAndFallback()
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
    }
  }, [beginProgress, clearTickAndFallback, completeProgress, markLoadingProgress])

  return (
    <div className={`global-route-progress ${visible ? 'is-visible' : ''}`} aria-hidden="true">
      <span className="global-route-progress__bar" style={{ transform: `scaleX(${progress})` }} />
    </div>
  )
}
