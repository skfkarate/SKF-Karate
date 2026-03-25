'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CertificateRenderer } from '@/lib/certificates/renderer'
import { exportCanvasAsPng, exportCanvasAsPdf } from '@/lib/certificates/export'

/**
 * Full-screen modal to preview and download certificates.
 * Renders the certificate to a hidden canvas, then scales it with CSS for preview.
 */
export default function CertificateModal({ isOpen, onClose, enrollment, student }) {
  const canvasRef = useRef(null)
  const [isRendering, setIsRendering] = useState(true)
  const [renderError, setRenderError] = useState('')

  useEffect(() => {
    if (!isOpen || !enrollment || !student) return

    setIsRendering(true)
    setRenderError('')

    const renderCertificate = async () => {
      try {
        if (!canvasRef.current) return

        const renderer = new CertificateRenderer(canvasRef.current)
        
        // MOCK TEMPLATE DATA - In reality, fetch this from Supabase based on enrollment.programId
        const mockTemplate = {
          templateImageUrl: '/certificate-templates/skf-default-template.png', // Fallback URL
          useQrCode: true,
          fields: {
            recipientName: { x: 50, y: 46, fontSize: 80, fontFamily: 'serif', color: '#c0392b', align: 'center', fontWeight: 'bold' },
            courseName: { x: 50, y: 58, fontSize: 40, fontFamily: 'sans-serif', color: '#333333', align: 'center', fontWeight: 'normal' },
            issuerName: { x: 25, y: 82, fontSize: 30, fontFamily: 'cursive', color: '#111111', align: 'center', fontWeight: 'bold' },
            date: { x: 75, y: 82, fontSize: 24, fontFamily: 'sans-serif', color: '#555555', align: 'center', fontWeight: 'normal' },
            skfId: { x: 50, y: 92, fontSize: 20, fontFamily: 'sans-serif', color: '#888888', align: 'center', fontWeight: 'normal' }
          }
        }

        const data = {
          recipientName: `${student.firstName} ${student.lastName}`.toUpperCase(),
          courseName: enrollment.programName || `Passed ${enrollment.beltLevel || 'Karate'} Belt Exam`,
          date: enrollment.completionDate || new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
          issuerName: enrollment.issuerName || 'Sensei Arvind',
          skfId: student.registrationNumber,
          verificationUrl: `${window.location.origin}/verify/${student.registrationNumber}/${enrollment.id}`
        }

        // Draw a placeholder fallback if the image fails to load during mockup phase
        renderer.ctx.fillStyle = '#ffffff'
        renderer.ctx.fillRect(0, 0, renderer.baseWidth, renderer.baseHeight)
        
        // Draw some mock template graphics
        renderer.ctx.fillStyle = '#05080f'
        renderer.ctx.fillRect(50, 50, renderer.baseWidth-100, renderer.baseHeight-100)
        renderer.ctx.fillStyle = '#ffffff'
        renderer.ctx.fillRect(80, 80, renderer.baseWidth-160, renderer.baseHeight-160)
        renderer.ctx.fillStyle = '#ffb703'
        renderer.ctx.fillRect(100, 100, renderer.baseWidth-200, 20)

        // Ensure we try to load the template image, but don't fail hard if the template proxy 404s the mock image
        try {
          await renderer.render(mockTemplate, data)
        } catch (imgError) {
          console.warn('Mock image could not be loaded via proxy, rendering text over fallback canvas', imgError)
          // Draw text manually since render() failed
          Object.keys(mockTemplate.fields).forEach(k => renderer.drawText({...mockTemplate.fields[k], value: data[k]}))
          if (mockTemplate.useQrCode) await renderer.drawQrCode(data.verificationUrl, 85, 85, 7)
        }

        setIsRendering(false)
      } catch (err) {
        console.error('Certificate render error:', err)
        setRenderError('Could not render certificate image.')
        setIsRendering(false)
      }
    }

    // Small delay to ensure canvas exists in DOM
    setTimeout(renderCertificate, 50)
  }, [isOpen, enrollment, student])

  const handleDownloadPdf = () => {
    if (!canvasRef.current) return
    const filename = `${student.firstName}_${enrollment.programName || 'Certificate'}.pdf`.replace(/\s+/g, '_')
    exportCanvasAsPdf(canvasRef.current, filename)
  }

  const handleDownloadPng = () => {
    if (!canvasRef.current) return
    const filename = `${student.firstName}_${enrollment.programName || 'Certificate'}.png`.replace(/\s+/g, '_')
    exportCanvasAsPng(canvasRef.current, filename)
  }

  const handleShare = async () => {
    const text = `🥋 My Karate Certificate!\n${student.firstName} has earned ${enrollment.programName || 'a new belt'}.\nView here: ${window.location.origin}/athlete/${student.registrationNumber}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SKF Karate Certificate',
          text: text,
          url: `${window.location.origin}/athlete/${student.registrationNumber}`
        })
      } catch (err) {
        // user cancelled or share failed
        console.log('Share failed:', err)
      }
    } else {
      navigator.clipboard.writeText(text)
      alert('Message copied to clipboard! You can now paste it into WhatsApp.')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(5, 8, 15, 0.95)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            padding: '1rem'
          }}
        >
          {/* Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem', flexShrink: 0 }}>
            <button 
              onClick={onClose}
              style={{
                width: 44,
                height: 44,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#fff',
                fontSize: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(214, 40, 40, 0.5)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              ✕
            </button>
          </div>

          {/* Certificate Container */}
          <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '2rem',
            paddingBottom: '3rem'
          }}>
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300, delay: 0.1 }}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: 1000,
                aspectRatio: '1.414', // A4 Landscape ratio
                background: '#fff', // fallback
                borderRadius: 8,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255,183,3,0.3)',
                overflow: 'hidden'
              }}
            >
              {isRendering && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,8,15,0.5)', color: '#ffb703', fontSize: '1.2rem', fontWeight: 'bold' }}>
                  Rendering Certificate...
                </div>
              )}
              {renderError && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(214,40,40,0.9)', color: '#fff', padding: '2rem', textAlign: 'center' }}>
                  {renderError}
                </div>
              )}
              
              {/* Full resolution hidden canvas. CSS scales it to fit container. */}
              <canvas 
                ref={canvasRef} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'block',
                  touchAction: 'manipulation' // allows pinch zoom on mobile
                }} 
              />
            </motion.div>

            {/* Actions Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                justifyContent: 'center',
                width: '100%',
                maxWidth: 600
              }}
            >
              <button 
                onClick={handleDownloadPdf}
                disabled={isRendering || !!renderError}
                style={{
                  flex: '1 1 200px',
                  minHeight: 52,
                  background: 'linear-gradient(135deg, #d62828 0%, #c0392b 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 12,
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  cursor: isRendering ? 'not-allowed' : 'pointer',
                  opacity: isRendering ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 10px 20px rgba(214, 40, 40, 0.3)'
                }}
              >
                📄 Download PDF
              </button>

              <button 
                onClick={handleDownloadPng}
                disabled={isRendering || !!renderError}
                style={{
                  flex: '1 1 200px',
                  minHeight: 52,
                  background: 'rgba(255,255,255,0.1)',
                  backdropFilter: 'blur(10px)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 12,
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  cursor: isRendering ? 'not-allowed' : 'pointer',
                  opacity: isRendering ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={e => !isRendering && (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                onMouseOut={e => !isRendering && (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
              >
                🖼️ Download PNG
              </button>

              <button 
                onClick={handleShare}
                disabled={isRendering || !!renderError}
                style={{
                  flex: '1 1 100%',
                  minHeight: 52,
                  background: 'rgba(255,183,3,0.1)',
                  color: '#ffb703',
                  border: '1px solid rgba(255,183,3,0.3)',
                  borderRadius: 12,
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  cursor: isRendering ? 'not-allowed' : 'pointer',
                  opacity: isRendering ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={e => !isRendering && (e.currentTarget.style.background = 'rgba(255,183,3,0.15)')}
                onMouseOut={e => !isRendering && (e.currentTarget.style.background = 'rgba(255,183,3,0.1)')}
              >
                📲 Share to WhatsApp
              </button>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
