import ResultsTable from '@/app/_components/results/ResultsTable'

export default function ResultsDetailDashboard({ tournament }) {
  return (
    <section className="td-dashboard">
      <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: 1100 }}>
        <ResultsTable winners={tournament.winners} />
      </div>
    </section>
  )
}
