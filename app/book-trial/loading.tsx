import BookTrialPageSkeleton from '@/components/skeletons/BookTrialPageSkeleton'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><BookTrialPageSkeleton /></SkeletonLoadingWrapper>
}
