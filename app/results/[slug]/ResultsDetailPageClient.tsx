import '../results.css'
import ResultsDetailDashboard from '@/app/_components/results/detail/ResultsDetailDashboard'
import ResultsDetailHero from '@/app/_components/results/detail/ResultsDetailHero'

export default function ResultsDetailPageClient({ tournament }) {
  return (
    <>
      <div className="res-watermark" style={{ zIndex: 0, position: 'fixed' }}>SKF</div>
      <div style={{ position: 'relative', zIndex: 2 }}>

        <ResultsDetailHero tournament={tournament} />
        <div style={{ marginBottom: '6rem' }}>
          <ResultsDetailDashboard tournament={tournament} />
        </div>
      </div>
    </>
  )
}
