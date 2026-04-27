import { getEventByIdAdminLive } from '@/lib/server/repositories/events-live'
import { getAllCitiesLive } from '@/lib/server/repositories/classes-live'
import { getAssignableSenseisLive } from '@/lib/server/repositories/senseis-live'
import EditEventClient from './EditEventClient'
import { notFound, redirect } from 'next/navigation'

export default async function EditEventPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams?: { tab?: string }
}) {
  const { id } = await Promise.resolve(params)
  const resolvedSearchParams = await Promise.resolve(searchParams)
  const [event, classCities, senseis] = await Promise.all([
    getEventByIdAdminLive(id),
    getAllCitiesLive(),
    getAssignableSenseisLive(),
  ])

  if (!event) {
    notFound()
  }

  if (event.type === 'tournament') {
    redirect(`/admin/results/${event.id}/edit`)
  }

  const initialTab =
    resolvedSearchParams?.tab === 'athletes' || resolvedSearchParams?.tab === 'results'
      ? resolvedSearchParams.tab
      : 'details'

  return (
    <div style={{ 
      minHeight: '100dvh', 
      background: '#0a0a0a',
      color: '#fff',
      paddingBottom: '4rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ 
        borderBottom: '1px solid #1a1a1a', 
        padding: '2rem 2.5rem', 
        background: '#000'
      }}>
        <p style={{ color: '#666', fontSize: '0.8rem', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '1rem', textTransform: 'uppercase' }}>
          Administration / Events / {event.name}
        </p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 400, margin: 0, letterSpacing: '-0.03em' }}>
          Event Control Center
        </h1>
      </div>

      <div style={{ padding: '2rem 2.5rem' }}>
        <EditEventClient
          eventData={event}
          classCities={classCities}
          senseis={senseis}
          initialTab={initialTab}
        />
      </div>
    </div>
  )
}
