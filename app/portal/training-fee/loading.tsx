import { FeesPageSkeleton } from '../_components/skeletons/FeesPageSkeleton';
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><FeesPageSkeleton /></SkeletonLoadingWrapper>;
}
