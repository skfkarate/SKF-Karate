import ShopOrdersSkeleton from '@/components/skeletons/ShopOrdersSkeleton'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><ShopOrdersSkeleton /></SkeletonLoadingWrapper>
}
