export default function PortalLoading() {
  return (
    <div className="hub-layout">
      <div style={{
        height: '64px',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }} />
      <main className="hub-main">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          color: 'rgba(255,255,255,0.3)',
          fontSize: '0.9rem',
        }}>
          Loading...
        </div>
      </main>
    </div>
  )
}
