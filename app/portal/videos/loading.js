import { VideosPageSkeleton } from '../_components/skeletons/VideosPageSkeleton';
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><VideosPageSkeleton /></SkeletonLoadingWrapper>;
}
