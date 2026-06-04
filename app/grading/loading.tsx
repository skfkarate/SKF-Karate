import GradingPageSkeleton from '@/components/skeletons/GradingPageSkeleton'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><GradingPageSkeleton /></SkeletonLoadingWrapper>
}
