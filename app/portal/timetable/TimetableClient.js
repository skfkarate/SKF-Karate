'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, MapPin, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react'
import SecureContentWrapper from '@/app/_components/portal/SecureContentWrapper'
import { useNonce } from '@/components/NonceProvider'

export default function TimetableClient({ branchName, timetableData }) {
  const nonce = useNonce()
  const imageUrl = timetableData?.imageUrl || timetableData?.driveUrl || ''
  const hasTimetableImage = Boolean(imageUrl)
  const monthLabel = timetableData?.monthLabel || 'Current Term'
  const notes = timetableData?.notes || ''

  const [isZoomed, setIsZoomed] = useState(false)

  return (
    <SecureContentWrapper>
      <div style={{ paddingBottom: '6rem', width: '100%', minHeight: '100dvh', position: 'relative', overflow: 'hidden' }}>
        
        {/* ── BACKGROUND GLOWS ── */}
        <div style={{ position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '500px', background: 'radial-gradient(ellipse at top, rgba(214,40,40,0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: '20%', left: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(255,183,3,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', position: 'relative', zIndex: 10 }}>
          
          {/* ── PREMIUM HEADER ── */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            style={{ textAlign: 'center', padding: '5rem 1rem 3rem 1rem' }}
          >

            <h1 style={{ 
              fontFamily: 'var(--font-heading, "Outfit")', fontSize: 'clamp(3rem, 7vw, 4.5rem)', 
              fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: '1rem',
              background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.4) 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              textShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              Dojo Timetable
            </h1>
            
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(1rem, 2vw, 1.15rem)', fontWeight: 500, maxWidth: '600px', margin: '0 auto 2rem auto', lineHeight: 1.6 }}>
              The master training schedule for <strong>{branchName}</strong>. Check back regularly for updates to your class times.
            </p>

            {/* Meta Info Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <MapPin size={18} color="rgba(255,255,255,0.5)" />
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{branchName} Dojo</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)', padding: '0.75rem 1.25rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Calendar size={18} color="rgba(255,255,255,0.5)" />
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{monthLabel}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(76,175,80,0.1)', padding: '0.75rem 1.25rem', borderRadius: '16px', border: '1px solid rgba(76,175,80,0.2)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4caf50', boxShadow: '0 0 10px #4caf50' }} />
                <span style={{ color: '#4caf50', fontWeight: 700, fontSize: '0.95rem' }}>Active</span>
              </div>
            </div>
          </motion.div>

          {/* ── ALERTS / NOTES ── */}
          {notes && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}
              style={{ margin: '0 1.5rem 2rem 1.5rem' }}
            >
              <div style={{ 
                background: 'linear-gradient(90deg, rgba(214,40,40,0.15) 0%, rgba(214,40,40,0.02) 100%)', 
                borderLeft: '4px solid var(--crimson, #d62828)',
                borderRadius: '0 16px 16px 0', 
                padding: '1.25rem 1.5rem',
                display: 'flex', gap: '1rem', alignItems: 'flex-start'
              }}>
                <AlertCircle size={20} color="var(--crimson, #d62828)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
                <div>
                  <h4 style={{ color: '#fff', margin: '0 0 0.25rem 0', fontSize: '0.95rem', fontWeight: 700 }}>Important Notice</h4>
                  <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.6 }}>{notes}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── TIMETABLE VIEWER ── */}
          {hasTimetableImage ? (
            <motion.div 
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="timetable-viewer-wrapper"
            >
            {/* Action Bar */}
            <div style={{ 
              display: 'flex', justifyContent: 'flex-end', alignItems: 'center', 
              padding: '1.25rem', background: 'rgba(10,14,22,0.8)', backdropFilter: 'blur(20px)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              borderTopLeftRadius: '24px', borderTopRightRadius: '24px',
              flexWrap: 'wrap', gap: '1rem'
            }}>
              <button 
                onClick={() => setIsZoomed(!isZoomed)}
                style={{ 
                  background: isZoomed ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)', 
                  border: '1px solid rgba(255,255,255,0.1)', color: '#fff', 
                  padding: '0.6rem 1rem', borderRadius: '12px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontWeight: 600,
                  transition: 'all 0.2s'
                }}
              >
                {isZoomed ? <ZoomOut size={16} /> : <ZoomIn size={16} />}
                {isZoomed ? 'Zoom Out' : 'Tap to Zoom'}
              </button>
            </div>

            {/* The Image Container */}
            <div style={{ 
              position: 'relative', width: '100%', 
              background: 'radial-gradient(circle at center, rgba(255,255,255,0.03) 0%, #05080c 100%)',
              padding: '0',
              transition: 'all 0.4s ease',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              overflowX: isZoomed ? 'auto' : 'hidden', // Allows horizontal scrolling when zoomed
              overflowY: 'hidden'
            }}>
              
              <div style={{ 
                position: 'relative', 
                width: isZoomed ? '200%' : '100%', // Expand significantly when zoomed
                minWidth: isZoomed ? '1000px' : 'auto', // Ensure minimum readability size
                transition: 'width 0.4s ease, min-width 0.4s ease',
                borderRadius: '0',
                overflow: 'hidden',
                boxShadow: isZoomed ? 'none' : '0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)'
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- Timetable URLs can be branch-configured external assets. */}
	                <img
	                  src={imageUrl}
	                  alt="Timetable Schedule"
	                  loading="lazy"
	                  decoding="async"
	                  style={{ 
                    width: '100%', height: 'auto', display: 'block', 
                    background: 'rgba(5,5,5,0.5)', pointerEvents: 'none' 
                  }}
                  draggable={false}
                />
              </div>

            </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{
                margin: '0 1rem',
                borderRadius: 24,
                border: '1px solid rgba(255,255,255,0.08)',
                background: 'rgba(10,14,22,0.58)',
                padding: '4rem 2rem',
                textAlign: 'center',
              }}
            >
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
                <Calendar size={34} color="rgba(255,255,255,0.38)" />
              </div>
              <h2 style={{ color: '#fff', fontFamily: 'var(--font-heading, "Outfit")', fontSize: '1.8rem', margin: '0 0 0.75rem' }}>
                No timetable configured
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', maxWidth: 460, margin: '0 auto', lineHeight: 1.6 }}>
                Your branch timetable will appear here once the admin team publishes an active schedule for {branchName}.
              </p>
            </motion.div>
          )}

        </div>

        <style nonce={nonce} dangerouslySetInnerHTML={{__html: `
          .timetable-viewer-wrapper {
            margin: 0;
            border-radius: 24px;
            overflow: hidden;
            background: rgba(10,14,22,0.4);
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 40px 100px rgba(0,0,0,0.5);
          }
          
          /* Extremely specific mobile optimizations */
          @media (max-width: 768px) {
            .timetable-viewer-wrapper {
              margin: 0; /* Remove side margins on mobile to maximize space */
              border-radius: 0; /* Full bleed edge-to-edge */
              border-left: none;
              border-right: none;
            }
            .timetable-viewer-wrapper > div:last-child {
              padding: 0 !important; /* Zero padding around image on mobile */
            }
            .timetable-viewer-wrapper > div:last-child > div {
              border-radius: 0 !important; /* Full bleed image */
              box-shadow: none !important;
              border: none !important;
            }
          }
        `}} />
      </div>
    </SecureContentWrapper>
  )
}
