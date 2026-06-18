import { TimetablePageSkeleton } from '../_components/skeletons/TimetablePageSkeleton';
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><TimetablePageSkeleton /></SkeletonLoadingWrapper>;
}
