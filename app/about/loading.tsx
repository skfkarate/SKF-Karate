import AboutPageSkeleton from '@/components/skeletons/AboutPageSkeleton'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><AboutPageSkeleton /></SkeletonLoadingWrapper>
}
