import HomePageSkeleton from '@/components/skeletons/HomePageSkeleton'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><HomePageSkeleton /></SkeletonLoadingWrapper>
}
