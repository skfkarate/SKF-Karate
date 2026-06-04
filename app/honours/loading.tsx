import HonoursPageSkeleton from '@/components/skeletons/HonoursPageSkeleton'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><HonoursPageSkeleton /></SkeletonLoadingWrapper>
}
