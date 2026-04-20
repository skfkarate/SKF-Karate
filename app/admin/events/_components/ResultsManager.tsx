'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ResultsManager({ eventId, participants = [], results = [], type }: { eventId: string, participants: any[], results: any[], type: string }) {
  const router = useRouter()
  const [localResults, setLocalResults] = useState<any[]>(results || [])
  const [publishing, setPublishing] = useState(false)
  const [saving, setSaving] = useState(false)

  const isTournament = type === 'tournament'

  const handleResultChange = (participantId: string, field: string, value: string) => {
    setLocalResults(prev => {
      const idx = prev.findIndex(r => r.participantId === participantId)
      if (idx !== -1) {
        const copy = [...prev]
        copy[idx] = { ...copy[idx], [field]: value }
        return copy
      } else {
        const p = participants.find(part => part.id === participantId)
        return [...prev, {
          id: `res_${Date.now()}`,
          participantId: p.id,
          athleteId: p.athleteId,
          athleteName: p.athleteName,
          registrationNumber: p.registrationNumber,
          [field]: value
        }]
      }
    })
  }

  const handleSaveDraft = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: localResults })
      })
      if (res.ok) {
        alert('Results Draft Saved!')
        router.refresh()
      }
    } catch(e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handlePublishToProfiles = async () => {
    if (!confirm('This will permanently add achievements to the Athletes Profiles. Continue?')) return
    
    setPublishing(true)
    try {
      // First save the current draft
      await fetch(`/api/admin/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: localResults })
      })

      // Then push to profiles
      const res = await fetch(`/api/admin/events/${eventId}/publish-results`, {
        method: 'POST'
      })

      if (res.ok) {
        alert('Successfully published to Athlete Profiles!')
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to publish to profiles')
      }
    } catch(e) {
      console.error(e)
    } finally {
      setPublishing(false)
    }
  }

  if (participants.length === 0) {
    return <div style={{ color: '#888' }}>Please assign athletes first before managing results.</div>
  }

  const inputStyle = {
    padding: '0.4rem 0.6rem',
    background: '#050505',
    border: '1px solid #333',
    color: '#fff',
    borderRadius: '4px',
    fontSize: '0.8rem',
    width: '100%'
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontWeight: 500 }}>Participant Outcomes</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={handleSaveDraft} disabled={saving || publishing} style={{ background: '#333', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}>
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button onClick={handlePublishToProfiles} disabled={saving || publishing} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}>
            {publishing ? 'Publishing...' : 'Publish to Student Profiles'}
          </button>
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '2rem' }}>
        Record the outcomes for enrolled participants. For Belt Exams, mark promotions. For Tournaments, record medals. When ready, pushing to Student Profiles securely locks the achievement onto their public record.
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ background: '#111', color: '#888', textAlign: 'left' }}>
            <th style={{ padding: '1rem' }}>Athlete</th>
            {isTournament ? (
              <>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem', width: '150px' }}>Medal Position</th>
              </>
            ) : (
              <>
                <th style={{ padding: '1rem' }}>Result / Award</th>
                <th style={{ padding: '1rem', width: '200px' }}>Belt Promotion?</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {participants.map((p) => {
            const currentResult = localResults.find(r => r.participantId === p.id) || {}
            
            return (
              <tr key={p.id} style={{ borderBottom: '1px solid #1a1a1a' }}>
                <td style={{ padding: '1rem' }}>
                  <strong style={{ display: 'block', color: '#fff' }}>{p.athleteName}</strong>
                  <span style={{ color: '#666', fontSize: '0.75rem' }}>{p.registrationNumber}</span>
                </td>
                
                {isTournament ? (
                  <>
                    <td style={{ padding: '1rem' }}>
                      <input 
                        type="text" 
                        placeholder="e.g. Kata Individual"
                        style={inputStyle}
                        value={currentResult.category || ''}
                        onChange={e => handleResultChange(p.id, 'category', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select 
                        style={{...inputStyle, WebkitAppearance: 'none'}}
                        value={currentResult.medal || ''}
                        onChange={e => handleResultChange(p.id, 'medal', e.target.value)}
                      >
                        <option value="">-- None --</option>
                        <option value="gold">Gold</option>
                        <option value="silver">Silver</option>
                        <option value="bronze">Bronze</option>
                        <option value="participation">Participation</option>
                      </select>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: '1rem' }}>
                      <input 
                         type="text" 
                         placeholder="e.g. Completed, Best Performer"
                         style={inputStyle}
                         value={currentResult.award || ''}
                         onChange={e => handleResultChange(p.id, 'award', e.target.value)}
                      />
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <select 
                        style={{...inputStyle, WebkitAppearance: 'none'}}
                        value={currentResult.promotion || ''}
                        onChange={e => handleResultChange(p.id, 'promotion', e.target.value)}
                      >
                        <option value="">-- No Promotion --</option>
                        <option value="yellow">Yellow Belt</option>
                        <option value="orange">Orange Belt</option>
                        <option value="green">Green Belt</option>
                        <option value="blue">Blue Belt</option>
                        <option value="purple">Purple Belt</option>
                        <option value="brown">Brown Belt</option>
                        <option value="black-1st-dan">Black Belt (1st Dan)</option>
                      </select>
                    </td>
                  </>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
