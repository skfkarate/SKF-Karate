import ShopCartSkeleton from '@/components/skeletons/ShopCartSkeleton'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><ShopCartSkeleton /></SkeletonLoadingWrapper>
}
