'use client'

import { useEffect, useState } from 'react'

export default function SecureContentWrapper({ children }: { children: React.ReactNode }) {
  const [isBlurred, setIsBlurred] = useState(false)

  useEffect(() => {
    // 1. Prevent Right Click (Context Menu)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    // 2. Prevent Copy/Cut/Paste
    const handleCopyCut = (e: ClipboardEvent) => {
      e.preventDefault()
    }

    // 3. Prevent Dragging Images
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault()
    }

    // 4. Blur on Window Focus Loss (Anti-Snipping Tool)
    // When a user opens Snipping Tool (Windows) or Cmd+Shift+4 (Mac), the window often loses focus.
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsBlurred(true)
      } else {
        // Quick unblur when they return
        setIsBlurred(false)
      }
    }
    
    const handleBlur = () => setIsBlurred(true)
    const handleFocus = () => setIsBlurred(false)

    // 5. Advanced Keyboard Shortcut Blocking (PrintScreen, Save, Print)
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block PrintScreen
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('') // Clear clipboard
        setIsBlurred(true)
        setTimeout(() => setIsBlurred(false), 1000)
      }
      
      // Block Ctrl+P / Cmd+P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault()
      }

      // Block Ctrl+S / Cmd+S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
      }
      
      // Block Inspect Element shortcuts (F12, Ctrl+Shift+I, Cmd+Option+I)
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c'))) {
        e.preventDefault()
      }
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('copy', handleCopyCut)
    document.addEventListener('cut', handleCopyCut)
    document.addEventListener('dragstart', handleDragStart)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('copy', handleCopyCut)
      document.removeEventListener('cut', handleCopyCut)
      document.removeEventListener('dragstart', handleDragStart)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body {
            display: none !important;
          }
        }
        .secure-wrapper {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
          -webkit-touch-callout: none;
          transition: filter 0.2s ease;
        }
      `}} />
      <div 
        className="secure-wrapper" 
        style={{ 
          filter: isBlurred ? 'blur(10px) grayscale(100%) brightness(0.2)' : 'none',
        }}
      >
        {/* Anti-DevTools Overlay - an invisible div that covers the screen to prevent easy right-clicking on specific elements */}
        {/* We won't block everything, but we ensure content is un-selectable */}
        {children}
      </div>
    </>
  )
}
