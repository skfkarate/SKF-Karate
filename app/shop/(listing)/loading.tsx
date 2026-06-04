import ShopPageSkeleton from '@/components/skeletons/ShopPageSkeleton'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><ShopPageSkeleton /></SkeletonLoadingWrapper>
}
