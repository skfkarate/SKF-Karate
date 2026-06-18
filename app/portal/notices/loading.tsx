import { NoticesPageSkeleton } from '../_components/skeletons/NoticesPageSkeleton';
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><NoticesPageSkeleton /></SkeletonLoadingWrapper>;
}
