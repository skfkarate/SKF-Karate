'use client'

import { useEffect } from 'react'
import { FaRedoAlt } from 'react-icons/fa'

export default function Error({ error, reset }) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error(error)
  }, [error])

  return (
    <div className="page-hero" style={{ minHeight: '80vh', flexDirection: 'column' }}>
      <div className="page-hero__bg">
        <div className="glow glow-red page-hero__glow-1"></div>
      </div>
      
      <div className="page-hero__content container" style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 1.5rem' }}>
        <span className="section-label" style={{ marginBottom: '2rem', borderColor: 'rgba(214, 40, 40, 0.4)', color: 'var(--crimson)' }}>System Error</span>
        <h1 className="page-hero__title" style={{ fontSize: 'clamp(2.5rem, 10vw, 8rem)', marginBottom: '1rem', background: 'linear-gradient(135deg, var(--crimson), var(--gold))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
          SOMETHING WENT WRONG
        </h1>
        <p className="page-hero__subtitle" style={{ maxWidth: '600px', marginBottom: '3rem', fontSize: 'clamp(1rem, 4vw, 1.2rem)', textTransform: 'none', letterSpacing: 'normal', lineHeight: 1.6 }}>
          An unexpected technical issue interrupted your session. Please try again.
        </p>
        <button onClick={() => reset()} className="btn btn-primary" style={{ width: '100%', maxWidth: '300px' }}>
          <FaRedoAlt /> Try Again
        </button>
      </div>
    </div>
  )
}
