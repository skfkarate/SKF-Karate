import GalleryPageSkeleton from '@/components/skeletons/GalleryPageSkeleton'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><GalleryPageSkeleton /></SkeletonLoadingWrapper>
}
