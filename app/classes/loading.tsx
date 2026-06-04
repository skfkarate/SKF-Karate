import ClassesPageSkeleton from '@/components/skeletons/ClassesPageSkeleton'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><ClassesPageSkeleton /></SkeletonLoadingWrapper>
}
