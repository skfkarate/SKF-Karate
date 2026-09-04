'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'

const NOTICE_TEXT =
  'Please note: this video is meant only for practice and revision at home — the techniques have already been taught in class, so it\u2019s not intended to teach anything new. You may also notice a few quality issues (camera angle, sound, or editing), since it\u2019s recorded and edited entirely by our students as part of their training. We hope you\u2019ll understand and enjoy watching them in action!'

function subscribe() {
  return () => {}
}

export default function PortalNoticePopup() {
  const [open, setOpen] = useState(false)
  const mounted = useSyncExternalStore(subscribe, () => true, () => false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!mounted) return
    const timer = window.setTimeout(() => setOpen(true), 350)
    return () => window.clearTimeout(timer)
  }, [mounted])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    buttonRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const dismiss = () => setOpen(false)

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="pnp-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={dismiss}
        >
          <motion.div
            className="pnp-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Practice video notice"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ type: 'spring', damping: 24, stiffness: 260 }}
            onClick={(e) => e.stopPropagation()}
          >
            <span className="pnp-kanji" aria-hidden="true">稽古</span>

            <div className="pnp-badge">A Note From Your Seniors</div>
            <h2 className="pnp-title">Before You Press Play</h2>
            <p className="pnp-text">{NOTICE_TEXT}</p>

            <div className="pnp-actions">
              <button ref={buttonRef} className="pnp-btn pnp-btn--primary" onClick={dismiss}>
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}