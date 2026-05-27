'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { getApiErrorMessage } from '@/app/admin/_utils/apiErrors'

export type EventParticipant = {
  id: string
  athleteId?: string
  athleteName: string
  skfId: string
  branchName?: string
  belt?: string
  photoUrl?: string
}

type AthleteSearchResult = {
  id?: string
  firstName?: string
  lastName?: string
  skfId?: string
  branchName?: string
  currentBelt?: string
  photoUrl?: string
}

export default function AthleteAssigner({ eventId, participants = [] }: { eventId: string, participants: EventParticipant[] }) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AthleteSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/athletes/search?q=${encodeURIComponent(query)}`)
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        alert(getApiErrorMessage(data, 'Failed to search athletes'))
        setResults([])
        return
      }
      setResults(data?.athletes || [])
    } catch {
      // Empty search results are shown when athlete lookup fails.
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (athlete: AthleteSearchResult) => {
    if (participants.some(p => p.athleteId === athlete.id || p.skfId === athlete.skfId)) {
      alert('Athlete is already assigned to this event')
      return
    }

    setSaving(true)
    try {
      const newParticipant = {
        id: `p_${eventId}_${athlete.id || athlete.skfId}`,
        athleteId: athlete.id,
        athleteName: `${athlete.firstName || ''} ${athlete.lastName || ''}`.trim() || athlete.skfId || 'Athlete',
        skfId: athlete.skfId || '',
        branchName: athlete.branchName,
        belt: athlete.currentBelt,
        photoUrl: athlete.photoUrl
      }

      const updatedParticipants = [...participants, newParticipant]

      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants: updatedParticipants })
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json().catch(() => null)
        alert(getApiErrorMessage(data, 'Failed to assign athlete'))
      }
    } catch {
      // Save failures leave the current selection unchanged.
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (participantId: string) => {
    if (!confirm('Remove this athlete?')) return
    setSaving(true)
    try {
      const updatedParticipants = participants.filter(p => p.id !== participantId)
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participants: updatedParticipants })
      })
      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json().catch(() => null)
        alert(getApiErrorMessage(data, 'Failed to remove athlete'))
      }
    } catch {
      // Removal failures leave the current assignment unchanged.
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
      
      {/* Search & Add Column */}
      <div>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontWeight: 500 }}>Search Directory</h3>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          <input 
            type="text" 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            placeholder="Search by name or SKF ID..."
            style={{ flex: 1, padding: '0.6rem 1rem', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '4px' }}
          />
          <button type="submit" disabled={loading} style={{ background: '#fff', color: '#000', border: 'none', padding: '0 1.5rem', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>
            {loading ? '...' : 'Search'}
          </button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {results.map((a) => (
            <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0a0a0a', padding: '1rem', border: '1px solid #222', borderRadius: '4px' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>{a.firstName} {a.lastName}</strong>
                <span style={{ fontSize: '0.75rem', color: '#888' }}>{a.skfId} • {a.branchName}</span>
              </div>
              <button 
                onClick={() => handleAssign(a)} 
                disabled={saving}
                style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '0.4rem 1rem', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer' }}
              >
                Enroll
              </button>
            </div>
          ))}
          {results.length === 0 && !loading && <span style={{ color: '#666', fontSize: '0.85rem' }}>No results shown.</span>}
        </div>
      </div>

      {/* Enrolled Athletes Column */}
      <div>
        <h3 style={{ marginTop: 0, marginBottom: '1.5rem', fontWeight: 500, color: '#10b981' }}>Enrolled ({participants.length})</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {participants.map((p) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', padding: '1rem', border: '1px solid #333', borderRadius: '4px' }}>
              <div>
                <strong style={{ display: 'block', fontSize: '0.95rem' }}>{p.athleteName}</strong>
                <span style={{ fontSize: '0.75rem', color: '#888' }}>{p.skfId} • {p.branchName}</span>
              </div>
              <button 
                onClick={() => handleRemove(p.id)} 
                disabled={saving}
                style={{ background: 'transparent', color: '#ef4444', border: 'none', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Remove
              </button>
            </div>
          ))}
          {participants.length === 0 && <span style={{ color: '#666', fontSize: '0.85rem' }}>No athletes enrolled yet.</span>}
        </div>
      </div>

    </div>
  )
}
