import Link from 'next/link'
import './error-pages.css'

export default function NotFound() {
  return (
    <div className="system-page">
      <div className="system-orb system-orb--1" />
      <div className="system-orb system-orb--2" />
      <div className="system-watermark">空手</div>

      <div className="system-content container">
        <span className="system-badge">System Error 404</span>
        <h1 className="system-code">404</h1>
        <h2 className="system-title">Page <span className="text-gradient">Not Found</span></h2>
        <p className="system-text">
          The path you're looking for has been moved or no longer exists in our digital academy.
        </p>
        
        <div className="system-actions">
          <Link href="/" className="btn btn-primary">
            Return to Dojo
          </Link>
          <Link href="/contact" className="btn btn-secondary" style={{ background: 'rgba(255,255,255,0.05)' }}>
            Report Issue
          </Link>
        </div>
      </div>
    </div>
  )
}
