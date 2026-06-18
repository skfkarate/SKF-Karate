import { CreditsPageSkeleton } from '../_components/skeletons/CreditsPageSkeleton';
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><CreditsPageSkeleton /></SkeletonLoadingWrapper>;
}
