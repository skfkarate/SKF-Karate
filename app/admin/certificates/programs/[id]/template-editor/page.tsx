'use client'

import { useState, useRef, useEffect, MouseEvent as ReactMouseEvent } from 'react'
import { useParams, useRouter } from 'next/navigation'

const CERTIFICATE_FONTS = [
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Garamond',
  'Palatino',
  'Baskerville',
  'Courier New',
  'Arial',
  'Verdana',
  'Trebuchet MS',
  'Impact',
  'Lucida Console',
  'serif',
  'sans-serif',
  'monospace'
]

interface FieldConfig {
  id: string
  label: string
  value: string
  x: number // percentage
  y: number // percentage
  fontSize: number // based on 1240px
  fontFamily: string
  color: string
  align: 'left' | 'center' | 'right'
  bold: boolean
}

const AVAILABLE_FIELDS = [
  { id: 'student_name', label: 'student_name', sample: 'John Karateka' },
  { id: 'skf_id', label: 'skf_id', sample: 'SKF20410001' },
  { id: 'belt_level', label: 'belt_level', sample: 'Yellow Belt' },
  { id: 'completion_date', label: 'completion_date', sample: 'October 15, 2026' },
  { id: 'issuer_name', label: 'issuer_name', sample: 'Chief Instructor Sensei' },
  { id: 'program_name', label: 'program_name', sample: 'Summer Camp 2026' }
]

const BELT_TABS = ['White', 'Yellow', 'Orange', 'Green', 'Blue', 'Purple', 'Brown', 'Black']

