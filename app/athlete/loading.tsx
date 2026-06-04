import AthleteProfileSkeleton from '@/components/skeletons/AthleteProfileSkeleton'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><AthleteProfileSkeleton /></SkeletonLoadingWrapper>
}
