import ShopProductSkeleton from '@/components/skeletons/ShopProductSkeleton'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><ShopProductSkeleton /></SkeletonLoadingWrapper>
}
