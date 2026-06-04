import VerifyPageSkeleton from '@/components/skeletons/VerifyPageSkeleton'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><VerifyPageSkeleton /></SkeletonLoadingWrapper>
}
