import AdminEventsClient, { type AdminEventRow } from './AdminEventsClient'
import { getAllEventsAdminLive } from '@/lib/server/repositories/events-live'
import { requireAdminSession } from '@/lib/utils/auth'
import { logger } from '@/src/server/lib/logger'

export const dynamic = 'force-dynamic'

async function loadInitialEvents() {
  try {
    return (await getAllEventsAdminLive()) as unknown as AdminEventRow[]
  } catch (error) {
    logger.error('admin_events.initial_load_failed', { error })
    return []
  }
}

export default async function AdminEventsPage() {
  await requireAdminSession(['admin', 'instructor'])
  const events = await loadInitialEvents()

  return <AdminEventsClient initialEvents={events} />
}
