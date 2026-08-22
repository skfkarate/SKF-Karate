import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'
import { getPracticeLibraryForAthlete } from '@/lib/server/repositories/portal-content-live'
import { PortalVideoProgressService } from '@/src/server/services/portal-video-progress.service'

import VideosClient from './VideosClient'


export default async function PortalVideosPage() {
  const { athlete, session } = await requirePortalAthlete({ callbackUrl: '/portal/videos' })
  let initialPayload = null

  try {
    const [library, progress] = await Promise.all([
      getPracticeLibraryForAthlete({
        branchName: athlete.branchName || session.branch || '',
        batch: athlete.batch || session.batch || '',
        belt: athlete.currentBelt || session.belt || '',
      }),
      PortalVideoProgressService.list(session.skfId),
    ])
    initialPayload = {
      ...library,
      progressData: progress.progressData,
      recentlyAddedCutoff: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
  } catch {
    // The client request remains as a resilient fallback if a transient server
    // data request fails during navigation.
  }

  return <VideosClient initialPayload={initialPayload} />
}
