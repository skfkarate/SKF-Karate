import EventsPageSkeleton from '@/components/skeletons/EventsPageSkeleton'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><EventsPageSkeleton /></SkeletonLoadingWrapper>
}
