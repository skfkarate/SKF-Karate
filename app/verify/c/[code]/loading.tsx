import '@/components/skeletons/skeleton.css'
import './certificate-publishing.css'

export default function VerifyCodeLoading() {
  return (
    <div className="cv-page">
      <div className="cv-card">
        <div className="cv-card__shine" />
        <div style={{ textAlign: 'center' }}>
          <div className="sk-surface" style={{ width: 72, height: 72, borderRadius: '50%', margin: '0 auto 1.25rem' }} />
          <div className="sk-surface" style={{ width: 160, height: 24, borderRadius: 999, margin: '0 auto 1.25rem' }} />
          <div className="sk-surface" style={{ width: '80%', height: 28, borderRadius: 8, margin: '0 auto 0.5rem' }} />
          <div className="sk-surface" style={{ width: '60%', height: 18, borderRadius: 6, margin: '0 auto 1.75rem' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.6rem', marginBottom: '1.75rem' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} className="sk-surface" style={{ height: 72, borderRadius: 14 }} />
          ))}
        </div>
        <div className="cv-divider" />
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.6rem', marginBottom: '1.75rem' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="sk-surface" style={{ height: 52, borderRadius: 12 }} />
          ))}
        </div>
        <div className="sk-surface" style={{ width: 180, height: 44, borderRadius: 12, margin: '0 auto' }} />
      </div>
    </div>
  )
}
