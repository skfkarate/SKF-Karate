import AdminEventsClient, { type AdminEventRow } from './AdminEventsClient'
import { getAllEventsAdminLive } from '@/lib/server/repositories/events-live'
import { requireAdminSession } from '@/lib/utils/auth'

export const dynamic = 'force-dynamic'

async function loadInitialEvents() {
  try {
    return (await getAllEventsAdminLive()) as unknown as AdminEventRow[]
  } catch (error) {
    console.error('[admin-events] Failed to load initial events:', error)
    return []
  }
}

export default async function AdminEventsPage() {
  await requireAdminSession(['admin', 'instructor'])
  const events = await loadInitialEvents()

  return <AdminEventsClient initialEvents={events} />
}
