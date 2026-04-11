import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { downloadCertificatePng, renderCertificateToCanvas } from '@/lib/certificates/exportPng'
import { Download, Share2, X, Copy, MessageCircle } from 'lucide-react'

interface CertificateModalProps {
  isOpen: boolean
  onClose: () => void
  enrollmentId: string
  skfId: string
}

export function CertificateModal({ isOpen, onClose, enrollmentId, skfId }: CertificateModalProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shareTooltip, setShareTooltip] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (isOpen) {
      loadDataAndRender()
      logEvent('viewed')
    } else {
       setData(null)
       setError('')
       setShareTooltip(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, enrollmentId])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const logEvent = async (eventType: string) => {
    try {
      await fetch('/api/certificates/events', {
        method: 'POST',
        body: JSON.stringify({ enrollmentId, skfId, eventType })
      })
    } catch (e) { } // silent telemetry
  }

  const loadDataAndRender = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/certificates/${enrollmentId}/data?skfId=${skfId}`)
      const raw = await res.json()
      if (raw.error) throw new Error(raw.error)
      
      setData(raw.data)
      
      const canvas = await renderCertificateToCanvas(raw.data)
      if (canvasRef.current && canvas) {
        const ctx = canvasRef.current.getContext('2d')
        canvasRef.current.width = canvas.width
        canvasRef.current.height = canvas.height
        ctx?.drawImage(canvas, 0, 0)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load certificate')
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/verify/${skfId}/${enrollmentId}`
    const shareText = `🥋 Check out my Karate Certificate!\n${data?.studentName || ''} has earned ${data?.programName || 'a certification'}\nView here: ${url}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My SKF Karate Certificate',
          text: shareText,
          url
        })
      } catch (e) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(shareText)
      setShareTooltip(true)
      setTimeout(() => setShareTooltip(false), 2000)
    }
  }

  const handleWhatsAppShare = () => {
    const url = `${window.location.origin}/verify/${skfId}/${enrollmentId}`
    const text = encodeURIComponent(`🥋 Check out my Karate Certificate!\n${data?.studentName || ''} has earned ${data?.programName || 'a certification'}\nView here: ${url}`)
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const downloadPDF = () => {
    logEvent('downloaded_pdf')
    window.location.href = `/api/certificates/${enrollmentId}/pdf?skfId=${skfId}`
  }

  const downloadPNG = () => {
    if (data) {
      logEvent('downloaded_png')
      downloadCertificatePng(data, data.studentName)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.97)', zIndex: 9999,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}
        >
          {/* Close Button */}
          <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 10 }}>
            <button 
              onClick={onClose} 
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', padding: '0.75rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Close certificate"
            >
              <X size={24} />
            </button>
          </div>

          {loading ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ color: '#f39c12', fontSize: '1.2rem', fontWeight: 600, textAlign: 'center' }}
            >
              <div style={{ width: '40px', height: '40px', border: '3px solid #333', borderTopColor: '#f39c12', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
              Loading official certificate...
            </motion.div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ color: '#e74c3c', fontSize: '1.2rem', textAlign: 'center', maxWidth: '400px', padding: '2rem' }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
              <p style={{ marginBottom: '0.5rem' }}>{error}</p>
              <p style={{ color: '#666', fontSize: '0.9rem' }}>This certificate may not be available yet.</p>
            </motion.div>
          ) : (
            <>
              {/* Certificate Canvas — pinch-to-zoom capable */}
              <motion.div
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ 
                  flex: 1, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'auto', padding: '1rem', touchAction: 'pinch-zoom'
                }}
              >
                <canvas 
                  ref={canvasRef} 
                  style={{
                    maxWidth: '92vw',
                    maxHeight: '75vh',
                    objectFit: 'contain',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 80px rgba(243, 156, 18, 0.08)'
                  }} 
                />
              </motion.div>

              {/* Action Bar — mobile-optimized with large tap targets */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{ 
                  padding: '1rem', 
                  width: '100%', 
                  maxWidth: '650px', 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.75rem'
                }}
              >
                <button 
                  onClick={downloadPDF}
                  style={{ 
                    minHeight: '52px', 
                    background: 'linear-gradient(135deg, #c0392b, #96281b)', 
                    color: '#fff', 
                    border: 'none', 
                    padding: '0.85rem 1rem', 
                    borderRadius: '10px', 
                    fontWeight: 700, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.5rem', 
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    boxShadow: '0 4px 20px rgba(192, 57, 43, 0.4)'
                  }}
                >
                  <Download size={18} /> PDF
                </button>
                <button 
                  onClick={downloadPNG}
                  style={{ 
                    minHeight: '52px',
                    background: 'rgba(255,255,255,0.05)', 
                    color: '#fff', 
                    border: '1px solid rgba(255,255,255,0.15)', 
                    padding: '0.85rem 1rem', 
                    borderRadius: '10px', 
                    fontWeight: 700, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.5rem', 
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  <Download size={18} /> PNG
                </button>
                <button 
                  onClick={handleShare}
                  style={{ 
                    minHeight: '52px',
                    background: 'transparent', 
                    color: '#f39c12', 
                    border: '1px solid rgba(243, 156, 18, 0.3)', 
                    padding: '0.85rem 1rem', 
                    borderRadius: '10px', 
                    fontWeight: 700, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.5rem', 
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    position: 'relative'
                  }}
                >
                  <Share2 size={18} /> 
                  {shareTooltip ? 'Copied!' : 'Share'}
                </button>
                <button 
                  onClick={handleWhatsAppShare}
                  style={{ 
                    minHeight: '52px',
                    background: 'rgba(37, 211, 102, 0.1)', 
                    color: '#25D366', 
                    border: '1px solid rgba(37, 211, 102, 0.3)', 
                    padding: '0.85rem 1rem', 
                    borderRadius: '10px', 
                    fontWeight: 700, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '0.5rem', 
                    cursor: 'pointer',
                    fontSize: '0.9rem'
                  }}
                >
                  <MessageCircle size={18} /> WhatsApp
                </button>
              </motion.div>
            </>
          )}

        </motion.div>
      )}
    </AnimatePresence>
  )
}
