'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Papa from 'papaparse'
import { CertificateModal } from '@/components/CertificateModal'

// Types
interface Enrollment {
  id: string
  skfId: string
  studentName: string
  belt: string
  branch: string
  programId: string
  programName: string
  status: string
  certUnlocked: boolean
  date: string
}

interface ImportRow {
  skf_id: string
  program_id: string
  belt_level?: string
  completion_date?: string
  issuer_name?: string
}

export default function AdminEnrollmentsPage() {
  const searchParams = useSearchParams()
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterBranch, setFilterBranch] = useState('ALL')
  const [filterProgram, setFilterProgram] = useState(searchParams?.get('program') || 'ALL')
  const [programs, setPrograms] = useState<{id: string, name: string}[]>([])

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Modals
  const [showImportModal, setShowImportModal] = useState(false)
  const [importPreview, setImportPreview] = useState<ImportRow[]>([])
  const [importing, setImporting] = useState(false)
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [whatsappTemplateProgramName, setWhatsappTemplateProgramName] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editBelt, setEditBelt] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editIssuer, setEditIssuer] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  // Certificate Preview Modal
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewEnrollmentId, setPreviewEnrollmentId] = useState('')
  const [previewSkfId, setPreviewSkfId] = useState('')

  useEffect(() => {
    fetchEnrollments()
    fetchPrograms()
  }, [])

  async function fetchEnrollments() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/enrollments')
      const data = await res.json()
      setEnrollments(data.enrollments || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
      setSelectedIds([])
    }
  }

  async function fetchPrograms() {
    try {
       const res = await fetch('/api/admin/certificates/programs')
       const data = await res.json()
       setPrograms(data.programs || [])
    } catch (e) { }
  }

  // Filtered List
  const filtered = enrollments.filter(e => {
    if (filterStatus !== 'ALL' && e.status !== filterStatus) return false
    if (filterBranch !== 'ALL' && e.branch !== filterBranch) return false
    if (filterProgram !== 'ALL' && e.programId !== filterProgram) return false
    if (search && !e.studentName.toLowerCase().includes(search.toLowerCase()) && !e.skfId.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  // Bulk Actions
  const handleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([])
    else setSelectedIds(filtered.map(f => f.id))
  }

  const handleBulkAction = async (action: 'complete' | 'unlock' | 'revoke') => {
    if (!confirm(`Are you sure you want to ${action} ${selectedIds.length} enrollments?`)) return
    try {
      const res = await fetch('/api/admin/enrollments/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentIds: selectedIds, action })
      })
      if (!res.ok) throw new Error('Bulk API Error')
      
      // If complete, trigger WhatsApp generator automatically
      if (action === 'complete') {
         const activeId = selectedIds[0]
         const prog = enrollments.find(e => e.id === activeId)?.programName
         setWhatsappTemplateProgramName(prog || 'Your Program')
         setShowWhatsAppModal(true)
      }
      
      fetchEnrollments() // Refresh table
    } catch (e) {
      alert(e)
    }
  }

  const handleBulkNotify = async () => {
    if (!confirm(`Send Resend emails to ${selectedIds.length} parents?`)) return
    try {
      const res = await fetch('/api/admin/enrollments/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollmentIds: selectedIds })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      alert(`Sent ${data.count} emails successfully!`)
    } catch (e: any) { alert(e.message) }
  }

  // Single Actions
  const markComplete = async (id: string) => {
    await fetch(`/api/admin/enrollments/${id}/complete`, { method: 'PATCH', body: JSON.stringify({}) })
    fetchEnrollments()
  }
  const revoke = async (id: string) => {
    if (!confirm('This specifically locks the cert. Continue?')) return
    await fetch(`/api/admin/enrollments/${id}/revoke`, { method: 'PATCH' })
    fetchEnrollments()
  }

  // Edit enrollment details (error correction)
  const openEditModal = (row: Enrollment) => {
    setEditId(row.id)
    setEditBelt(row.belt || '')
    setEditDate(row.date || '')
    setEditIssuer('')
    setEditModalOpen(true)
  }

  const saveEdit = async () => {
    if (!editId) return
    setEditSaving(true)
    try {
      const res = await fetch(`/api/admin/enrollments/${editId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          belt_level: editBelt || undefined,
          completion_date: editDate || undefined,
          issuer_name: editIssuer || undefined
        })
      })
      if (!res.ok) throw new Error('Failed to update')
      setEditModalOpen(false)
      fetchEnrollments()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setEditSaving(false)
    }
  }

  // Certificate Preview
  const openPreview = (row: Enrollment) => {
    setPreviewEnrollmentId(row.id)
    setPreviewSkfId(row.skfId)
    setPreviewOpen(true)
  }

  // CSV Importer Logic
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    Papa.parse<ImportRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setImportPreview(results.data)
        setShowImportModal(true)
      }
    })
    e.target.value = '' // Reset
  }

  const executeImport = async () => {
    setImporting(true)
    let errs = 0
    for (const row of importPreview) {
      try {
        await fetch('/api/admin/enrollments', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ skfId: row.skf_id, programId: row.program_id, beltLevel: row.belt_level, completionDate: row.completion_date, issuerName: row.issuer_name })
        })
      } catch (e) { errs++ }
    }
    setImporting(false)
    setShowImportModal(false)
    setImportPreview([])
    if (errs > 0) alert(`Import finished with ${errs} errors. Check exact SKF ID formatting.`)
    fetchEnrollments()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
           <h1 style={{ margin: 0, fontSize: '2rem', fontWeight: 500 }}>Enrollment Management</h1>
           <p style={{ color: '#888', margin: '0.5rem 0 0 0' }}>Process certifications, bulk mark grades, and communicate to parents.</p>
        </div>
        <div>
           <input type="file" accept=".csv" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
           <button 
             onClick={() => fileInputRef.current?.click()}
             style={{ background: '#111', color: '#fff', border: '1px solid #333', padding: '0.75rem 1.5rem', cursor: 'pointer', borderRadius: '4px' }}
           >
             Import from CSV
           </button>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <input 
          type="text" 
          placeholder="Search Name or SKF ID..." 
          value={search} onChange={e => setSearch(e.target.value)}
          style={{ padding: '0.75rem', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px', minWidth: '250px' }}
        />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '0.75rem', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px' }}>
          <option value="ALL">All Statuses</option>
          <option value="enrolled">Pending (Enrolled)</option>
          <option value="completed">Completed (Unlocked)</option>
          <option value="revoked">Revoked</option>
        </select>
        <select value={filterProgram} onChange={e => setFilterProgram(e.target.value)} style={{ padding: '0.75rem', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px' }}>
          <option value="ALL">All Programs</option>
          {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div style={{ background: '#111', border: '1px solid #333', padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderRadius: '8px', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--gold, #f39c12)', fontWeight: 600 }}>{selectedIds.length} Selected</span>
          <div style={{ height: '24px', width: '1px', background: '#333' }}></div>
          <button onClick={() => handleBulkAction('complete')} style={{ background: '#fff', color: '#000', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px', fontWeight: 600 }}>Mark Complete + Unlock</button>
          <button onClick={handleBulkNotify} style={{ background: '#222', color: '#fff', border: '1px solid #444', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px' }}>Send Email Notifications</button>
          <button onClick={() => handleBulkAction('revoke')} style={{ background: 'transparent', color: '#ff4444', border: '1px solid #ff4444', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px' }}>Revoke Certificates</button>
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#050505', border: '1px solid #1a1a1a', borderRadius: '8px', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#111', borderBottom: '1px solid #222' }}>
              <th style={{ padding: '1rem' }}><input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={handleSelectAll} /></th>
              <th style={{ padding: '1rem', color: '#888', fontWeight: 500 }}>Student Name</th>
              <th style={{ padding: '1rem', color: '#888', fontWeight: 500 }}>SKF ID</th>
              <th style={{ padding: '1rem', color: '#888', fontWeight: 500 }}>Program</th>
              <th style={{ padding: '1rem', color: '#888', fontWeight: 500 }}>Belt</th>
              <th style={{ padding: '1rem', color: '#888', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '1rem', color: '#888', fontWeight: 500 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading...</td></tr> : 
             filtered.map(row => (
              <tr key={row.id} style={{ borderBottom: '1px solid #1a1a1a', background: selectedIds.includes(row.id) ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                <td style={{ padding: '1rem' }}>
                  <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={(e) => {
                    if (e.target.checked) setSelectedIds([...selectedIds, row.id])
                    else setSelectedIds(selectedIds.filter(id => id !== row.id))
                  }} />
                </td>
                <td style={{ padding: '1rem', fontWeight: 500 }}>{row.studentName}</td>
                <td style={{ padding: '1rem', color: '#888', fontFamily: 'monospace' }}>{row.skfId}</td>
                <td style={{ padding: '1rem' }}>{row.programName}</td>
                <td style={{ padding: '1rem' }}>{row.belt}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                    background: row.status === 'completed' ? 'rgba(46, 204, 113, 0.1)' : row.status === 'revoked' ? 'rgba(231, 76, 60, 0.1)' : 'rgba(243, 156, 18, 0.1)',
                    color: row.status === 'completed' ? '#2ecc71' : row.status === 'revoked' ? '#e74c3c' : '#f39c12'
                  }}>
                    {row.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {row.status === 'enrolled' && (
                       <button onClick={() => markComplete(row.id)} style={{ padding: '4px 8px', background: '#fff', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Mark Complete</button>
                    )}
                    {(row.status === 'completed' || row.certUnlocked) && (
                       <>
                         <button onClick={() => openPreview(row)} style={{ padding: '4px 8px', background: 'rgba(243,156,18,0.1)', color: '#f39c12', border: '1px solid rgba(243,156,18,0.3)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Preview</button>
                         <button onClick={() => revoke(row.id)} style={{ padding: '4px 8px', background: 'transparent', color: '#e74c3c', border: '1px solid #e74c3c', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Revoke</button>
                       </>
                    )}
                    <button onClick={() => openEditModal(row)} style={{ padding: '4px 8px', background: 'transparent', color: '#888', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}>Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#050505', border: '1px solid #333', padding: '2rem', width: '450px', borderRadius: '8px' }}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 500 }}>Edit Enrollment</h2>
            <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Correct errors in enrollment data. Certificate will regenerate with new data on next view.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '0.25rem' }}>Belt Level</label>
                <input type="text" value={editBelt} onChange={e => setEditBelt(e.target.value)} placeholder="e.g. Yellow" style={{ width: '100%', padding: '0.75rem', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '0.25rem' }}>Completion Date</label>
                <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} style={{ width: '100%', padding: '0.75rem', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#888', display: 'block', marginBottom: '0.25rem' }}>Issuer Name</label>
                <input type="text" value={editIssuer} onChange={e => setEditIssuer(e.target.value)} placeholder="e.g. Sensei Ramesh" style={{ width: '100%', padding: '0.75rem', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px' }} />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button disabled={editSaving} onClick={() => setEditModalOpen(false)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: '#fff', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              <button disabled={editSaving} onClick={saveEdit} style={{ padding: '0.75rem 1.5rem', background: '#fff', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: editSaving ? 'wait' : 'pointer' }}>
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#050505', border: '1px solid #333', padding: '2rem', width: '600px', borderRadius: '8px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ margin: '0 0 1rem 0' }}>Review Import ({importPreview.length} records)</h2>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', border: '1px solid #222' }}>
              <table style={{ width: '100%', fontSize: '0.8rem', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#111' }}>
                    <th style={{ padding: '0.5rem' }}>SKF ID</th>
                    <th style={{ padding: '0.5rem' }}>Program ID</th>
                    <th style={{ padding: '0.5rem' }}>Belt</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.map((r, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #222' }}>
                      <td style={{ padding: '0.5rem' }}>{r.skf_id}</td>
                      <td style={{ padding: '0.5rem' }}>{r.program_id}</td>
                      <td style={{ padding: '0.5rem' }}>{r.belt_level || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button disabled={importing} onClick={() => {setShowImportModal(false); setImportPreview([])}} style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: '#fff', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
              <button disabled={importing} onClick={executeImport} style={{ padding: '0.75rem 1.5rem', background: '#fff', color: '#000', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: importing ? 'wait' : 'pointer' }}>
                 {importing ? 'Importing...' : 'Confirm & Import Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#050505', border: '1px solid #333', padding: '2rem', width: '500px', borderRadius: '8px' }}>
            <h2 style={{ margin: '0 0 1rem 0' }}>WhatsApp Template</h2>
            <p style={{ color: '#888', fontSize: '0.85rem' }}>Broadcast this directly in your group chats.</p>
            
            <textarea 
              readOnly 
              onClick={e => (e.target as HTMLTextAreaElement).select()}
              value={`🥋 Certificates are ready!\n\nStudents who completed ${whatsappTemplateProgramName} can now download their digital certificate.\n\n👉 Steps to download:\n1. Visit skfkarate.org/athlete\n2. Search for your name or SKF ID\n3. Click your profile → View Certificate\n4. Download as PDF or PNG\n\nCongratulations to all! 🏆`}
              style={{ width: '100%', height: '250px', background: '#111', color: '#fff', border: '1px solid #333', padding: '1rem', borderRadius: '4px', resize: 'none', fontFamily: 'monospace', fontSize: '0.85rem', marginBottom: '1rem' }}
            />
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowWhatsAppModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: '#fff', border: '1px solid #333', borderRadius: '4px', cursor: 'pointer' }}>Close</button>
              <button onClick={() => {
                navigator.clipboard.writeText(`🥋 Certificates are ready!\n\nStudents who completed ${whatsappTemplateProgramName} can now download their digital certificate.\n\n👉 Steps to download:\n1. Visit skfkarate.org/athlete\n2. Search for your name or SKF ID\n3. Click your profile → View Certificate\n4. Download as PDF or PNG\n\nCongratulations to all! 🏆`)
                alert('Copied to clipboard!')
              }} style={{ padding: '0.75rem 1.5rem', background: '#25D366', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 600, cursor: 'pointer' }}>
                 Copy Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      <CertificateModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        enrollmentId={previewEnrollmentId}
        skfId={previewSkfId}
      />

    </div>
  )
}
