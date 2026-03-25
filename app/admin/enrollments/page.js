'use client'

import { useState, useEffect } from 'react'

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [notification, setNotification] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/enrollments')
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          window.location.href = '/admin/login'
          return
        }
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      const data = await res.json()
      setEnrollments(data.enrollments || [])
    } catch (e) {
      console.error('Failed to fetch enrollments:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleIssueCertificates = async () => {
    setProcessing(true)
    try {
      const res = await fetch('/api/admin/enrollments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete_and_issue',
          enrollmentIds: enrollments.filter(e => e.status !== 'completed').map(e => e.id)
        })
      })
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          window.location.href = '/admin/login'
          return
        }
        throw new Error('Failed to authorize clearances')
      }
      
      setNotification('Clearance authorized. Certificates generated.')
      setTimeout(() => setNotification(''), 4000)
      fetchData()
    } catch (e) {
      console.error(e)
      setNotification('Error processing request.')
      setTimeout(() => setNotification(''), 4000)
    } finally {
      setProcessing(false)
    }
  }

  const handleNotifyParents = async () => {
    setProcessing(true)
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'certificate_ready', enrollmentIds: enrollments.filter(e => e.status !== 'completed').map(e => e.id) }) // Add enrollmentIds for payload structure
      })
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          window.location.href = '/admin/login'
          return
        }
        throw new Error('Failed to dispatch notifications')
      }
      
      setNotification('Communications dispatched.')
      setTimeout(() => setNotification(''), 4000)
    } catch (e) {
      console.error(e)
      setNotification('Error dispatching emails')
      setTimeout(() => setNotification(''), 4000)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000',
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
        borderBottom: '1px solid #111', 
        padding: '2rem 2.5rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end'
      }}>
        <div>
          <p style={{ color: '#666', fontSize: '0.8rem', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '1rem', textTransform: 'uppercase' }}>
            Authorization Protocols
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 400, margin: 0, letterSpacing: '-0.03em' }}>
            Certificate Approvals
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleIssueCertificates}
            disabled={processing || loading}
            style={{
              background: '#fff',
              color: '#000',
              border: 'none',
              padding: '0.75rem 1.5rem',
              cursor: (processing || loading) ? 'wait' : 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              borderRadius: '4px',
              opacity: (processing || loading) ? 0.5 : 1
            }}
          >
            Authorize Clearances
          </button>
          <button
            onClick={handleNotifyParents}
            disabled={processing || loading}
            style={{
              background: '#111',
              color: '#fff',
              border: '1px solid #333',
              padding: '0.75rem 1.5rem',
              cursor: (processing || loading) ? 'wait' : 'pointer',
              fontWeight: 500,
              fontSize: '0.9rem',
              borderRadius: '4px',
              opacity: (processing || loading) ? 0.5 : 1
            }}
          >
            Dispatch Email
          </button>
        </div>
      </div>

      <div style={{ padding: '2rem 2.5rem' }}>
        
        <div style={{ 
          border: '1px solid #111', 
          background: '#050505',
          borderRadius: '4px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ borderBottom: '1px solid #222' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 500, color: '#666', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Athlete</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 500, color: '#666', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Exam Code</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 500, color: '#666', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Target Rank</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 500, color: '#666', letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>Querying queue...</td></tr>
              ) : enrollments.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>No pending clearance requests.</td></tr>
              ) : (
                enrollments.map((enr, i) => (
                  <tr key={enr.id} style={{ borderBottom: i !== enrollments.length - 1 ? '1px solid #111' : 'none' }}>
                    <td style={{ padding: '1.25rem 1.5rem', fontWeight: 500, color: '#fff' }}>
                      {enr.athleteName}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', color: '#666', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {enr.programName}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', color: '#ccc', fontSize: '0.9rem' }}>
                      {enr.beltLevel}
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <span style={{ 
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.7rem', 
                        fontWeight: 600,
                        color: enr.status === 'completed' ? '#fff' : '#888',
                        background: enr.status === 'completed' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: `1px solid ${enr.status === 'completed' ? '#fff' : '#333'}`,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {enr.status === 'completed' ? (
                          <>AUTHORIZED</>
                        ) : (
                          <>AWAITING_CLEARANCE</>
                        )}
                      </span>
                      {enr.certificateUrl && (
                        <a href={enr.certificateUrl} target="_blank" rel="noreferrer" style={{ marginLeft: '1rem', color: '#666', fontSize: '0.75rem', textDecoration: 'underline' }}>
                          View Document
                        </a>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
