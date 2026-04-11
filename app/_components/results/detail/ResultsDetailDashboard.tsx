import MedalTally from '@/app/_components/results/MedalTally'
import ResultsTable from '@/app/_components/results/ResultsTable'

export default function ResultsDetailDashboard({ tournament }) {
  return (
    <section
      style={{
        padding: '0 0 100px',
        position: 'relative',
        background: 'linear-gradient(180deg, var(--bg-body) 0%, rgba(5,8,16,1) 100%)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 1200,
          height: 400,
          background:
            'radial-gradient(ellipse at center top, rgba(255,183,3,0.04) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
        <div
          style={{
            background: 'linear-gradient(180deg, rgba(15,23,42,0.65) 0%, rgba(8,11,20,0.75) 100%)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 32,
            padding: 'clamp(2rem, 4vw, 3.5rem)',
            boxShadow:
              '0 30px 60px -15px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.03)',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 400,
              background:
                'radial-gradient(ellipse at 50% -20%, rgba(255,255,255,0.025) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          <div
            style={{
              textAlign: 'center',
              marginBottom: 'clamp(2rem, 3vw, 3rem)',
              position: 'relative',
            }}
          >
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'clamp(1.6rem, 2.5vw, 2rem)',
                fontWeight: 800,
                color: '#fff',
                lineHeight: 1.2,
                marginBottom: 8,
              }}
            >
              Tournament Dashboard
            </h2>
            <p
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase',
                letterSpacing: 2.5,
                fontWeight: 600,
              }}
            >
              Official Results & Medal Standings
            </p>
          </div>

          <MedalTally medals={tournament.medals} />

          <div
            style={{
              height: 1,
              width: '100%',
              background:
                'linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)',
              margin: 'clamp(2rem, 3vw, 3.5rem) 0',
            }}
          />

          <ResultsTable winners={tournament.winners} />
        </div>
      </div>
    </section>
  )
}
