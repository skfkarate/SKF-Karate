'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

import type { CertificateData } from '@/lib/certificates/CertificateRenderer'
import { renderCertificateToCanvas } from '@/lib/certificates/exportPng'

type CertificateCanvasProps = {
  data: CertificateData
  className?: string
  style?: CSSProperties
}

export function CertificateCanvas({ data, className, style }: CertificateCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function render() {
      setError('')
      try {
        const canvas = await renderCertificateToCanvas(data)
        if (cancelled || !canvasRef.current) return

        const ctx = canvasRef.current.getContext('2d')
        canvasRef.current.width = canvas.width
        canvasRef.current.height = canvas.height
        ctx?.clearRect(0, 0, canvas.width, canvas.height)
        ctx?.drawImage(canvas, 0, 0)
      } catch {
        if (!cancelled) setError('Certificate preview could not be rendered.')
      }
    }

    void render()

    return () => {
      cancelled = true
    }
  }, [data])

  if (error) {
    return (
      <div className={className} style={style} role="alert">
        {error}
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={style}
      aria-label={`Certificate ${data.certificateNumber}`}
    />
  )
}
