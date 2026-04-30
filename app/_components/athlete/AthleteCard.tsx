import Link from 'next/link'
import Image from 'next/image'
import type { CSSProperties } from 'react'

/**
 * AthleteCard — Reusable full-photo athlete card
 * Used on: Honours Board, Homepage spotlight
 */

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
    <div className="ath-card" style={{ '--ath-accent': medalColor } as CSSProperties}>
      <div className="ath-card__photo-wrap" style={{ position: 'relative' }}>
        <Image className="ath-card__img" src={photoUrl || fallbackPhoto} alt={name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 768px) 100vw, 300px" />
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
    return <Link href={href} className="ath-card__link">{card}</Link>
  }
  return card
}
