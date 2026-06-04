import { JourneyPageSkeleton } from '../_components/skeletons/JourneyPageSkeleton';
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><JourneyPageSkeleton /></SkeletonLoadingWrapper>;
}
