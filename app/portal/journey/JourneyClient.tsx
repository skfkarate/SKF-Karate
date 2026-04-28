'use client'

import { motion } from 'framer-motion'
import { Medal, Award, Map as MapIcon, Star } from 'lucide-react'
import { usePortalAuth } from '@/app/_components/portal/usePortalAuth'

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
  if (normalized.includes('black')) return '#444444' // Using dark grey instead of pure black for visibility
  return '#ffffff'
}

export default function JourneyClient({ timelineNodes, athlete }: { timelineNodes: any[], athlete: any }) {
  usePortalAuth()

  return (
    <div style={{ padding: '1rem 0', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'rgba(255,183,3,0.1)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <MapIcon size={20} color="#ffb703" />
          </div>
          <h1 style={{
            fontFamily: 'var(--font-heading, "Outfit")',
            fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
            fontWeight: 900, color: '#fff',
            letterSpacing: '-0.02em', lineHeight: 1.1, margin: 0,
          }}>
            My Journey
          </h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 'clamp(0.85rem, 2vw, 1rem)', margin: 0, paddingLeft: '52px' }}>
          Your martial arts path forged through discipline and dedication.
        </p>
      </motion.div>

      <div style={{ position: 'relative', paddingLeft: '3rem', paddingBottom: '2rem' }}>
        {/* The Vertical Line / Spine */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: '100%' }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: '0px',
            top: 0,
            width: '2px',
            background: 'linear-gradient(to bottom, rgba(255,183,3,0.8), rgba(255,183,3,0.1))',
            transformOrigin: 'top'
          }}
        />

        {timelineNodes.map((node, idx) => {
          const isOrigin = node.type === 'origin'
          const isBelt = node.type === 'belt'
          const isEvent = node.type === 'event'
          const isCurrent = node.isCurrent
          const isUpcoming = node.isUpcoming

          const nodeColor = isBelt ? getHexColor(node.beltColor) : isEvent ? '#43aa8b' : 'var(--gold, #ffb703)'
          
          return (
            <motion.div
              key={node.id + idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: 0.1, duration: 0.4 }}
              style={{
                position: 'relative',
                marginBottom: '3rem',
              }}
            >
              {/* Node Dot */}
              <div style={{
                position: 'absolute',
                left: '-7px',
                top: '24px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: isCurrent ? 'var(--gold, #ffb703)' : '#0a0e16',
                border: isUpcoming ? `3px dashed rgba(255,255,255,0.4)` : `3px solid ${nodeColor}`,
                boxShadow: isCurrent ? `0 0 20px ${nodeColor}` : isUpcoming ? 'none' : `0 0 10px ${nodeColor}40`,
                zIndex: 2,
                transition: 'all 0.3s'
              }} />

              {/* Node Content Card */}
              <div style={{
                background: isCurrent ? 'rgba(255, 183, 3, 0.05)' : isUpcoming ? 'transparent' : 'rgba(10, 14, 22, 0.6)',
                border: isUpcoming ? '1px dashed rgba(255,255,255,0.1)' : '1px solid',
                borderColor: isCurrent ? 'rgba(255, 183, 3, 0.3)' : isUpcoming ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: isCurrent ? '0 8px 32px rgba(255,183,3,0.05)' : 'none',
                position: 'relative',
                overflow: 'hidden',
                opacity: isUpcoming ? 0.6 : 1,
              }}>
                {isCurrent && <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '4px', background: 'var(--gold, #ffb703)' }} />}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isOrigin && <Star size={18} color="var(--gold, #ffb703)" />}
                    {isBelt && <Award size={18} color={nodeColor} />}
                    {isEvent && <Medal size={18} color={nodeColor} />}
                    <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                      {new Date(node.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  {isCurrent && (
                    <span style={{ 
                      background: 'var(--gold, #ffb703)', 
                      color: '#000', 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '100px', 
                      fontSize: '0.7rem', 
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Current Rank</span>
                  )}
                  {isUpcoming && !isCurrent && (
                    <span style={{ 
                      background: 'transparent',
                      border: '1px solid rgba(255,255,255,0.2)',
                      color: 'rgba(255,255,255,0.6)', 
                      padding: '0.2rem 0.6rem', 
                      borderRadius: '100px', 
                      fontSize: '0.7rem', 
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>Upcoming</span>
                  )}
                </div>

                <h3 style={{ fontSize: '1.35rem', color: '#fff', fontWeight: 700, margin: '0 0 0.5rem 0', fontFamily: 'var(--font-heading, "Outfit")' }}>
                  {node.title}
                </h3>
                
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
                  {node.description}
                </p>
              </div>
            </motion.div>
          )
        })}

        {/* Future / Upcoming Node */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            position: 'relative',
          }}
        >
           <div style={{
              position: 'absolute',
              left: '-5px',
              top: '24px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#0a0e16',
              border: `2px dashed rgba(255,255,255,0.3)`,
              zIndex: 2,
            }} />
            
            <div style={{
              border: '1px dashed rgba(255,255,255,0.1)',
              borderRadius: '16px',
              padding: '1.5rem',
              textAlign: 'center',
              background: 'transparent'
            }}>
              <h3 style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600, margin: '0', fontFamily: 'var(--font-heading, "Outfit")' }}>
                Training in Progress...
              </h3>
            </div>
        </motion.div>
      </div>
    </div>
  )
}
