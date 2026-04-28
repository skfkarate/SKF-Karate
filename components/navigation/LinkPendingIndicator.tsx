'use client'

import { useLinkStatus } from 'next/link'
import { useEffect } from 'react'
import { markRouteLoadingVisible } from './routeTransitionTelemetry'

type LinkPendingIndicatorProps = {
  className?: string
}

export default function LinkPendingIndicator({ className = '' }: LinkPendingIndicatorProps) {
  const { pending } = useLinkStatus()

  useEffect(() => {
    if (!pending) return
    markRouteLoadingVisible()
  }, [pending])

  return (
    <span
      aria-hidden="true"
      className={`link-pending-indicator ${pending ? 'is-pending' : ''} ${className}`.trim()}
    />
  )
}
