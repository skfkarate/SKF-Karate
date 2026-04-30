'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { ROUTES } from '@/data/constants/routes'
import { adminProgramCreateSchema } from '@/src/server/api/validators/programs.validator'

type AdminProgram = {
  id: string
  name: string
  type: string
  branch?: string | null
  hasBeltSubtypes?: boolean
}

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<AdminProgram[]>([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState('')

  const fetchPrograms = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/programs')
      const data = await res.json()
      setPrograms(data.programs || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const id = window.setTimeout(() => {
      void fetchPrograms()
    }, 0)
    return () => window.clearTimeout(id)
  }, [fetchPrograms])

  const handleCreateNew = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adminProgramCreateSchema.parse({
          name: 'New Program Template',
          type: 'training',
          hasBeltSubtypes: true,
        }))
      })
      if (res.ok) {
        setNotification('Template registered.')
        setTimeout(() => setNotification(''), 3000)
        fetchPrograms()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100dvh', 
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
            Training Programs
          </h1>
        </div>
        <button
          onClick={handleCreateNew}
          disabled={loading}
          style={{
            background: '#111',
            color: '#fff',
            border: '1px solid #333',
            padding: '0.75rem 1.5rem',
            cursor: loading ? 'wait' : 'pointer',
            fontWeight: 500,
            fontSize: '0.9rem',
            borderRadius: '4px',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <Plus size={16} />
          Create Template
        </button>
      </div>

      <div style={{ padding: '2rem 2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
          
          {loading && programs.length === 0 ? (
            <div style={{ color: '#666', padding: '2rem', border: '1px dashed #222', textAlign: 'center' }}>Querying...</div>
          ) : programs.length === 0 ? (
            <div style={{ color: '#666', padding: '2rem', border: '1px dashed #222', textAlign: 'center' }}>No templates found.</div>
          ) : (
            programs.map((prog) => (
              <div key={prog.id} style={{
                background: '#050505',
                border: '1px solid #1a1a1a',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                transition: 'border 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#333'}
              onMouseOut={e => e.currentTarget.style.borderColor = '#1a1a1a'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 500, letterSpacing: '-0.02em' }}>{prog.name}</h3>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', background: '#111', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    {prog.type}
                  </span>
                </div>
                
                <p style={{ fontSize: '0.85rem', color: '#888', margin: '0 0 2rem 0', lineHeight: 1.5, flex: 1 }}>
                  {prog.branch || 'Certificate and training configuration'}
                </p>

                <div style={{ marginBottom: '2rem' }}>
                  <p style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', fontWeight: 600 }}>Coverage</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#ccc', padding: '0.2rem 0.5rem', background: '#111', border: '1px solid #222', borderRadius: '4px' }}>
                      {prog.hasBeltSubtypes ? 'Belt-specific templates' : 'General template'}
                      </span>
                  </div>
                </div>

                <Link href={ROUTES.ADMIN_PROGRAM_TEMPLATE_EDITOR(prog.id)} style={{
                  display: 'block',
                  textAlign: 'center',
                  background: 'transparent',
                  color: '#fff',
                  border: '1px solid #333',
                  padding: '0.75rem',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  borderRadius: '4px'
                }}>
                  Edit Configuration
                </Link>
              </div>
            ))
          )}

        </div>
      </div>
    </div>
  )
}