export default function TemplateEditor() {
  const { id: programId } = useParams()
  const router = useRouter()
  
  const [templateImageUrl, setTemplateImageUrl] = useState('')
  const [useQrCode, setUseQrCode] = useState(false)
  const [fields, setFields] = useState<FieldConfig[]>([])
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null)
  
  // Belt tabs context
  const [isBeltExam, setIsBeltExam] = useState(false)
  const [currentBeltTab, setCurrentBeltTab] = useState('White')
  
  // Mouse Dragging State
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<{ id: string, startX: number, startY: number, startLeft: number, startTop: number } | null>(null)
  
  const [saving, setSaving] = useState(false)

  // Initialization fetch mock-like structure
  useEffect(() => {
    // In a real flow, we'd fetch program details to know if it's a belt_exam.
    // We'll fetch current templates to hydrate state.
    const load = async () => {
      const res = await fetch(`/api/admin/certificates/templates?programId=${programId}`)
      const data = await res.json()
      if (data.templates && data.templates.length > 0) {
         const t = data.templates[0] // just grab first to see if belt_exam exists
         setIsBeltExam(t.belt_level !== null)
         setTemplateImageUrl(t.template_image_url || '')
         setFields(t.fields || [])
         setUseQrCode(t.use_qr_code || false)
         if (t.belt_level) setCurrentBeltTab(t.belt_level)
      } else {
         // Need to fetch program to check if belt_exam
         const pRes = await fetch(`/api/admin/certificates/programs`)
         const pData = await pRes.json()
         const program = pData.programs?.find((p: any) => p.id === programId)
         if (program?.type === 'belt_exam') setIsBeltExam(true)
      }
    }
    load()
  }, [programId])

  const addField = (fieldBase: any) => {
    if (fields.find(f => f.label === fieldBase.label)) return
    setFields([...fields, {
      id: fieldBase.id,
      label: fieldBase.label,
      value: fieldBase.sample,
      x: 50,
      y: 50,
      fontSize: 32,
      fontFamily: 'Helvetica',
      color: '#000000',
      align: 'center',
      bold: true
    }])
    setActiveFieldId(fieldBase.id)
  }

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id))
    if (activeFieldId === id) setActiveFieldId(null)
  }

  const activeField = fields.find(f => f.id === activeFieldId)

  const updateActiveField = (updates: Partial<FieldConfig>) => {
    if (!activeFieldId) return
    setFields(fields.map(f => f.id === activeFieldId ? { ...f, ...updates } : f))
  }

  // Pointer Dragging Mechanics
  const handlePointerDown = (e: ReactMouseEvent, id: string) => {
    e.stopPropagation()
    setActiveFieldId(id)
    if (!containerRef.current) return
    setIsDragging(true)
    
    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: fields.find(f => f.id === id)?.x || 0,
      startTop: fields.find(f => f.id === id)?.y || 0
    }
    
    // Attach window listeners to ensure drag continues even if pointer leaves element
    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
  }

  const handlePointerMove = (e: PointerEvent) => {
    if (!dragRef.current || !containerRef.current) return
    
    const containerRect = containerRef.current.getBoundingClientRect()
    
    // Calculate raw pixel diff
    const dx = e.clientX - dragRef.current.startX
    const dy = e.clientY - dragRef.current.startY
    
    // Convert to percentage relative to container size (which is clamped exactly matching image aspect ratio)
    const pxDiff = (dx / containerRect.width) * 100
    const pyDiff = (dy / containerRect.height) * 100
    
    let newX = dragRef.current.startLeft + pxDiff
    let newY = dragRef.current.startTop + pyDiff

    // Clamp boundaries
    newX = Math.max(0, Math.min(100, newX))
    newY = Math.max(0, Math.min(100, newY))

    setFields(prev => prev.map(f => f.id === dragRef.current!.id ? { ...f, x: newX, y: newY } : f))
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    dragRef.current = null
    window.removeEventListener('pointermove', handlePointerMove)
    window.removeEventListener('pointerup', handlePointerUp)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/certificates/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          programId,
          beltLevel: isBeltExam ? currentBeltTab : null,
          templateImageUrl,
          fields,
          useQrCode
        })
      })
      if (!res.ok) throw new Error('Failed to save template')
      alert('Template configuration saved successfully!')
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      
      {/* LEFT PANEL */}
      <div style={{ width: '30%', minWidth: '350px', background: '#050505', borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #1a1a1a' }}>
          <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 500 }}>Template Configuration</h2>
          <label style={{ fontSize: '0.8rem', color: '#888' }}>Background Image URL</label>
          <input 
            type="text" 
            placeholder="https://..." 
            value={templateImageUrl}
            onChange={e => setTemplateImageUrl(e.target.value)}
            style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', background: '#111', color: '#fff', border: '1px solid #333', borderRadius: '4px' }}
          />
        </div>

        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          <h3 style={{ fontSize: '0.85rem', color: '#888', textTransform: 'uppercase', marginBottom: '1rem' }}>Available Fields</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
            {AVAILABLE_FIELDS.map(fb => {
              const isActive = fields.some(f => f.label === fb.label)
              return (
                <label key={fb.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', background: isActive ? 'rgba(255,255,255,0.05)' : 'transparent', padding: '0.5rem', borderRadius: '4px' }}>
                  <input 
                    type="checkbox" 
                    checked={isActive} 
                    onChange={(e) => {
                      if (e.target.checked) addField(fb)
                      else removeField(fb.id)
                    }} 
                  />
                  <span style={{ fontSize: '0.9rem' }}>{fb.label}</span>
                </label>
              )
            })}
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginTop: '1rem' }}>
               <input type="checkbox" checked={useQrCode} onChange={e => setUseQrCode(e.target.checked)} />
               <span style={{ fontSize: '0.9rem', color: 'var(--gold, #f39c12)' }}>Enable Verification QR Code</span>
            </label>
          </div>

          {activeField && (
            <div style={{ background: '#111', border: '1px solid #222', padding: '1rem', borderRadius: '8px' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: 'var(--gold, #f39c12)', fontSize: '0.9rem' }}>Field Setup: {activeField.label}</h4>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#888' }}>Color (Hex)</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <input type="color" value={activeField.color} onChange={e => updateActiveField({ color: e.target.value })} style={{ width: '40px', height: '30px', padding: 0, border: 'none', background: 'transparent' }} />
                  <input type="text" value={activeField.color} onChange={e => updateActiveField({ color: e.target.value })} style={{ flex: 1, background: '#000', border: '1px solid #333', color: '#fff', padding: '4px 8px' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                 <label style={{ fontSize: '0.75rem', color: '#888' }}>Font Size</label>
                 <input type="range" min="10" max="120" value={activeField.fontSize} onChange={e => updateActiveField({ fontSize: Number(e.target.value) })} style={{ width: '100%', marginTop: '0.25rem' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <input type="checkbox" checked={activeField.bold} onChange={e => updateActiveField({ bold: e.target.checked })} /> Bold
                </label>
                <select value={activeField.align} onChange={e => updateActiveField({ align: e.target.value as any })} style={{ background: '#000', color: '#fff', border: '1px solid #333', padding: '2px 4px' }}>
                  <option value="left">Left Align</option>
                  <option value="center">Center</option>
                  <option value="right">Right Align</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', color: '#888' }}>Font Family</label>
                <select 
                  value={activeField.fontFamily} 
                  onChange={e => updateActiveField({ fontFamily: e.target.value })}
                  style={{ width: '100%', marginTop: '0.25rem', background: '#000', color: '#fff', border: '1px solid #333', padding: '6px 8px', borderRadius: '4px', fontSize: '0.85rem' }}
                >
                  {CERTIFICATE_FONTS.map(f => (
                    <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: '1.5rem', borderTop: '1px solid #1a1a1a' }}>
           <button 
             onClick={handleSave} 
             disabled={saving || !templateImageUrl}
             style={{ width: '100%', background: '#fff', color: '#000', border: 'none', padding: '1rem', fontWeight: 600, borderRadius: '4px', cursor: saving || !templateImageUrl ? 'not-allowed' : 'pointer' }}
           >
             {saving ? 'Saving Layout...' : 'Save Template Pipeline'}
           </button>
        </div>
      </div>

      {/* RIGHT PANEL - Canvas Editor */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#000', overflow: 'hidden' }}>
        
        {/* Top Header & Belt Tabs */}
        <div style={{ padding: '1rem 2rem', background: '#050505', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.85rem', color: '#888' }}>Engine Builder ({fields.length} active mappings)</span>
          {isBeltExam && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {BELT_TABS.map(belt => (
                <button
                  key={belt}
                  onClick={() => setCurrentBeltTab(belt)}
                  style={{
                    background: currentBeltTab === belt ? '#333' : 'transparent',
                    color: '#fff', border: '1px solid #333', padding: '4px 12px', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer'
                  }}
                >{belt}</button>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Canvas Container */}
        <div style={{ flex: 1, padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'auto' }}>
          <div style={{ 
            width: '800px', 
            height: '565px', // 800 * (1754/2480) aspect ratio matches A4 Landscape
            background: templateImageUrl ? `url('${templateImageUrl}') center/cover` : '#111',
            border: `2px solid ${isBeltExam ? 'var(--gold, #f39c12)' : '#333'}`,
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            userSelect: 'none'
          }} ref={containerRef}>
            
            {/* Draggable Overlays */}
            {fields.map(f => (
              <div
                key={f.id}
                onPointerDown={(e) => handlePointerDown(e, f.id)}
                style={{
                  position: 'absolute',
                  left: `${f.x}%`,
                  top: `${f.y}%`,
                  transform: 'translate(-50%, -50%)', // Center anchor
                  cursor: isDragging ? 'grabbing' : 'grab',
                  border: activeFieldId === f.id ? '1px dashed #fff' : '2px solid transparent',
                  padding: '4px 8px',
                  background: activeFieldId === f.id ? 'rgba(0,0,0,0.5)' : 'transparent',
                  whiteSpace: 'nowrap',
                  
                  // Visual scaling to mimic PDF view
                  // Original fontSize is mapped to 1240px bounds. 
                  // Because container is 800px wide, the visual ratio is (f.fontSize * (800 / 1240))
                   fontSize: `${f.fontSize * (800 / 1240)}px`,
                  fontFamily: f.fontFamily,
                  color: f.color,
                  fontWeight: f.bold ? 'bold' : 'normal',
                  textAlign: f.align
                }}
              >
                {f.value}
              </div>
            ))}

            {useQrCode && (
              <div style={{
                position: 'absolute',
                right: '40px', // approximate margins scaling
                bottom: '40px',
                width: '80px',
                height: '80px',
                background: '#fff',
                border: '4px solid #000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.5rem', color: '#000', fontWeight: 'bold'
              }}>QR</div>
            )}
            
            {!templateImageUrl && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#666' }}>
                Provide Background Image URL to initialize grid.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
