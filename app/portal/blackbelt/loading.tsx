export default function BlackBeltLoading() {
  return (
    <div style={{ padding: '2rem 1rem 6rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      {/* Hero skeleton */}
      <div style={{ paddingTop: '3rem', marginBottom: '3rem', textAlign: 'center' }}>
        <div style={{ width: '60%', height: '3.5rem', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', margin: '0 auto 1rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ width: '40%', height: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', margin: '0 auto' }} />
      </div>
      {/* Timeline skeleton */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', overflow: 'hidden' }}>
        {[1,2,3,4,5].map(i => (
          <div key={i} style={{ flex: '0 0 160px', height: '100px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', animation: `pulse 1.5s ease-in-out infinite ${i * 0.1}s` }} />
        ))}
      </div>
      {/* Grid skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} style={{ height: '180px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', animation: `pulse 1.5s ease-in-out infinite ${i * 0.08}s` }} />
        ))}
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }` }} />
    </div>
  )
}
