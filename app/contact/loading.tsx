import ContactPageSkeleton from '@/components/skeletons/ContactPageSkeleton'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><ContactPageSkeleton /></SkeletonLoadingWrapper>
}
