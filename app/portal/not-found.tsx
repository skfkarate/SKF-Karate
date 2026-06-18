import Link from 'next/link'

export default function PortalNotFound() {
  return (
    <div className="hub-layout">
      <main className="hub-main">
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          minHeight: '60vh', gap: '1.5rem', padding: '2rem', textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
            Page Not Found
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '400px', lineHeight: 1.6, margin: 0 }}>
            The portal page you are looking for does not exist or has been moved.
          </p>
          <Link
            href="/portal/dashboard"
            style={{
              padding: '0.85rem 2rem', borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--crimson, #d62828), #b31b1b)',
              color: '#fff', fontWeight: 700, textDecoration: 'none',
            }}
          >
            Go to Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}
