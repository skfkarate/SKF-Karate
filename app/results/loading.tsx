import ResultsPageSkeleton from '@/components/skeletons/ResultsPageSkeleton'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><ResultsPageSkeleton /></SkeletonLoadingWrapper>
}
