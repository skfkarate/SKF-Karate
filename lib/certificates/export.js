import { jsPDF } from 'jspdf'

/**
 * Export canvas as PNG image
 * Handles iOS Safari blob download constraints by opening in a new tab if necessary.
 * 
 * @param {HTMLCanvasElement} canvas 
 * @param {string} filename 
 */
export function exportCanvasAsPng(canvas, filename) {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

  if (isIOS) {
    // iOS Safari often blocks blob downloads. Safest route is data URL in new window
    // so the user can "Long press -> Save Image"
    const dataUrl = canvas.toDataURL('image/png')
    const w = window.open('about:blank')
    if (w) {
      w.document.write(`<img src="${dataUrl}" style="max-width:100%; height:auto;" alt="Certificate"/>`)
      w.document.write('<p style="text-align:center; font-family:sans-serif; margin-top:20px;">Long press image to save to Photos</p>')
    } else {
      // Fallback if popup blocker stops it
      window.location.href = dataUrl
    }
    return
  }

  // Standard Blob download for Desktop/Android
  canvas.toBlob((blob) => {
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || 'SKF_Certificate.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }, 'image/png', 1.0)
}

/**
 * Export canvas as PDF document using jsPDF
 * Creates a landscape A4 page with the canvas image taking up the full page.
 * 
 * @param {HTMLCanvasElement} canvas 
 * @param {string} filename 
 */
export function exportCanvasAsPdf(canvas, filename) {
  // 2480x1754 px at 300 DPI
  const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait'
  
  // Create PDF with custom dimensions matching the canvas aspect ratio
  // using pixels as the unit to ensure 1:1 mapping
  const doc = new jsPDF({
    orientation,
    unit: 'px',
    format: [canvas.width, canvas.height],
    compress: true
  })

  // Convert canvas to image data
  const imgData = canvas.toDataURL('image/jpeg', 0.95) // JPEG is smaller for PDFs than PNG

  // Add image to full page bleed
  doc.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height)
  
  // Trigger download
  doc.save(filename || 'SKF_Certificate.pdf')
}
