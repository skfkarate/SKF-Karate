'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewCertificateProgram() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    type: 'belt_exam',
    branch: 'ALL'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/certificates/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Failed to create program')
      
      router.push(`/admin/certificates/programs/${data.programId}/template-editor`)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', justifyContent: 'center', padding: '4rem 1rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        
        <Link href="/admin/certificates" style={{ color: '#888', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block', fontSize: '0.9rem' }}>
          ← Back to Programs
        </Link>

        <h1 style={{ fontSize: '2rem', margin: '0 0 2rem 0', fontWeight: 500, letterSpacing: '-0.02em' }}>Configure New Program</h1>
        
        {error && <div style={{ background: 'rgba(214, 40, 40, 0.1)', color: '#ff4444', padding: '1rem', border: '1px solid #ff4444', marginBottom: '2rem', borderRadius: '4px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ background: '#050505', border: '1px solid #1a1a1a', padding: '2rem', borderRadius: '8px' }}>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Program Name</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Summer Camp 2026, Kyu Grading"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', background: '#111', border: '1px solid #333', color: '#fff', padding: '0.75rem', borderRadius: '4px', fontSize: '1rem' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Program Type</label>
            <select 
              value={formData.type}
              onChange={e => setFormData({...formData, type: e.target.value})}
              style={{ width: '100%', background: '#111', border: '1px solid #333', color: '#fff', padding: '0.75rem', borderRadius: '4px', fontSize: '1rem' }}
            >
              <option value="belt_exam">Kyu Grading / Belt Exam</option>
              <option value="camp">Training Camp</option>
              <option value="training">General Training Module</option>
              <option value="tournament">Tournament Completion</option>
            </select>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#888', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Branch Restriction</label>
            <select 
              value={formData.branch}
              onChange={e => setFormData({...formData, branch: e.target.value})}
              style={{ width: '100%', background: '#111', border: '1px solid #333', color: '#fff', padding: '0.75rem', borderRadius: '4px', fontSize: '1rem' }}
            >
              <option value="ALL">All Branches (Global)</option>
              <option value="Koramangala">Koramangala</option>
              <option value="HSR Layout">HSR Layout</option>
              <option value="Indiranagar">Indiranagar</option>
            </select>
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>If restricted, only students from this branch can be enrolled.</p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', background: '#fff', color: '#000', border: 'none', padding: '1rem', 
              fontSize: '1rem', fontWeight: 600, cursor: loading ? 'wait' : 'pointer', borderRadius: '4px' 
            }}
          >
            {loading ? 'Creating...' : 'Create Program & Configure Templates'}
          </button>
        </form>
      </div>
    </div>
  )
}
