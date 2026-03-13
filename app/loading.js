export default function Loading() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '60vh',
      width: '100%',
      backgroundColor: 'var(--bg-body)'
    }}>
      <div style={{
        width: '50px',
        height: '50px',
        border: '3px solid rgba(255, 183, 3, 0.1)',
        borderTop: '3px solid var(--crimson)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }}></div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={{
        marginTop: '1.5rem',
        fontFamily: 'var(--font-heading)',
        color: 'var(--gold)',
        letterSpacing: '3px',
        textTransform: 'uppercase',
        fontSize: '0.85rem',
        fontWeight: '600',
        animation: 'pulse 1.5s ease-in-out infinite alternate'
      }}>
        Loading...
      </div>
      <style>{`
        @keyframes pulse {
          0% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
