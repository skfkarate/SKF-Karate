'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Medal, Award, Star, X, Info } from 'lucide-react'
import { useNonce } from '@/components/NonceProvider'

// Local helper to map the belt colour strings to actual hexes
const getHexColor = (beltStr: string) => {
  if (!beltStr) return '#ffffff'
  const normalized = beltStr.toLowerCase()
  if (normalized.includes('white')) return '#F5F5F5'
  if (normalized.includes('yellow')) return '#FFD700'
  if (normalized.includes('orange')) return '#FF8C00'
  if (normalized.includes('green')) return '#228B22'
  if (normalized.includes('blue')) return '#1E90FF'
  if (normalized.includes('purple')) return '#8B008B'
  if (normalized.includes('brown')) return '#8B4513'
  if (normalized.includes('black')) return '#444444' 
  return '#ffffff'
}

export type TimelineNode = {
  id: string
  type: 'origin' | 'belt' | 'event'
  date: string
  title: string
  description: string
  isCurrent: boolean
  isUpcoming: boolean
  timestamp: number
  beltColor?: string
  eventType?: string
}

export default function JourneyClient({ timelineNodes }: { timelineNodes: TimelineNode[] }) {
  const nonce = useNonce()
  const [selectedNode, setSelectedNode] = useState<TimelineNode | null>(null)
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Scroll to the current node (pinpoint the current journey stage) after animations settle
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const currentEl = containerRef.current.querySelector('[data-current="true"]')
        if (currentEl) {
          currentEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Set up portal root for modal — escapes the CSS transform context from .hub-main__page
  // which has `animation: content-arrive` applying transform: translateY(0), breaking position:fixed
  useEffect(() => {
    setPortalRoot(document.body)
  }, [])

  // Reverse nodes so that the origin (first event) is at the BOTTOM of the rendered list
  // Assuming timelineNodes passed here is sorted newest to oldest (top to bottom).
  // We want newest at the top, oldest at the bottom. The array should be ordered latest first.
  const displayNodes = [...timelineNodes]

  return (
    <div ref={containerRef} style={{ padding: '2rem 1rem 6rem 1rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      
      {/* ── HEADER ── */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ paddingTop: '3rem', marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-heading, "Outfit")', fontSize: 'clamp(3rem, 7vw, 4.5rem)',
          fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 0.5rem 0',
          background: 'linear-gradient(180deg, #FFFFFF 0%, rgba(255, 255, 255, 0.4) 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          My Journey
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem', margin: '0 auto', maxWidth: '600px', fontWeight: 500 }}>
          Your martial arts path forged through discipline. Scroll down to see where you started.
        </p>
      </motion.div>

      {/* ── THE WINDING PATH TIMELINE ── */}
      <div className="journey-timeline" style={{ position: 'relative', width: '100%', padding: '2rem 0' }}>
        

        {/* The central winding dashed line SVG (Desktop Only) */}
        <div className="timeline-line-desktop" style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '2px', zIndex: 0 }}>
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: '-50px', width: '100px', height: '100%', overflow: 'visible' }}>
              <path 
                d={`M 50 0 Q 150 150 50 300 T 50 600 T 50 900 T 50 1200 T 50 1500 T 50 1800 T 50 2100 T 50 2400 T 50 2700 T 50 3000 T 50 3300 T 50 3600`}
                fill="transparent" 
                stroke="rgba(255, 255, 255, 0.15)" 
                strokeWidth="5" 
                strokeDasharray="12 12" 
             />
          </svg>
        </div>

        {/* Wavy dashed line SVG (Mobile Only) */}
        <div className="timeline-line-mobile" style={{ display: 'none', position: 'absolute', top: 0, bottom: 0, left: 0, width: '40px', zIndex: 0 }}>
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '100%', overflow: 'visible' }}>
             <path 
                d={`M 20 0 Q 40 150 20 300 T 20 600 T 20 900 T 20 1200 T 20 1500 T 20 1800 T 20 2100 T 20 2400 T 20 2700 T 20 3000 T 20 3300 T 20 3600`}
                fill="transparent" 
                stroke="rgba(255, 255, 255, 0.15)" 
                strokeWidth="5" 
                strokeDasharray="10 10" 
             />
          </svg>
        </div>

        {displayNodes.map((node, idx) => {
          const isOrigin = node.type === 'origin'
          const isBelt = node.type === 'belt'
          const isEvent = node.type === 'event'
          const isCurrent = node.isCurrent
          const isUpcoming = node.isUpcoming
          const nodeColor = isBelt ? getHexColor(node.beltColor) : isEvent ? '#43aa8b' : 'var(--gold, #ffb703)'
          
          // Alternate left and right
          const isLeft = idx % 2 === 0

          return (
            <motion.div
              key={node.id + idx}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className={`timeline-node-container ${isLeft ? 'node-left' : 'node-right'}`}
              data-current={isCurrent ? 'true' : undefined}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isLeft ? 'flex-start' : 'flex-end',
                marginBottom: '4rem',
                position: 'relative',
                zIndex: 10
              }}
            >
              {/* Wrapper — inline width:50% ensures alternating layout even if <style> is slow */}
              <div
                className="timeline-node-wrapper"
                style={{
                  width: '50%',
                  display: 'flex',
                  position: 'relative',
                  justifyContent: isLeft ? 'flex-end' : 'flex-start',
                  paddingRight: isLeft ? '3.5rem' : undefined,
                  paddingLeft: isLeft ? undefined : '3.5rem',
                }}
              >
                
                {/* The Interactive Node Circle */}
                <div 
                  className="timeline-node-icon"
                  onClick={() => setSelectedNode(node)}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    ...(isLeft ? { right: -24 } : { left: -24 }),
                    background: isUpcoming ? '#111' : 'linear-gradient(135deg, #222, #111)',
                    border: isUpcoming ? `3px dashed rgba(255,255,255,0.4)` : `4px solid ${nodeColor}`,
                    boxShadow: isCurrent ? `0 0 30px ${nodeColor}, inset 0 0 10px ${nodeColor}` : isUpcoming ? 'none' : `0 0 15px ${nodeColor}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', zIndex: 20, transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(-50%) scale(1)'}
                >
                  {isOrigin && <Star size={20} color="var(--gold, #ffb703)" />}
                  {isBelt && <Award size={20} color={nodeColor} />}
                  {isEvent && <Medal size={20} color={nodeColor} />}
                </div>

                {/* The Node Card - Liquid Glass Style */}
                <div 
                  className="timeline-node-card"
                  onClick={() => setSelectedNode(node)}
                  style={{
                    borderRadius: 24,
                    padding: '1.75rem 1.5rem',
                    width: '100%',
                    maxWidth: 400,
                    background: isBelt ? `linear-gradient(135deg, ${nodeColor}15, rgba(255,255,255,0.02))` : isCurrent ? 'linear-gradient(135deg, rgba(255,183,3,0.15), rgba(255,183,3,0.02))' : isUpcoming ? 'rgba(255,255,255,0.01)' : 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))',
                    border: isBelt ? `1px solid ${nodeColor}30` : isUpcoming ? '1px dashed rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.1)',
                    borderTop: isBelt ? `1px solid ${nodeColor}60` : isUpcoming ? '1px dashed rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.25)',
                    borderLeft: isBelt ? `1px solid ${nodeColor}40` : isUpcoming ? '1px dashed rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.2)',
                    boxShadow: isCurrent ? '0 15px 35px rgba(255,183,3,0.15), inset 0 0 20px rgba(255,183,3,0.05)' : isBelt ? `0 15px 35px rgba(0,0,0,0.4), inset 0 0 20px ${nodeColor}20` : '0 15px 35px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,255,255,0.03)',
                    cursor: 'pointer', backdropFilter: 'blur(20px) saturate(150%)', WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                    transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = isCurrent ? '0 25px 45px rgba(255,183,3,0.2), inset 0 0 25px rgba(255,183,3,0.1)' : '0 25px 45px rgba(0,0,0,0.6), inset 0 0 25px rgba(255,255,255,0.06)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = isCurrent ? '0 15px 35px rgba(255,183,3,0.15), inset 0 0 20px rgba(255,183,3,0.05)' : '0 15px 35px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,255,255,0.03)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {new Date(node.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                    {isCurrent && (
                      <span className="node-badge" style={{ background: 'var(--gold, #ffb703)', color: '#000', padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', boxShadow: '0 0 10px rgba(255,183,3,0.5)' }}>Current</span>
                    )}
                    {isUpcoming && !isCurrent && (
                      <span className="node-badge" style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)', padding: '0.2rem 0.6rem', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>Next</span>
                    )}
                  </div>
                  
                  <h3 style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 800, margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading, "Outfit")', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                    {node.title}
                  </h3>
                  
                  <p className="node-description" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {node.description}
                  </p>

                  <div className="node-footer" style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: isUpcoming ? 'rgba(255,255,255,0.4)' : isCurrent ? 'var(--gold, #ffb703)' : '#fff', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <Info size={14} /> Click to expand
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── DETAILS MODAL (rendered via portal to escape CSS transform context) ── */}
      {portalRoot && createPortal(
        <>
          <AnimatePresence>
            {selectedNode && (
              <motion.div 
                key="journey-backdrop"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedNode(null)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', zIndex: 99999 }}
              />
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {selectedNode && (
              <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, pointerEvents: 'none' }}>
                <motion.div
                  key="journey-modal"
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="journey-modal"
                  style={{
                    width: '90%', maxWidth: '500px', pointerEvents: 'auto',
                    padding: '2.5rem',
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.02))',
                    border: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.3)', borderLeft: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '32px',
                    backdropFilter: 'blur(30px) saturate(200%)', WebkitBackdropFilter: 'blur(30px) saturate(200%)',
                    boxShadow: '0 40px 100px rgba(0,0,0,0.8), inset 0 0 30px rgba(255,255,255,0.05)',
                    overflow: 'hidden', position: 'relative'
                  }}
                >
                  {/* Dynamic subtle glow inside the modal matching the belt color */}
                  <div style={{ position: 'absolute', top: '-20%', left: '-20%', width: '200px', height: '200px', borderRadius: '50%', background: selectedNode.type === 'belt' ? getHexColor(selectedNode.beltColor) : 'var(--gold, #ffb703)', filter: 'blur(80px)', opacity: 0.15, zIndex: 0, pointerEvents: 'none' }} />

                  <button 
                    className="journey-modal-close"
                    onClick={() => setSelectedNode(null)}
                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', width: 40, height: 40, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(10px)', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                  >
                    <X size={20} />
                  </button>

                  <div className="journey-modal-header" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', position: 'relative', zIndex: 10, paddingRight: '3rem' }}>
                    <div className="journey-modal-icon" style={{ 
                      width: 72, height: 72,
                      borderRadius: '24px', 
                      background: selectedNode.isUpcoming ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))`,
                      border: selectedNode.isUpcoming ? `2px dashed rgba(255,255,255,0.2)` : `1px solid rgba(255,255,255,0.3)`,
                      boxShadow: selectedNode.isUpcoming ? 'none' : `0 15px 30px rgba(0,0,0,0.3), inset 0 0 20px ${selectedNode.type === 'belt' ? getHexColor(selectedNode.beltColor) : 'var(--gold)'}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      backdropFilter: 'blur(10px)', flexShrink: 0
                    }}>
                      {selectedNode.type === 'origin' && <Star style={{ width: 32, height: 32 }} color="var(--gold, #ffb703)" />}
                      {selectedNode.type === 'belt' && <Award style={{ width: 32, height: 32 }} color={getHexColor(selectedNode.beltColor)} />}
                      {selectedNode.type === 'event' && <Medal style={{ width: 32, height: 32 }} color="#43aa8b" />}
                    </div>
                    <div>
                      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                        {new Date(selectedNode.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </div>
                      <h2 className="journey-modal-title" style={{ margin: 0, color: '#fff', fontFamily: 'var(--font-heading, "Outfit")', fontWeight: 900, lineHeight: 1.1, fontSize: '1.85rem', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                        {selectedNode.title}
                      </h2>
                    </div>
                  </div>

                  <div className="journey-modal-desc" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '24px', padding: '1.75rem', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 10, boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)' }}>
                    <h4 style={{ color: selectedNode.type === 'belt' ? getHexColor(selectedNode.beltColor) : 'var(--gold, #ffb703)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 0.75rem 0' }}>Description</h4>
                    <p className="journey-modal-desc-p" style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, margin: 0, fontSize: '1.05rem' }}>
                      {selectedNode.description}
                    </p>
                  </div>
                  
                  {selectedNode.isCurrent && (
                    <div className="journey-modal-current" style={{ marginTop: '1.5rem', padding: '1.25rem', textAlign: 'center', background: 'linear-gradient(90deg, transparent, rgba(255,183,3,0.15), transparent)', borderRadius: '16px', position: 'relative', zIndex: 10 }}>
                      <span style={{ color: 'var(--gold, #ffb703)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem', textShadow: '0 0 20px rgba(255,183,3,0.5)' }}>This is your current rank</span>
                    </div>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>,
        portalRoot
      )}

      <style nonce={nonce} dangerouslySetInnerHTML={{__html: `
        /* Mobile Layout */
        @media (max-width: 768px) {
          .timeline-line-desktop {
            display: none !important;
          }
          .timeline-line-mobile {
            display: block !important;
          }
          .timeline-node-container {
            margin-bottom: 2rem !important;
          }
          .timeline-node-container.node-left,
          .timeline-node-container.node-right {
            justify-content: flex-end !important;
          }
          .timeline-node-wrapper {
            width: 100% !important;
            justify-content: flex-start !important;
            padding-left: 60px !important;
            padding-right: 0 !important;
          }
          .timeline-node-icon {
            left: 0 !important;
            right: auto !important;
            width: 40px !important;
            height: 40px !important;
            margin-left: 0 !important;
          }
          .timeline-node-card {
            max-width: 100% !important;
            padding: 1.25rem 1rem !important;
            border-radius: 16px !important;
          }
          .node-description {
            display: none !important;
          }
          .node-footer {
            margin-top: 0.75rem !important;
          }
          
          /* Modal Mobile Overrides */
          .journey-modal {
            padding: 1.5rem !important;
            border-radius: 24px !important;
          }
          .journey-modal-close {
            top: 1rem !important; right: 1rem !important; width: 32px !important; height: 32px !important;
          }
          .journey-modal-icon {
            width: 56px !important; height: 56px !important; border-radius: 16px !important;
          }
          .journey-modal-icon svg {
            width: 24px !important; height: 24px !important;
          }
          .journey-modal-header {
            margin-bottom: 1.25rem !important;
            gap: 1rem !important;
            padding-right: 2.5rem !important;
          }
          .journey-modal-title {
            font-size: 1.4rem !important;
          }
          .journey-modal-desc {
            padding: 1.25rem !important;
            border-radius: 16px !important;
          }
          .journey-modal-desc-p {
            font-size: 0.95rem !important;
          }
          .journey-modal-current {
            padding: 1rem !important;
            margin-top: 1rem !important;
          }
        }
      `}} />
    </div>
  )
}
