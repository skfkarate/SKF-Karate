/**
 * AthleteCard — Reusable full-photo athlete card
 * Used on: Honours Board, Homepage spotlight
 */

function ProfileSvg({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

type AthleteCardProps = {
  name: string
  belt: string
  branch: string
  photoUrl?: string
  gender?: string
  category?: string
  medal?: 'gold' | 'silver' | 'bronze'
  href?: string
}

export default function AthleteCard({ name, belt, branch, photoUrl, gender, category, medal, href }: AthleteCardProps) {
  const medalColor = medal === 'gold' ? '#ffd700' : medal === 'silver' ? '#c0c0c0' : medal === 'bronze' ? '#cd7f32' : '#ffb703'
  const fallbackPhoto = gender?.toLowerCase() === 'female' ? '/no-profile/no profile female.png' : '/no-profile/no profile male.png'

  const card = (
    <div className="ath-card" style={{ '--ath-accent': medalColor } as any}>
      <div className="ath-card__photo-wrap">
        <img className="ath-card__img" src={photoUrl || fallbackPhoto} alt={name} />
      </div>
      {medal && (
        <span className="ath-card__medal">
          {medal === 'gold' ? '🥇' : medal === 'silver' ? '🥈' : '🥉'}
        </span>
      )}
      <h3 className="ath-card__name">{name}</h3>
      <span className="ath-card__belt">{belt}</span>
      <span className="ath-card__branch">{branch}</span>
      {category && <span className="ath-card__cat">{category}</span>}
    </div>
  )

  if (href) {
    return <a href={href} className="ath-card__link">{card}</a>
  }
  return card
}
