import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'
import { getProtectedPortalVideosForAthlete } from '@/lib/server/repositories/portal-content-live'
import { PortalVideoProgressService } from '@/src/server/services/portal-video-progress.service'

import VideosClient from './VideosClient'

export const dynamic = 'force-dynamic'

export default async function PortalVideosPage() {
  const { athlete, session } = await requirePortalAthlete()

  const [videos, progress] = await Promise.all([
    getProtectedPortalVideosForAthlete({
      branchName: athlete.branchName || session.branch || '',
      batch: athlete.batch || session.batch || '',
      belt: athlete.currentBelt || session.belt || '',
    }),
    PortalVideoProgressService.list(session.skfId),
  ])

  return (
    <VideosClient
      initialVideos={videos}
      initialProgressData={progress.progressData}
    />
  )
}
