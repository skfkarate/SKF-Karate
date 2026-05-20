'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function BlogReadingClient() {
  const [progress, setProgress] = useState(0)
  const [showTop, setShowTop] = useState(false)

  useEffect(() => {
    function onScroll() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? Math.min((window.scrollY / docHeight) * 100, 100) : 0
      setProgress(pct)
      setShowTop(window.scrollY > 600)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div className="blog-progress" aria-hidden="true">
        <div className="blog-progress__bar" style={{ width: `${progress}%` }} />
      </div>

      <button
        className={`blog-back-top ${showTop ? 'blog-back-top--visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Back to top"
        type="button"
      >
        <ArrowUp size={18} />
      </button>
    </>
  )
}
