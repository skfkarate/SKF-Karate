import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'

import VideosClient from './VideosClient'


export default async function PortalVideosPage() {
  await requirePortalAthlete({ callbackUrl: '/portal/videos' })
  return <VideosClient />
}
