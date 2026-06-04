import ShopCheckoutSkeleton from '@/components/skeletons/ShopCheckoutSkeleton'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><ShopCheckoutSkeleton /></SkeletonLoadingWrapper>
}
