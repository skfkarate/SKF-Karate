import { getEventByIdAdmin } from '@/lib/server/repositories/events'
import EditEventClient from './EditEventClient'
import { notFound } from 'next/navigation'

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const { id } = await Promise.resolve(params)
  const event = getEventByIdAdmin(id)

  if (!event) {
    notFound()
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
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
        <EditEventClient eventData={event} />
      </div>
    </div>
  )
}
