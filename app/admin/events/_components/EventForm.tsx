'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { allDojos } from '@/data/seed/dojos'

export default function EventForm({ initialData, isEdit = false }: { initialData?: any, isEdit?: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<string[]>([])
  const [newCategoryStr, setNewCategoryStr] = useState('')
  const [isAddingCategory, setIsAddingCategory] = useState(false)

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    type: initialData?.type || 'seminar',
    hostingBranch: initialData?.hostingBranch || '',
    status: initialData?.status || 'upcoming',
    date: initialData?.date || '',
    venue: initialData?.venue || '',
    city: initialData?.city || '',
    state: initialData?.state || 'Karnataka',
    description: initialData?.description || '',
    isPublished: initialData?.isPublished ?? false,
    isFeatured: initialData?.isFeatured ?? false,
    isResultsPublished: initialData?.isResultsPublished ?? false
  })

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories) setCategories(data.categories)
      })
  }, [])

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleCreateCategory = async () => {
    if (!newCategoryStr.trim()) return
    setIsAddingCategory(true)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategoryStr })
      })
      if (res.ok) {
        const data = await res.json()
        setCategories(data.categories)
        setFormData(prev => ({ ...prev, type: newCategoryStr.toLowerCase().replace(/\s+/g, '-') }))
        setNewCategoryStr('')
      }
    } catch(e) {
      console.error(e)
    } finally {
      setIsAddingCategory(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = isEdit ? `/api/admin/events/${initialData.id}` : '/api/admin/events'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        // If it's a new event, we usually redirect back to list.
        // If editing, we might want to stay on the page. But for consistency:
        router.push('/admin/events')
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Something went wrong')
      }
    } catch (error) {
      console.error(error)
      alert('Failed to save event')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#111',
    border: '1px solid #333',
    color: '#fff',
    borderRadius: '4px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    marginTop: '0.5rem'
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px' }}>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label style={{ fontSize: '0.85rem', color: '#888' }}>Event Name *</label>
          <input required name="name" value={formData.name} onChange={handleChange} style={inputStyle} placeholder="e.g. Summer Camp 2026" />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem', color: '#888' }}>URL Slug</label>
          <input name="slug" value={formData.slug} onChange={handleChange} style={inputStyle} placeholder="e.g. summer-camp-2026 (auto-generated if empty)" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label style={{ fontSize: '0.85rem', color: '#888' }}>Event Category (Type) *</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <select required name="type" value={formData.type} onChange={handleChange} style={{...inputStyle, WebkitAppearance: 'none', flex: 1}}>
              {categories.map(c => (
                <option key={c} value={c}>{c.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', marginTop: '0.5rem', gap: '0.5rem' }}>
            <input 
              value={newCategoryStr} 
              onChange={e => setNewCategoryStr(e.target.value)} 
              style={{ ...inputStyle, padding: '0.4rem', marginTop: 0, fontSize: '0.8rem', flex: 1 }} 
              placeholder="Custom category..." 
            />
            <button 
              type="button" 
              onClick={handleCreateCategory} 
              disabled={isAddingCategory || !newCategoryStr}
              style={{ background: '#333', color: '#fff', border: 'none', padding: '0 0.5rem', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer' }}
            >
              Add
            </button>
          </div>
        </div>
        <div>
          <label style={{ fontSize: '0.85rem', color: '#888' }}>Hosting Branch</label>
          <select name="hostingBranch" value={formData.hostingBranch} onChange={handleChange} style={{...inputStyle, WebkitAppearance: 'none'}}>
            <option value="">-- Central/Global --</option>
            {allDojos.map(dojo => (
              <option key={dojo.id} value={dojo.name}>{dojo.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.85rem', color: '#888' }}>Date *</label>
          <input required type="date" name="date" value={formData.date} onChange={handleChange} style={inputStyle} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div>
          <label style={{ fontSize: '0.85rem', color: '#888' }}>Venue</label>
          <input name="venue" value={formData.venue} onChange={handleChange} style={inputStyle} placeholder="e.g. SKF Headquarters" />
        </div>
        <div>
          <label style={{ fontSize: '0.85rem', color: '#888' }}>City</label>
          <input name="city" value={formData.city} onChange={handleChange} style={inputStyle} placeholder="e.g. Bengaluru" />
        </div>
      </div>

      <div>
        <label style={{ fontSize: '0.85rem', color: '#888' }}>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} style={{...inputStyle, minHeight: '120px', resize: 'vertical'}} placeholder="Event details..." />
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', padding: '1.2rem', background: '#050505', border: '1px solid #1a1a1a', borderRadius: '4px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: '#ccc' }}>
          <input type="checkbox" name="isPublished" checked={formData.isPublished} onChange={handleChange} style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }} />
          Publish Event publicly
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: '#ccc' }}>
          <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }} />
          Feature on Homepage
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', fontSize: '0.9rem', color: '#10b981' }}>
          <input type="checkbox" name="isResultsPublished" checked={formData.isResultsPublished} onChange={handleChange} style={{ width: '1.1rem', height: '1.1rem', cursor: 'pointer' }} />
          Show Results & Participants Publicly
        </label>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid #1a1a1a', paddingTop: '2rem' }}>
        <button type="submit" disabled={loading} style={{
          background: '#fff', color: '#000', border: 'none', padding: '0.8rem 2rem', fontWeight: 600, borderRadius: '4px', cursor: loading ? 'wait' : 'pointer'
        }}>
          {loading ? 'Saving...' : 'Save Core Details'}
        </button>
        <Link href="/admin/events" style={{
          background: 'transparent', color: '#fff', border: '1px solid #333', padding: '0.8rem 2rem', fontWeight: 500, borderRadius: '4px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center'
        }}>
          Back
        </Link>
      </div>
    </form>
  )
}
