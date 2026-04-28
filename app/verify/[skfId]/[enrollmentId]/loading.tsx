export default function VerifyCertificateLoading() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#05080f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: 'min(560px, 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '16px',
          padding: '2rem',
        }}
      >
        <div
          style={{
            height: '1.15rem',
            width: '60%',
            borderRadius: '999px',
            background: 'rgba(46, 204, 113, 0.22)',
            marginBottom: '1.25rem',
          }}
        />
        <div
          style={{
            height: '0.95rem',
            width: '82%',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.14)',
            marginBottom: '1.5rem',
          }}
        />
        <div
          style={{
            display: 'grid',
            gap: '0.8rem',
          }}
        >
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              style={{
                height: '2.8rem',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.08)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
