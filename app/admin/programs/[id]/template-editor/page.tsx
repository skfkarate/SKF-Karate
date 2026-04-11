'use client'

import { useState, useEffect } from 'react'
import { Save, Eye, UploadCloud, RotateCcw } from 'lucide-react'

// Mock initial field template
const initialFields = {
  recipientName: { label: 'Student Name', x: 50, y: 46, fontSize: 80, fontFamily: 'serif', color: '#c0392b', align: 'center' },
  courseName:    { label: 'Program', x: 50, y: 58, fontSize: 40, fontFamily: 'sans-serif', color: '#333333', align: 'center' },
  date:          { label: 'Date', x: 75, y: 82, fontSize: 24, fontFamily: 'sans-serif', color: '#555555', align: 'center' },
  issuerName:    { label: 'Issuer', x: 25, y: 82, fontSize: 30, fontFamily: 'cursive', color: '#111111', align: 'center' },
  skfId:         { label: 'SKF ID', x: 50, y: 92, fontSize: 20, fontFamily: 'sans-serif', color: '#888888', align: 'center' }
}

export default function TemplateEditorPage({ params }) {
  const [fields, setFields] = useState(initialFields)
  const [activeField, setActiveField] = useState('recipientName')
  const [isSaving, setIsSaving] = useState(false)
  const [backgroundUrl, setBackgroundUrl] = useState('')

  useEffect(() => {
    async function loadTemplate() {
      try {
        const res = await fetch(`/api/admin/programs/${params.id}/template`)
        const data = await res.json()
        if (data.template && data.template.text_configs) {
          setFields(data.template.text_configs)
          if (data.template.background_url) {
            setBackgroundUrl(data.template.background_url)
          }
        }
      } catch (e) {
        console.error("Failed to load template layout", e)
      }
    }
    loadTemplate()
  }, [params.id])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch(`/api/admin/programs/${params.id}/template`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          background_url: backgroundUrl || 'https://skfkarate.com/default-cert.png',
          text_configs: fields,
          width_px: 2480,
          height_px: 1754
        })
      })
      const data = await res.json()
      if (data.success) {
        alert('Template saved successfully!')
      } else {
        alert(data.error || 'Failed to save template. (Is DB Connected?)')
      }
    } catch (e) {
      alert('Error saving template')
    } finally {
      setIsSaving(false)
    }
  }

  // Normalization logic: canvas is 2480x1754, preview is e.g. 800px wide. Position is purely percentage based.
  const handleFieldChange = (key, val) => {
    setFields(prev => ({
      ...prev,
      [activeField]: { ...prev[activeField], [key]: val }
    }))
  }

  const renderPreviewText = (fieldKey) => {
    const field = fields[fieldKey]
    // Scale font size down for preview (assuming preview container is ~800px wide, real is 2480px)
    const previewScale = 800 / 2480
    
    return (
      <div 
        key={fieldKey}
        onClick={() => setActiveField(fieldKey)}
        style={{
          position: 'absolute',
          left: `${field.x}%`,
          top: `${field.y}%`,
          transform: `translate(${field.align === 'center' ? '-50%' : field.align === 'right' ? '-100%' : '0'}, -50%)`,
          fontSize: `${field.fontSize * previewScale}px`,
          fontFamily: field.fontFamily,
          color: field.color,
          textAlign: field.align,
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          border: activeField === fieldKey ? '1px dashed #ffb703' : '1px dashed transparent',
          padding: '2px 4px',
          background: activeField === fieldKey ? 'rgba(255, 183, 3, 0.1)' : 'transparent',
          transition: 'border 0.2s',
        }}
      >
        {`[{${field.label}}]`}
      </div>
    )
  }

  return (
    <div style={{ padding: '2rem', background: '#05080f', minHeight: '100vh', color: '#fff' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', fontFamily: 'var(--font-heading)', textTransform: 'uppercase', color: '#ffb703' }}>
              Template Editor
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Configure text placement over background template.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button style={{
              background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              <Eye size={18} /> Add QR Code
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              style={{
                background: 'linear-gradient(135deg, #d62828 0%, #c0392b 100%)', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: 8, fontWeight: 'bold', cursor: isSaving ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: isSaving ? 0.7 : 1
            }}>
              <Save size={18} /> {isSaving ? 'Saving...' : 'Save Layout'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
          
          {/* Main Visual Editor Area */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            
            <div style={{ alignSelf: 'flex-start' }}>
              <button style={{ background: 'rgba(255,183,3,0.1)', color: '#ffb703', border: '1px dashed #ffb703', padding: '0.5rem 1rem', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UploadCloud size={16} /> Upload Background Image (PNG)
              </button>
            </div>

            <div style={{
              position: 'relative',
              width: '100%',
              maxWidth: 800, // Preview reference width
              aspectRatio: '1.414',
              background: '#fff',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              borderRadius: 4
            }}>
              {/* Mock Template Graphic */}
              <div style={{ position: 'absolute', inset: '2rem', border: '2px solid rgba(0,0,0,0.1)' }} />
              {backgroundUrl && (
                 <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${backgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.5 }} />
              )}
              {!backgroundUrl && <div style={{ position: 'absolute', top: 0, left: '2rem', right: '2rem', height: '1rem', background: 'rgba(0,0,0,0.8)' }} />}
              
              {/* Draggable fields representation */}
              {Object.keys(fields).map(renderPreviewText)}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Click on a field to edit its properties.</p>
          </div>

          {/* Properties Sidebar */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '1.5rem', fontWeight: 600 }}>Field Properties</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
              {Object.keys(fields).map(key => (
                <button
                  key={key}
                  onClick={() => setActiveField(key)}
                  style={{
                    background: activeField === key ? 'rgba(214,40,40,0.2)' : 'transparent',
                    border: '1px solid',
                    borderColor: activeField === key ? '#d62828' : 'rgba(255,255,255,0.1)',
                    color: activeField === key ? '#fff' : 'rgba(255,255,255,0.6)',
                    padding: '0.75rem',
                    borderRadius: 8,
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {fields[key].label}
                </button>
              ))}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>X Position (%)</label>
                  <input 
                    type="number" 
                    value={fields[activeField].x} 
                    onChange={e => handleFieldChange('x', Number(e.target.value))}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.5rem', borderRadius: 4 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>Y Position (%)</label>
                  <input 
                    type="number" 
                    value={fields[activeField].y} 
                    onChange={e => handleFieldChange('y', Number(e.target.value))}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.5rem', borderRadius: 4 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>Font Size (px for 2480px width)</label>
                <input 
                  type="number" 
                  value={fields[activeField].fontSize} 
                  onChange={e => handleFieldChange('fontSize', Number(e.target.value))}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.5rem', borderRadius: 4 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>Color (Hex)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="color" 
                    value={fields[activeField].color} 
                    onChange={e => handleFieldChange('color', e.target.value)}
                    style={{ width: 40, height: 36, padding: 0, border: 'none', background: 'transparent' }}
                  />
                  <input 
                    type="text" 
                    value={fields[activeField].color} 
                    onChange={e => handleFieldChange('color', e.target.value)}
                    style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.5rem', borderRadius: 4 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>Alignment</label>
                <select 
                  value={fields[activeField].align} 
                  onChange={e => handleFieldChange('align', e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.5rem', borderRadius: 4 }}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.25rem' }}>Font Family</label>
                <select 
                  value={fields[activeField].fontFamily} 
                  onChange={e => handleFieldChange('fontFamily', e.target.value)}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '0.5rem', borderRadius: 4 }}
                >
                  <option value="sans-serif">Sans Serif</option>
                  <option value="serif">Serif</option>
                  <option value="cursive">Cursive / Signature</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                </select>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
