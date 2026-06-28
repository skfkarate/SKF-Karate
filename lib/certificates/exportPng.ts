import QRCode from 'qrcode'
import type { CertificateData } from './CertificateRenderer'

export async function renderCertificateToCanvas(
  data: CertificateData
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas')
  canvas.width = 2480
  canvas.height = 1754
  const ctx = canvas.getContext('2d')!
  
  // Load template image
  const img = new Image()
  img.crossOrigin = 'anonymous'
  await new Promise((resolve, reject) => {
    img.onload = resolve
    img.onerror = reject
    img.src = data.templateImageUrl
  })
  ctx.drawImage(img, 0, 0, 2480, 1754)
  
  // Draw each text field
  for (const field of data.fields) {
    const xPx = (field.x / 100) * 2480
    const yPx = (field.y / 100) * 1754
    const scaledFontSize = field.fontSize * (2480 / 1240)
    ctx.font = `${field.bold ? 'bold ' : ''}${scaledFontSize}px ${field.fontFamily || 'Helvetica'}`
    ctx.fillStyle = field.color || '#000000'
    ctx.textAlign = field.align as CanvasTextAlign || 'left'
    if (field.maxWidth) {
      ctx.fillText(field.value, xPx, yPx, (field.maxWidth / 100) * 2480)
    } else {
      ctx.fillText(field.value, xPx, yPx)
    }
  }
  
  // QR code if enabled
  if (data.useQrCode) {
    const qrDataUrl = data.qrCodeDataUrl || await QRCode.toDataURL(data.verifyUrl, { width: 420, margin: 1 })
    const qrImg = new Image()
    qrImg.crossOrigin = 'anonymous'
    await new Promise(resolve => { qrImg.onload = resolve; qrImg.src = qrDataUrl })
    const qrSize = (data.qrSize / 100) * 2480
    ctx.drawImage(qrImg, (data.qrX / 100) * 2480, (data.qrY / 100) * 1754, qrSize, qrSize)
  }
  
  return canvas
}

export async function downloadCertificatePng(data: CertificateData, studentName: string) {
  const canvas = await renderCertificateToCanvas(data)
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
  
  if (isIOS) {
    window.open(canvas.toDataURL('image/png'), '_blank')
  } else {
    canvas.toBlob(blob => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${studentName.replace(/\s+/g, '_')}_${data.programName}_Certificate.png`
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }
}
