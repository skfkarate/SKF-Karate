import '../results.css'
import ResultsDetailDashboard from '@/app/_components/results/detail/ResultsDetailDashboard'
import ResultsDetailHero from '@/app/_components/results/detail/ResultsDetailHero'

export default function ResultsDetailPageClient({ tournament }: { tournament: { level: string; date: string; name: string; venue: string; city: string; totalParticipants: number; skfParticipants: number; medals: { gold: number; silver: number; bronze: number }; winners: { id: string; athleteName: string; category: string; branchName: string; medal: 'gold' | 'silver' | 'bronze'; position: number; skfId?: string; ageGroup: string; wins?: number | null }[] } }) {
  return (
    <>
      <div className="res-watermark" style={{ zIndex: 0, position: 'fixed' }}>SKF</div>
      <div style={{ position: 'relative', zIndex: 2 }}>

        <ResultsDetailHero tournament={tournament} />
        <div style={{ marginBottom: '6rem' }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <ResultsDetailDashboard tournament={tournament as any} />
        </div>
      </div>
    </>
  )
}
