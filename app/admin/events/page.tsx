'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit2, Trash2 } from 'lucide-react'

export default function AdminEventsPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/events')
      const data = await res.json()
      setEvents(data.events || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return
    
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setNotification('Event deleted.')
        setTimeout(() => setNotification(''), 3000)
        fetchEvents()
      } else {
        alert('Failed to delete event')
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0a0a0a',
      color: '#fff',
      paddingBottom: '4rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {notification && (
        <div style={{ position: 'fixed', top: '2rem', right: '4rem', background: '#fff', color: '#000', padding: '1rem 1.5rem', fontWeight: 500, zIndex: 999, borderRadius: '4px' }}>
          {notification}
        </div>
      )}

      {/* Header */}
      <div style={{ 
        borderBottom: '1px solid #1a1a1a', 
        padding: '2rem 2.5rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end',
        background: '#000'
      }}>
        <div>
          <p style={{ color: '#666', fontSize: '0.8rem', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '1rem', textTransform: 'uppercase' }}>
            System Matrix
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 400, margin: 0, letterSpacing: '-0.03em' }}>
            Events Management
          </h1>
        </div>
        <Link
          href="/admin/events/new"
          style={{
            background: '#111',
            color: '#fff',
            border: '1px solid #333',
            padding: '0.75rem 1.5rem',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '0.9rem',
            borderRadius: '4px',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <Plus size={16} />
          Create Event
        </Link>
      </div>

      <div style={{ padding: '2rem 2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2rem' }}>
          
          {loading && events.length === 0 ? (
            <div style={{ color: '#666', padding: '2rem', border: '1px dashed #222', textAlign: 'center' }}>Querying...</div>
          ) : events.length === 0 ? (
            <div style={{ color: '#666', padding: '2rem', border: '1px dashed #222', textAlign: 'center' }}>No events found.</div>
          ) : (
            events.map((event: any) => (
              <div key={event.id} style={{
                background: '#050505',
                border: '1px solid #1a1a1a',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border 0.2s',
                position: 'relative'
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#333'}
              onMouseOut={e => e.currentTarget.style.borderColor = '#1a1a1a'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 500, letterSpacing: '-0.02em', paddingRight: '2rem' }}>{event.name}</h3>
                  <span style={{ fontSize: '0.7rem', fontWeight: 600, color: event.isPublished ? '#10b981' : '#666', background: '#111', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #222' }}>
                    {event.type.toUpperCase()}
                  </span>
                </div>
                
                <p style={{ fontSize: '0.85rem', color: '#888', margin: '0 0 1.5rem 0', lineHeight: 1.5, flex: 1 }}>
                  {event.description || 'No description provided.'}
                </p>

                <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <p style={{ fontSize: '0.8rem', color: '#ccc', margin: 0 }}>
                    <strong style={{color: '#666'}}>Date:</strong> {event.date}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#ccc', margin: 0 }}>
                    <strong style={{color: '#666'}}>Venue:</strong> {event.venue}, {event.city}
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#ccc', margin: 0 }}>
                    <strong style={{color: '#666'}}>Status:</strong> {event.status} {event.isPublished ? '(Published)' : '(Draft)'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Link href={`/admin/events/${event.id}`} style={{
                    flex: 1,
                    textAlign: 'center',
                    background: 'transparent',
                    color: '#fff',
                    border: '1px solid #333',
                    padding: '0.6rem',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    borderRadius: '4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                  }}>
                    <Edit2 size={14} /> Edit
                  </Link>
                  <button onClick={() => handleDelete(event.id, event.name)} style={{
                    background: 'transparent',
                    color: '#ef4444',
                    border: '1px solid #333',
                    padding: '0.6rem 1rem',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}

        </div>
      </div>
    </div>
  )
}
