import React from 'react'
import { Lock } from 'lucide-react'

export interface CertificateConfig {
  id: string
  programName: string
  programType: string
  beltLevel: string | null
  completionDate: string | null
  issuerName: string | null
  unlocked: boolean
  skfId: string
  enrollmentId: string
  onView: () => void
}

export function CertificateCard({ cert }: { cert: CertificateConfig }) {
  const getGlowColor = () => {
    if (cert.programType === 'camp') return 'rgba(231, 76, 60, 0.4)' // Red for camp
    if (cert.programType === 'tournament') return 'rgba(243, 156, 18, 0.4)' // Gold for tourney
    
    // Belt ranks logic
    if (!cert.beltLevel) return 'rgba(255, 255, 255, 0.1)'
    const b = cert.beltLevel.toLowerCase()
    if (b.includes('yellow')) return 'rgba(241, 196, 15, 0.6)'
    if (b.includes('orange')) return 'rgba(230, 126, 34, 0.6)'
    if (b.includes('green')) return 'rgba(46, 204, 113, 0.6)'
    if (b.includes('blue')) return 'rgba(52, 152, 219, 0.6)'
    if (b.includes('purple')) return 'rgba(155, 89, 182, 0.6)'
    if (b.includes('brown')) return 'rgba(135, 54, 0, 0.6)'
    if (b.includes('black')) return 'rgba(255, 255, 255, 0.3)'
    return 'rgba(255, 255, 255, 0.1)'
  }

  const isLocked = !cert.unlocked

  return (
    <div style={{
      background: isLocked ? '#050505' : 'rgba(10, 15, 30, 0.7)',
      backdropFilter: isLocked ? 'none' : 'blur(10px)',
      border: `1px solid ${isLocked ? '#1a1a1a' : getGlowColor()}`,
      borderRadius: '12px',
      padding: '1.5rem',
      position: 'relative',
      overflow: 'hidden',
      opacity: isLocked ? 0.6 : 1,
      transition: 'all 0.3s ease',
      boxShadow: isLocked ? 'none' : `0 4px 20px ${getGlowColor().replace(/[\d\.]+\)$/g, '0.1)')}`
    }}>
      
      {/* Background Decor */}
      {!isLocked && (
        <div style={{
          position: 'absolute', top: '-50%', right: '-50%',
          width: '200px', height: '200px',
          background: getGlowColor(),
          filter: 'blur(80px)', zIndex: 0, opacity: 0.5
        }} />
      )}

      <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        {isLocked && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', marginBottom: '1rem', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
            <Lock size={14} /> Certificate Processing
          </div>
        )}

        <h3 style={{ margin: '0 0 0.5rem 0', color: isLocked ? '#666' : '#f39c12', fontSize: '1.25rem', fontWeight: 600, letterSpacing: '-0.02em' }}>
          {cert.programName}
        </h3>

        {cert.beltLevel && (
           <span style={{ display: 'inline-block', marginBottom: '1.5rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', color: '#ccc', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
             {cert.beltLevel}
           </span>
        )}

        <div style={{ marginTop: 'auto', marginBottom: isLocked ? '0' : '1.5rem' }}>
          <p style={{ margin: '0 0 0.25rem 0', color: isLocked ? '#444' : '#fff', fontSize: '0.9rem' }}>
            Completed: <strong style={{ fontWeight: 600 }}>{new Date(cert.completionDate || '').toLocaleDateString('en-GB') || 'Pending'}</strong>
          </p>
          <p style={{ margin: 0, color: '#666', fontSize: '0.8rem' }}>
            Issued by: {cert.issuerName || 'SKF Administration'}
          </p>
        </div>

        {!isLocked && (
          <button 
            onClick={cert.onView}
            style={{ 
              width: '100%', 
              background: 'linear-gradient(135deg, #c0392b, #96281b)', 
              color: '#fff', 
              border: 'none', 
              padding: '0.75rem', 
              borderRadius: '6px', 
              fontWeight: 600, 
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(192, 57, 43, 0.4)'
            }}
          >
            View Certificate
          </button>
        )}

      </div>
    </div>
  )
}
