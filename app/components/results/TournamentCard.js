import Link from 'next/link'
import { FaArrowRight } from 'react-icons/fa'
import { TOURNAMENT_LEVEL_LABELS } from '../../../lib/types/tournament'

export default function TournamentCard({ tournament }) {
  const t = tournament
  const year = new Date(t.date).getFullYear()

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <Link href={`/results/${t.slug}`} className="tournament-card animate-in delay-2">
      <div className="tournament-card__header">
        <div className="tournament-card__badges">
          <span className={`tournament-card__level-badge tournament-card__level-badge--${t.level}`}>
            {TOURNAMENT_LEVEL_LABELS[t.level]}
          </span>
          {t.isFeatured && (
            <span className="tournament-card__featured">★ Featured</span>
          )}
        </div>
        <span className="tournament-card__year">{year}</span>
      </div>

      <div className="tournament-card__body">
        <h3 className="tournament-card__name">{t.name}</h3>
        <p className="tournament-card__meta">
          {t.venue}, {t.city} · {formatDate(t.date)}
          {t.endDate && ` – ${formatDate(t.endDate)}`}
        </p>

        <div className="tournament-card__divider"></div>

        <div className="tournament-card__footer">
          <div className="tournament-card__medals">
            <span className="tournament-card__medal tournament-card__medal--gold">
              <span className="tournament-card__medal-dot tournament-card__medal-dot--gold"></span>
              {t.medals.gold}
            </span>
            <span className="tournament-card__medal tournament-card__medal--silver">
              <span className="tournament-card__medal-dot tournament-card__medal-dot--silver"></span>
              {t.medals.silver}
            </span>
            <span className="tournament-card__medal tournament-card__medal--bronze">
              <span className="tournament-card__medal-dot tournament-card__medal-dot--bronze"></span>
              {t.medals.bronze}
            </span>
          </div>
          <span className="tournament-card__athletes">{t.skfParticipants} athletes</span>
        </div>
      </div>

      <div className="tournament-card__link">
        <span>View Results</span>
        <FaArrowRight />
      </div>
    </Link>
  )
}
