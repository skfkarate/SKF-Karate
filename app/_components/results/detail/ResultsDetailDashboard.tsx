import ResultsTable from '@/app/_components/results/ResultsTable'

type DetailTournamentWinner = {
  id: string
  athleteName: string
  category: string
  branchName: string
  medal: 'gold' | 'silver' | 'bronze'
  position: number
  skfId?: string
  ageGroup: string
  wins: number
}

export default function ResultsDetailDashboard({ tournament }: { tournament: { winners: DetailTournamentWinner[] } }) {
  return (
    <section className="td-dashboard">
      <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: 1100 }}>
        <ResultsTable winners={tournament.winners} />
      </div>
    </section>
  )
}
