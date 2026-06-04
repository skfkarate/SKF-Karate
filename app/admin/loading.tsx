import RouteLoadingShell from '@/components/skeletons/RouteLoadingShell'
import { SkeletonLoadingWrapper } from '@/components/navigation/SkeletonLoadingWrapper'

export default function Loading() {
  return <SkeletonLoadingWrapper><RouteLoadingShell variant="admin" /></SkeletonLoadingWrapper>
}
