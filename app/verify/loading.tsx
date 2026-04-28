export default function VerifyLoading() {
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
            height: '1rem',
            width: '45%',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.16)',
            marginBottom: '1rem',
          }}
        />
        <div
          style={{
            height: '2.75rem',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.08)',
            marginBottom: '1rem',
          }}
        />
        <div
          style={{
            height: '2.75rem',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.08)',
            width: '40%',
          }}
        />
      </div>
    </div>
  )
}
