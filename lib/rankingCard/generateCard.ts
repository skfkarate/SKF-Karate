import html2canvas from 'html2canvas'

export async function generateRankingCard(
  cardElement: HTMLElement, 
  studentName: string
): Promise<void> {
  // Clone the element to avoid modifying the visible UI
  const clone = cardElement.cloneNode(true) as HTMLElement
  clone.style.position = 'fixed'
  clone.style.left = '-9999px'
  clone.style.top = '0'
  clone.style.backdropFilter = 'none'
  ;(clone.style as CSSStyleDeclaration & { webkitBackdropFilter?: string }).webkitBackdropFilter = 'none'
  clone.style.background = '#05080f'
  document.body.appendChild(clone)
  
  try {
    const canvas = await html2canvas(clone, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#05080f',
      width: 1080,
      height: 1080
    })
    
    // iOS detection
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    
    if (isIOS) {
      // iOS: open in new tab (user long-presses to save)
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9)
      window.open(dataUrl, '_blank')
    } else {
      // Desktop/Android: trigger download
      canvas.toBlob((blob) => {
        if (!blob) return
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${studentName.replace(/\s+/g, '_')}_SKF_RankingCard.jpg`
        a.click()
        URL.revokeObjectURL(url)
      }, 'image/jpeg', 0.9)
    }
  } finally {
    document.body.removeChild(clone)
  }
}
