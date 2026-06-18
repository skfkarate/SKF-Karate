'use client'

import { usePathname } from 'next/navigation'
import HomePageSkeleton from '@/components/skeletons/HomePageSkeleton'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  const pathname = usePathname()
  
  if (pathname?.startsWith('/portal')) {
    // Let the portal handle its own skeletons to prevent flashing the home page skeleton
    return null
  }
  
  return <SkeletonLoadingWrapper><HomePageSkeleton /></SkeletonLoadingWrapper>
}
