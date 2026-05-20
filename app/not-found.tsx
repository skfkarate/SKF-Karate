import Link from 'next/link'
import { MapPin, Home, BookOpen, Phone, Users, Calendar } from 'lucide-react'
import './error-pages.css'

export default function NotFound() {
  return (
    <div className="system-page">
      {/* Ambient background */}
      <div className="system-orb system-orb--1" />
      <div className="system-orb system-orb--2" />
      <div className="system-orb system-orb--3" />
      <div className="system-watermark">道</div>

      <div className="system-content container">
        {/* Icon */}
        <div className="system-icon-wrap system-icon-wrap--lost">
          <MapPin className="system-icon" />
        </div>

        {/* Badge */}
        <span className="system-badge">Lost Your Way?</span>

        {/* Title */}
        <h1 className="system-title">
          This Page Doesn&apos;t <span className="text-gradient">Exist</span>
        </h1>

        {/* Description */}
        <p className="system-text">
          The page you&apos;re looking for may have been moved, renamed, or
          is no longer available. Let&apos;s get you back on track.
        </p>

        {/* Quick navigation suggestions */}
        <div className="system-suggestions">
          <Link href="/classes" className="system-suggestion-chip">
            <BookOpen /> Classes
          </Link>
          <Link href="/about" className="system-suggestion-chip">
            <Users /> About Us
          </Link>
          <Link href="/events" className="system-suggestion-chip">
            <Calendar /> Events
          </Link>
          <Link href="/contact" className="system-suggestion-chip">
            <Phone /> Contact
          </Link>
        </div>

        {/* Primary actions */}
        <div className="system-actions">
          <Link href="/" className="btn btn-primary">
            <Home size={16} />
            Back to Homepage
          </Link>
          <Link href="/contact" className="btn btn-secondary">
            <Phone size={16} />
            Report This
          </Link>
        </div>

        {/* Footer hint */}
        <div className="system-divider" />
        <p className="system-footer">
          If you believe this is an error, please{' '}
          <Link href="/contact">let us know</Link>.
        </p>
      </div>
    </div>
  )
}
