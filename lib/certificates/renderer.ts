import QRCode from 'qrcode'

export class CertificateRenderer {
  /**
   * Initialize standard A4 landscape canvas (2480x1754 at 300dpi)
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.baseWidth = 2480
    this.baseHeight = 1754
    
    // Set logical size for high-res output
    this.canvas.width = this.baseWidth
    this.canvas.height = this.baseHeight
  }

  /**
   * Draw an image onto the canvas, fitting the entire canvas
   * @param {string} imageUrl
   */
  async drawBackground(imageUrl) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous' // Important for drawing external images
      img.onload = () => {
        this.ctx.drawImage(img, 0, 0, this.baseWidth, this.baseHeight)
        resolve()
      }
      img.onerror = () => reject(new Error('Failed to load template image'))
      // Route through our CORS proxy
      img.src = `/api/certificates/template-image?url=${encodeURIComponent(imageUrl)}`
    })
  }

  /**
   * Draw a text field onto the canvas using percentage-based coordinates
   * @param {object} field { x: 50, y: 50, fontSize: 32, fontFamily: 'Arial', color: '#000', align: 'center', value: 'Test' }
   */
  drawText(field) {
    if (!field.value) return

    // Convert percentages to absolute pixels based on 2480x1754
    const xPx = (field.x / 100) * this.baseWidth
    const yPx = (field.y / 100) * this.baseHeight

    // Scale font size: template was designed at 1240px width originally typically, 
    // so we scale by 2480 / 1240 = 2x if needed. However we assume the editor stores font size relative to 2480.
    const scaledFontSize = field.fontSize

    this.ctx.font = `${field.fontWeight || 'normal'} ${scaledFontSize}px ${field.fontFamily || 'sans-serif'}`
    this.ctx.fillStyle = field.color || '#000000'
    this.ctx.textAlign = field.align || 'left'
    
    // Vertical alignment adjustment
    this.ctx.textBaseline = 'middle'

    this.ctx.fillText(field.value, xPx, yPx)
  }

  /**
   * Draw a real QR code using the qrcode library
   * @param {string} url - Verification URL
   * @param {number} x - X percentage
   * @param {number} y - Y percentage
   * @param {number} size - Size percentage
   */
  async drawQrCode(url, x, y, size) {
    const xPx = (x / 100) * this.baseWidth
    const yPx = (y / 100) * this.baseHeight
    const sizePx = (size / 100) * this.baseWidth

    try {
      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: Math.round(sizePx),
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' }
      })

      // Draw generated QR code image onto canvas
      await new Promise((resolve, reject) => {
        const qrImg = new Image()
        qrImg.crossOrigin = 'anonymous'
        qrImg.onload = () => {
          this.ctx.drawImage(
            qrImg,
            xPx - sizePx / 2,
            yPx - sizePx / 2,
            sizePx,
            sizePx
          )
          resolve()
        }
        qrImg.onerror = () => reject(new Error('Failed to render QR code'))
        qrImg.src = qrDataUrl
      })
    } catch (err) {
      console.error('QR code rendering failed:', err)
    }
  }

  /**
   * Render the full certificate
   * @param {object} template 
   * @param {object} data
   */
  async render(template, data) {
    try {
      // 1. Clear canvas
      this.ctx.clearRect(0, 0, this.baseWidth, this.baseHeight)

      // 2. Draw background template
      await this.drawBackground(template.templateImageUrl)

      // 3. Draw all mapped text fields
      if (template.fields) {
        Object.keys(template.fields).forEach(key => {
          const fieldDef = template.fields[key]
          const val = data[key]
          if (val) {
            this.drawText({ ...fieldDef, value: val })
          }
        })
      }

      // 4. Draw QR if enabled
      if (template.useQrCode && data.verificationUrl) {
        await this.drawQrCode(data.verificationUrl, 85, 85, 7) // 85% x, 85% y, 7% size
      }

      return this.canvas
    } catch (e) {
      console.error('Certificate rendering failed:', e)
      throw e
    }
  }
}
