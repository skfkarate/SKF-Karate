'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Settings, Users, PowerOff } from 'lucide-react'

export default function AdminCertificatesPage() {
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrograms()
  }, [])

  async function fetchPrograms() {
    try {
      const res = await fetch('/api/admin/certificates/programs')
      const data = await res.json()
      setPrograms(data.programs || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', background: '#0a0a0a', color: '#fff', 
      paddingBottom: '4rem', fontFamily: 'system-ui, -apple-system, sans-serif' 
    }}>
      <div style={{ borderBottom: '1px solid #1a1a1a', padding: '2rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', background: '#000' }}>
        <div>
          <p style={{ color: '#666', fontSize: '0.8rem', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '1rem', textTransform: 'uppercase' }}>
            System Matrix
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 400, margin: 0, letterSpacing: '-0.03em' }}>
            Certificate Programs
          </h1>
        </div>
        <Link
          href="/admin/certificates/programs/new"
          style={{
            background: '#111', color: '#fff', border: '1px solid #333', padding: '0.75rem 1.5rem',
            textDecoration: 'none', fontWeight: 500, fontSize: '0.9rem', borderRadius: '4px',
            display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <Plus size={16} />
          New Program
        </Link>
      </div>

      <div style={{ padding: '2rem 2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '2rem' }}>
          {loading && programs.length === 0 ? (
            <div style={{ color: '#666', padding: '2rem', border: '1px dashed #222', textAlign: 'center' }}>Querying...</div>
          ) : programs.length === 0 ? (
            <div style={{ color: '#666', padding: '2rem', border: '1px dashed #222', textAlign: 'center' }}>No programs found.</div>
          ) : (
            programs.map(prog => (
              <div key={prog.id} style={{
                background: '#050505', border: '1px solid #1a1a1a', padding: '2rem', 
                display: 'flex', flexDirection: 'column', transition: 'border 0.2s', position: 'relative'
              }}
              onMouseOver={e => e.currentTarget.style.borderColor = '#333'}
              onMouseOut={e => e.currentTarget.style.borderColor = '#1a1a1a'}
              >
                {!prog.is_active && <span style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.7rem', color: '#ff4444', border: '1px solid #ff4444', padding: '2px 6px', borderRadius: '4px' }}>INACTIVE</span>}

                <div style={{ marginBottom: '1.5rem' }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', fontWeight: 500, letterSpacing: '-0.02em' }}>{prog.name}</h3>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gold, #f39c12)' }}>{prog.type.replace('_', ' ').toUpperCase()}</span>
                  {prog.branch && <span style={{ fontSize: '0.8rem', marginLeft: '10px', color: '#888' }}>• {prog.branch}</span>}
                </div>
                
                <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem', flex: 1 }}>
                  <div>
                     <p style={{ margin: '0 0 0.2rem 0', fontSize: '1.5rem', fontWeight: 600 }}>{prog.certificate_templates[0]?.count || 0}</p>
                     <p style={{ margin: 0, fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>Templates</p>
                  </div>
                  <div>
                     <p style={{ margin: '0 0 0.2rem 0', fontSize: '1.5rem', fontWeight: 600 }}>{prog.enrollments[0]?.count || 0}</p>
                     <p style={{ margin: 0, fontSize: '0.7rem', color: '#666', textTransform: 'uppercase' }}>Enrolled</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Link href={`/admin/certificates/programs/${prog.id}/template-editor`} style={{
                    flex: 1, textAlign: 'center', background: '#111', color: '#fff', border: '1px solid #333',
                    padding: '0.75rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, borderRadius: '4px',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
                  }}>
                    <Settings size={16} /> Manage Templates
                  </Link>
                  <Link href={`/admin/enrollments?program=${prog.id}`} style={{
                    flex: 1, textAlign: 'center', background: 'transparent', color: '#fff', border: '1px solid #333',
                    padding: '0.75rem', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500, borderRadius: '4px',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem'
                  }}>
                    <Users size={16} /> Enrollments
                  </Link>
                  <button 
                    onClick={async () => {
                      if (!confirm(`${prog.is_active ? 'Archive' : 'Reactivate'} "${prog.name}"?`)) return
                      try {
                        await fetch(`/api/admin/certificates/programs/${prog.id}/toggle`, { method: 'PATCH' })
                        fetchPrograms()
                      } catch (e) { alert('Failed to toggle') }
                    }}
                    title={prog.is_active ? 'Archive Program' : 'Reactivate Program'}
                    style={{
                      background: 'transparent', color: prog.is_active ? '#ff4444' : '#2ecc71', border: '1px solid #333', padding: '0.75rem', 
                      cursor: 'pointer', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }}
                  >
                    <PowerOff size={16} />
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
