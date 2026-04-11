"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  FaEdit,
  FaPlus,
  FaTrash,
} from "react-icons/fa"
import { TOURNAMENT_LEVEL_LABELS } from "@/lib/types/tournament"

export default function AdminResultsPageClient({ initialTournaments, canManage = false }) {
  const [tournaments, setTournaments] = useState(initialTournaments)
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [notification, setNotification] = useState("")

  const filtered = useMemo(() => {
    return tournaments.filter((tournament) => {
      const matchesSearch =
        !search ||
        tournament.name.toLowerCase().includes(search.toLowerCase())
      const matchesLevel =
        levelFilter === "all" || tournament.level === levelFilter

      return matchesSearch && matchesLevel
    })
  }, [levelFilter, search, tournaments])

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  function flash(message) {
    setNotification(message)
    window.setTimeout(() => setNotification(""), 3000)
  }

  async function updateTournament(id, patch, successMessage) {
    const response = await fetch(`/api/admin/results/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(patch),
    })

    const payload = await response.json()
    if (!response.ok) {
      throw new Error(payload.error || "Update failed")
    }

    setTournaments((previous) =>
      previous.map((tournament) =>
        tournament.id === id ? payload.tournament : tournament
      )
    )
    flash(successMessage)
  }

  async function togglePublished(id) {
    const tournament = tournaments.find((entry) => entry.id === id)
    if (!tournament) return
    try {
      await updateTournament(id, { isPublished: !tournament.isPublished }, "Visibility state updated")
    } catch (error) { flash(error.message) }
  }

  async function handleDelete(id) {
    try {
      const response = await fetch(`/api/admin/results/${id}`, { method: "DELETE" })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || "Delete failed")

      setTournaments((previous) => previous.filter((tournament) => tournament.id !== id))
      setDeleteTarget(null)
      flash("Record purged")
    } catch (error) { flash(error.message) }
  }

  const inputStyle = {
    flex: 1,
    background: '#000',
    border: '1px solid #222',
    color: '#fff',
    padding: '0.75rem 1rem',
    fontFamily: 'system-ui, sans-serif',
    outline: 'none',
    minWidth: 150,
    borderRadius: '4px'
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
        alignItems: 'flex-end',
        marginBottom: '2rem'
      }}>
        <div>
          <p style={{ color: '#666', fontSize: '0.8rem', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '1rem', textTransform: 'uppercase' }}>
            Database
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 400, margin: 0, letterSpacing: '-0.03em' }}>
            Tournament Records
          </h1>
        </div>
        {canManage && (
          <Link href="/admin/results/new" style={{
            background: '#111', color: '#fff', border: '1px solid #333', padding: '0.75rem 1.5rem',
            fontWeight: 500, textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
            borderRadius: '4px', transition: 'background 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.background = '#222'}
          onMouseOut={e => e.currentTarget.style.background = '#111'}>
            <FaPlus /> Disclose Record
          </Link>
        )}
      </div>

      <div style={{ padding: '0 2.5rem' }}>
        
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-end', marginBottom: '2rem', background: '#050505', border: '1px solid #111', padding: '1.5rem', borderRadius: '4px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Search</label>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Query events..." style={{ ...inputStyle, width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 500, color: '#666', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Level Filter</label>
            <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} style={inputStyle}>
              <option value="all">All Levels</option>
              {Object.entries(TOURNAMENT_LEVEL_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Database Table */}
        <div style={{ border: '1px solid #111', background: '#050505', borderRadius: '4px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ borderBottom: '1px solid #222' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 500, color: '#666', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Tournament</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 500, color: '#666', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Date & Location</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 500, color: '#666', letterSpacing: '0.05em', textTransform: 'uppercase' }}>SKF Cohort</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 500, color: '#666', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Visibility</th>
                <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 500, color: '#666', letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: '4rem', textAlign: 'center', color: '#666' }}>No records found.</td></tr>
              ) : (
                filtered.map((t, i) => (
                  <tr key={t.id} style={{ borderBottom: i !== filtered.length - 1 ? '1px solid #111' : 'none' }}>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ fontWeight: 500, color: '#fff', fontSize: '0.95rem' }}>{t.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                        {TOURNAMENT_LEVEL_LABELS[t.level]} — {t.slug}
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', color: '#ccc', fontSize: '0.85rem' }}>
                      <div>{formatDate(t.date)}</div>
                      <div style={{ color: '#666', marginTop: '0.2rem' }}>{t.venue}, {t.city}</div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <div style={{ color: '#fff', fontWeight: 500 }}>{t.skfParticipants} Athletes</div>
                      <div style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.2rem' }}>
                        {t.medals.gold}G · {t.medals.silver}S · {t.medals.bronze}B
                      </div>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem' }}>
                      <span style={{ 
                        padding: '0.2rem 0.6rem', 
                        fontSize: '0.7rem', 
                        border: `1px solid ${t.isPublished ? '#333' : '#222'}`, 
                        color: t.isPublished ? '#fff' : '#666',
                        background: t.isPublished ? 'rgba(255,255,255,0.1)' : 'transparent',
                        borderRadius: '4px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                      }}>
                        {t.isPublished ? 'Public' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        {canManage ? (
                          <>
                            <Link href={`/admin/results/${t.id}/edit`} style={{ color: '#fff', border: '1px solid #333', padding: '0.4rem 0.6rem', borderRadius: '4px', textDecoration: 'none', background: '#111' }}><FaEdit size={14} /></Link>
                            <button onClick={() => togglePublished(t.id)} style={{ color: t.isPublished ? '#fff' : '#666', border: '1px solid #333', padding: '0.4rem 0.6rem', borderRadius: '4px', background: '#111', cursor: 'pointer', fontFamily: 'system-ui, sans-serif', fontSize: '0.75rem', fontWeight: 500 }}>
                              {t.isPublished ? 'Hide' : 'Publish'}
                            </button>
                            <button onClick={() => setDeleteTarget(t)} style={{ color: '#ff003c', border: '1px solid #ff003c', padding: '0.4rem 0.6rem', borderRadius: '4px', background: 'transparent', cursor: 'pointer' }}>
                              <FaTrash size={14} />
                            </button>
                          </>
                        ) : (
                          <span style={{ color: '#666', fontSize: '0.8rem' }}>Read Only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteTarget && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#050505', border: '1px solid #333', padding: '2.5rem', maxWidth: 400, borderRadius: '8px' }}>
            <h3 style={{ color: '#fff', marginTop: 0, fontWeight: 400, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>Confirm Deletion</h3>
            <p style={{ color: '#888', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '2rem' }}>
              Are you sure you want to permanently delete "{deleteTarget.name}"?
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteTarget(null)} style={{ background: 'transparent', color: '#ccc', border: '1px solid #333', padding: '0.75rem 1.5rem', cursor: 'pointer', borderRadius: '4px', fontWeight: 500, fontFamily: 'system-ui, sans-serif' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteTarget.id)} style={{ background: '#ff003c', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', fontWeight: 500, cursor: 'pointer', borderRadius: '4px', fontFamily: 'system-ui, sans-serif' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
