export default function StatsStrip({ stats }) {
  return (
    <div className="stats-strip">
      <div className="stats-strip__grid">
        <div className="stats-strip__item">
          <span className="stats-strip__number">{stats.totalTournaments}</span>
          <span className="stats-strip__label">Tournaments</span>
        </div>
        <div className="stats-strip__divider"></div>
        <div className="stats-strip__item">
          <span className="stats-strip__number">{stats.totalMedals}</span>
          <span className="stats-strip__label">Total Medals</span>
        </div>
        <div className="stats-strip__divider"></div>
        <div className="stats-strip__item">
          <span className="stats-strip__number">{stats.nationalChampions}</span>
          <span className="stats-strip__label">National & Int'l Medals</span>
        </div>
        <div className="stats-strip__divider"></div>
        <div className="stats-strip__item">
          <span className="stats-strip__number">{stats.yearsActive}</span>
          <span className="stats-strip__label">Years of History</span>
        </div>
      </div>
    </div>
  )
}
