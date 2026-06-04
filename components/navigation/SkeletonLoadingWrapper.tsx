'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { markRouteLoadingVisible } from '@/components/navigation/routeTransitionTelemetry'

/**
 * SkeletonLoadingWrapper — wraps every loading.tsx file to ensure two things:
 *
 * 1. The global top progress bar is notified that the loading skeleton is visible
 *    (via `markRouteLoadingVisible`), which advances the bar from ~10% to ~50%
 *    and raises the cap from 72% to 90%, giving users a smoother progress feel.
 *
 * 2. Provides a consistent mounting animation for all skeleton screens.
 *
 * Usage in loading.tsx:
 *   import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'
 *   import SomeSkeleton from '@/components/skeletons/SomeSkeleton'
 *   export default function Loading() {
 *     return <SkeletonLoadingWrapper><SomeSkeleton /></SkeletonLoadingWrapper>
 *   }
 */
export function SkeletonLoadingWrapper({ children }: { children: ReactNode }) {
  useEffect(() => {
    markRouteLoadingVisible()
  }, [])

  return <>{children}</>
}
