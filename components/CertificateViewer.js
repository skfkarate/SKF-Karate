'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CertificateRenderer } from '@/lib/certificates/renderer'
import { exportCanvasAsPng, exportCanvasAsPdf } from '@/lib/certificates/export'

/**
 * Reusable component to render and interact with a Certificate canvas natively on a page.
 */
export default function CertificateViewer({ enrollment, student }) {
  const canvasRef = useRef(null)
  const [isRendering, setIsRendering] = useState(true)
  const [renderError, setRenderError] = useState('')

  useEffect(() => {
    if (!enrollment || !student) return

    setIsRendering(true)
    setRenderError('')

    const renderCertificate = async () => {
      try {
        if (!canvasRef.current) return

        const renderer = new CertificateRenderer(canvasRef.current)
        
        const mockTemplate = {
          templateImageUrl: '/certificate-templates/skf-default-template.png',
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

        renderer.ctx.fillStyle = '#ffffff'
        renderer.ctx.fillRect(0, 0, renderer.baseWidth, renderer.baseHeight)
        renderer.ctx.fillStyle = '#05080f'
        renderer.ctx.fillRect(50, 50, renderer.baseWidth-100, renderer.baseHeight-100)
        renderer.ctx.fillStyle = '#ffffff'
        renderer.ctx.fillRect(80, 80, renderer.baseWidth-160, renderer.baseHeight-160)
        renderer.ctx.fillStyle = '#ffb703'
        renderer.ctx.fillRect(100, 100, renderer.baseWidth-200, 20)

        try {
          await renderer.render(mockTemplate, data)
        } catch (imgError) {
          console.warn('Fallback rendering used', imgError)
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

    setTimeout(renderCertificate, 50)
  }, [enrollment, student])

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
    const text = `🥋 My Karate Certificate!\n${student.firstName} has earned ${enrollment.programName || 'a new belt'}.\nView here: ${window.location.origin}/verify/${student.registrationNumber}/${enrollment.id}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SKF Karate Certificate',
          text: text,
          url: `${window.location.origin}/verify/${student.registrationNumber}/${enrollment.id}`
        })
      } catch (err) { }
    } else {
      navigator.clipboard.writeText(text)
      alert('Link copied to clipboard!')
    }
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', marginTop: '2rem' }}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200 }}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 900,
          aspectRatio: '1.414',
          background: '#fff',
          borderRadius: 8,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,183,3,0.3)',
          overflow: 'hidden'
        }}
      >
        {isRendering && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5,8,15,0.8)', color: '#ffb703', fontSize: '1.2rem', fontWeight: 'bold' }}>
            Generating Digital Certificate...
          </div>
        )}
        {renderError && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(214,40,40,0.9)', color: '#fff', padding: '2rem', textAlign: 'center' }}>
            {renderError}
          </div>
        )}
        <canvas 
          ref={canvasRef} 
          style={{ width: '100%', height: '100%', display: 'block' }} 
        />
      </motion.div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', width: '100%', maxWidth: 600 }}>
        <button 
          onClick={handleDownloadPdf} disabled={isRendering || !!renderError}
          style={{ flex: '1 1 200px', minHeight: 48, background: 'linear-gradient(135deg, #d62828 0%, #c0392b 100%)', color: '#fff', border: 'none', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, cursor: isRendering ? 'not-allowed' : 'pointer', opacity: isRendering ? 0.7 : 1 }}
        >
          📄 Download PDF
        </button>
        <button 
          onClick={handleDownloadPng} disabled={isRendering || !!renderError}
          style={{ flex: '1 1 200px', minHeight: 48, background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, cursor: isRendering ? 'not-allowed' : 'pointer', opacity: isRendering ? 0.7 : 1 }}
        >
          🖼️ Download PNG
        </button>
        <button 
          onClick={handleShare} disabled={isRendering || !!renderError}
          style={{ flex: '1 1 100%', minHeight: 48, background: 'rgba(255,183,3,0.1)', color: '#ffb703', border: '1px solid rgba(255,183,3,0.3)', borderRadius: 8, fontSize: '0.9rem', fontWeight: 600, cursor: isRendering ? 'not-allowed' : 'pointer', opacity: isRendering ? 0.7 : 1 }}
        >
          📲 Share Certificate
        </button>
      </div>
    </div>
  )
}
