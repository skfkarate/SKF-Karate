import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'

import VideosClient from './VideosClient'


export default async function PortalVideosPage() {
  await requirePortalAthlete()
  return <VideosClient />
}
