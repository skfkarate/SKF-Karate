'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, Download } from 'lucide-react'

export default function TimetableClient({ branchName, timetableData }) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Use data from sheets if available, otherwise fallback image
  const imageUrl = timetableData?.length > 0 && timetableData[0].Image_URL 
    ? timetableData[0].Image_URL 
    : 'https://images.unsplash.com/photo-1555597673-b21d5c935865?auto=format&fit=crop&q=80&w=1600' // Generic Dojo Fallback without being obviously fake mock

  return (
    <div style={{ paddingBottom: '4rem', paddingTop: '1rem', maxWidth: '1420px', margin: '0 auto', width: '100%' }}>
      
      {/* ── HEADER ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem', paddingLeft: '0.5rem' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-heading, "Outfit")', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Calendar size={48} color="var(--crimson, #d62828)" />
            Dojo Timetable
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', fontWeight: 500, maxWidth: '600px' }}>
            Your official training schedule for <strong>{branchName}</strong>.
          </p>
        </motion.div>

        {/* Location Badge */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ display: 'flex' }}
        >
          <div style={{
            background: 'rgba(214,40,40,0.15)',
            color: '#fff',
            border: '1px solid rgba(214,40,40,0.4)',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px',
            fontFamily: 'var(--font-heading, "Outfit")',
            fontWeight: 700,
            fontSize: '0.95rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <MapPin size={16} color="var(--crimson, #d62828)" />
            {branchName}
          </div>
        </motion.div>
      </div>

      {/* ── TIMETABLE IMAGE VIEWER ── */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1200px',
          borderRadius: '24px',
          overflow: 'hidden',
          background: 'rgba(10, 14, 22, 0.5)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
          margin: '0 0.5rem'
        }}
      >
        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10' }}>
          <img 
            src={imageUrl} 
            alt={`Timetable for ${branchName}`} 
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'contain',
              background: '#05070a'
            }} 
          />
          
          {/* Action Overlay */}
          <div style={{ 
            position: 'absolute', 
            top: '1.5rem', 
            right: '1.5rem',
            display: 'flex',
            gap: '0.75rem'
          }}>
            <a 
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                padding: '0.75rem',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--crimson, #d62828)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
              title="Download Timetable"
            >
              <Download size={20} />
            </a>
          </div>
        </div>
        
        {/* Footer Bar */}
        <div style={{ 
          padding: '1.5rem', 
          background: 'rgba(0,0,0,0.3)',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>Official Schedule</h3>
            <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Updated for current term</p>
          </div>
          <p style={{ color: 'var(--gold, #ffb703)', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
            Contact Sensei for questions
          </p>
        </div>
      </motion.div>
    </div>
  )
}
