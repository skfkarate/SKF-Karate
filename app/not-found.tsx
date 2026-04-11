import Link from 'next/link'
import { FaArrowLeft } from 'react-icons/fa'

export default function NotFound() {
  return (
    <div className="page-hero" style={{ minHeight: '80vh', flexDirection: 'column' }}>
      <div className="page-hero__bg">
        <div className="glow glow-red page-hero__glow-1"></div>
        <div className="glow glow-gold page-hero__glow-2"></div>
      </div>
      
      <div className="page-hero__content container" style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 1.5rem' }}>
        <span className="section-label" style={{ marginBottom: '2rem' }}>Error 404</span>
        <h1 className="page-hero__title" style={{ 
            fontSize: 'clamp(5rem, 20vw, 12rem)', 
            marginBottom: '1rem', 
            color: 'var(--gold, #ffb703)',
            textShadow: '0 0 40px var(--crimson-glow, rgba(214, 40, 40, 0.8))',
            lineHeight: 1 
        }}>
          404
        </h1>
        <p className="page-hero__subtitle" style={{ maxWidth: '600px', marginBottom: '3rem', fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', textTransform: 'none', letterSpacing: 'normal', lineHeight: 1.6, color: '#fff' }}>
          This page doesn't exist
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/" className="btn btn-primary">
              Go Home
            </Link>
            <Link href="/athlete" className="btn btn-secondary">
              View Rankings
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              Contact Us
            </Link>
        </div>
      </div>
    </div>
  )
}
