import '../results.css'
import ResultsDetailDashboard from '@/app/_components/results/detail/ResultsDetailDashboard'
import ResultsDetailHero from '@/app/_components/results/detail/ResultsDetailHero'

export default function ResultsDetailPageClient({ tournament }) {
  return (
    <>
      <ResultsDetailHero tournament={tournament} />
      <ResultsDetailDashboard tournament={tournament} />
    </>
  )
}
