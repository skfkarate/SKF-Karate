import TechniquesPageSkeleton from '@/components/skeletons/TechniquesPageSkeleton'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><TechniquesPageSkeleton /></SkeletonLoadingWrapper>
}
