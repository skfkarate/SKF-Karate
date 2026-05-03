'use client'

import { useEffect } from 'react'

import { markRouteLoadingVisible } from './routeTransitionTelemetry'

export default function RouteLoadingSignal() {
  useEffect(() => {
    markRouteLoadingVisible()
  }, [])

  return null
}
