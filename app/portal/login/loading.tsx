import { LoginPageSkeleton } from '../_components/skeletons/LoginPageSkeleton';
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><LoginPageSkeleton /></SkeletonLoadingWrapper>;
}
