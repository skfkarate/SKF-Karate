import { PointsPageSkeleton } from '../_components/skeletons/PointsPageSkeleton';
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><PointsPageSkeleton /></SkeletonLoadingWrapper>;
}
