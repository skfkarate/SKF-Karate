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
        <h1 className="page-hero__title" style={{ fontSize: 'clamp(2.5rem, 12vw, 8rem)', marginBottom: '1rem', background: 'linear-gradient(135deg, var(--crimson), var(--gold))', WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
          LOST YOUR WAY?
        </h1>
        <p className="page-hero__subtitle" style={{ maxWidth: '600px', marginBottom: '3rem', fontSize: 'clamp(1rem, 4vw, 1.2rem)', textTransform: 'none', letterSpacing: 'normal', lineHeight: 1.6 }}>
          Even the greatest martial artists must find their path again. The page you are looking for has been moved or doesn&apos;t exist.
        </p>
        <Link href="/" className="btn btn-primary" style={{ width: '100%', maxWidth: '300px' }}>
          <FaArrowLeft /> Return to Dojo
        </Link>
      </div>
    </div>
  )
}
