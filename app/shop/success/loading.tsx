import ShopSuccessSkeleton from '@/components/skeletons/ShopSuccessSkeleton'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><ShopSuccessSkeleton /></SkeletonLoadingWrapper>
}
