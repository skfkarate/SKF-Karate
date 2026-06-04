import RankingsPageSkeleton from '@/components/skeletons/RankingsPageSkeleton'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><RankingsPageSkeleton /></SkeletonLoadingWrapper>
}
