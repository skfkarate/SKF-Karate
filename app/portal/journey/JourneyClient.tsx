'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Medal, Award, Star, X, Info } from 'lucide-react'
import { usePortalAuth } from '@/app/_components/portal/usePortalAuth'
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
  usePortalAuth()
  const [selectedNode, setSelectedNode] = useState<TimelineNode | null>(null)

  // Reverse nodes so that the origin (first event) is at the BOTTOM of the rendered list
  // Assuming timelineNodes passed here is sorted newest to oldest (top to bottom).
  // We want newest at the top, oldest at the bottom. The array should be ordered latest first.
  const displayNodes = [...timelineNodes]

  return (
    <div style={{ padding: '2rem 1rem 6rem 1rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      
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
          
          // Alternate left and right (only applies to desktop via CSS)
          const isLeft = idx % 2 === 0
          const directionClass = isLeft ? 'node-left' : 'node-right'

          return (
            <motion.div
              key={node.id + idx}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              className={`timeline-node-container ${directionClass}`}
              style={{
                width: '100%',
                marginBottom: '4rem',
                position: 'relative',
                zIndex: 10
              }}
            >
              <div className="timeline-node-wrapper">
                
                {/* The Interactive Node Circle */}
                <div 
                  className="timeline-node-icon"
                  onClick={() => setSelectedNode(node)}
                  style={{
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

      {/* ── DETAILS MODAL ── */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div 
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedNode(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 99999 }}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {selectedNode && (
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, pointerEvents: 'none' }}>
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="journey-modal"
              style={{
                width: '90%', maxWidth: '500px', pointerEvents: 'auto',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.02))',
                border: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.3)', borderLeft: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '32px',
                backdropFilter: 'blur(30px) saturate(200%)', WebkitBackdropFilter: 'blur(30px) saturate(200%)',
                boxShadow: '0 40px 100px rgba(0,0,0,0.8), inset 0 0 30px rgba(255,255,255,0.05)'
              }}
            >
              {/* Dynamic subtle glow inside the modal matching the belt color */}
              <div style={{ position: 'absolute', top: '-20%', left: '-20%', width: '200px', height: '200px', borderRadius: '50%', background: selectedNode.type === 'belt' ? getHexColor(selectedNode.beltColor) : 'var(--gold, #ffb703)', filter: 'blur(80px)', opacity: 0.15, zIndex: 0, pointerEvents: 'none' }} />

              <button 
                className="journey-modal-close"
                onClick={() => setSelectedNode(null)}
                style={{ position: 'absolute', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(10px)', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <X size={20} />
              </button>

              <div className="journey-modal-header" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', position: 'relative', zIndex: 10 }}>
                <div className="journey-modal-icon" style={{ 
                  borderRadius: '24px', 
                  background: selectedNode.isUpcoming ? 'rgba(255,255,255,0.05)' : `linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))`,
                  border: selectedNode.isUpcoming ? `2px dashed rgba(255,255,255,0.2)` : `1px solid rgba(255,255,255,0.3)`,
                  boxShadow: selectedNode.isUpcoming ? 'none' : `0 15px 30px rgba(0,0,0,0.3), inset 0 0 20px ${selectedNode.type === 'belt' ? getHexColor(selectedNode.beltColor) : 'var(--gold)'}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backdropFilter: 'blur(10px)', flexShrink: 0
                }}>
                  {selectedNode.type === 'origin' && <Star className="journey-modal-icon-svg" color="var(--gold, #ffb703)" />}
                  {selectedNode.type === 'belt' && <Award className="journey-modal-icon-svg" color={getHexColor(selectedNode.beltColor)} />}
                  {selectedNode.type === 'event' && <Medal className="journey-modal-icon-svg" color="#43aa8b" />}
                </div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                    {new Date(selectedNode.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                  </div>
                  <h2 className="journey-modal-title" style={{ margin: 0, color: '#fff', fontFamily: 'var(--font-heading, "Outfit")', fontWeight: 900, lineHeight: 1.1, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                    {selectedNode.title}
                  </h2>
                </div>
              </div>

              <div className="journey-modal-desc" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', zIndex: 10, boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)' }}>
                <h4 style={{ color: selectedNode.type === 'belt' ? getHexColor(selectedNode.beltColor) : 'var(--gold, #ffb703)', fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', margin: '0 0 0.75rem 0' }}>Description</h4>
                <p className="journey-modal-desc-p" style={{ color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, margin: 0 }}>
                  {selectedNode.description}
                </p>
              </div>
              
              {selectedNode.isCurrent && (
                <div className="journey-modal-current" style={{ marginTop: '1.5rem', textAlign: 'center', background: 'linear-gradient(90deg, transparent, rgba(255,183,3,0.15), transparent)', borderRadius: '16px', position: 'relative', zIndex: 10 }}>
                  <span style={{ color: 'var(--gold, #ffb703)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem', textShadow: '0 0 20px rgba(255,183,3,0.5)' }}>This is your current rank</span>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style nonce={nonce} dangerouslySetInnerHTML={{__html: `
        /* Desktop Default Layout */
        .timeline-node-container {
          display: flex;
          align-items: center;
        }
        .timeline-node-container.node-left {
          justify-content: flex-start;
        }
        .timeline-node-container.node-right {
          justify-content: flex-end;
        }
        
        .timeline-node-wrapper {
          width: 50%;
          display: flex;
          position: relative;
        }
        .node-left .timeline-node-wrapper {
          justify-content: flex-end;
          padding-right: 3rem;
        }
        .node-right .timeline-node-wrapper {
          justify-content: flex-start;
          padding-left: 3rem;
        }
        
        .timeline-node-icon {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 48px;
          height: 48px;
          border-radius: 50%;
        }
        .node-left .timeline-node-icon {
          right: -24px;
        }
        .node-right .timeline-node-icon {
          left: -24px;
        }
        
        .timeline-node-card {
          border-radius: 24px;
          padding: 1.5rem;
          width: 100%;
          max-width: 380px;
        }

        /* Desktop Default Modal Styles */
        .journey-modal {
          padding: 2.5rem;
        }
        .journey-modal-close {
          top: 1.5rem; right: 1.5rem; width: 40px; height: 40px;
        }
        .journey-modal-icon {
          width: 72px; height: 72px;
        }
        .journey-modal-icon-svg {
          width: 32px; height: 32px;
        }
        .journey-modal-title {
          font-size: 1.85rem;
        }
        .journey-modal-desc {
          padding: 1.75rem;
        }
        .journey-modal-desc-p {
          font-size: 1.05rem;
        }
        .journey-modal-current {
          padding: 1.25rem;
        }

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
            justify-content: flex-end;
          }
          .timeline-node-wrapper,
          .node-left .timeline-node-wrapper,
          .node-right .timeline-node-wrapper {
            width: 100%;
            justify-content: flex-start;
            padding-left: 60px; /* Space for the 40px wide waving line */
            padding-right: 0;
          }
          .timeline-node-icon,
          .node-left .timeline-node-icon,
          .node-right .timeline-node-icon {
            left: 0;
            right: auto;
            width: 40px;
            height: 40px;
            margin-left: 0; /* Icon is 40px wide, centered on X=20 exactly aligning with the SVG path's central axis */
          }
          .timeline-node-card {
            max-width: 100%;
            padding: 1.25rem 1rem;
            border-radius: 16px;
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
          .journey-modal-icon-svg {
            width: 24px !important; height: 24px !important;
          }
          .journey-modal-header {
            margin-bottom: 1.25rem !important;
            gap: 1rem !important;
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
