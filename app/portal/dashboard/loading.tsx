import { DashboardPageSkeleton } from '../_components/skeletons/DashboardPageSkeleton';
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><DashboardPageSkeleton /></SkeletonLoadingWrapper>;
}
