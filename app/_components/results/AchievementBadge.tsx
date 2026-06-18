export default function AchievementBadge({ medal }: { medal: 'gold' | 'silver' | 'bronze' }) {
  const labels = { gold: 'Gold', silver: 'Silver', bronze: 'Bronze' }

  return (
    <span
      className={`achievement-badge achievement-badge--${medal}`}
      aria-label={`${labels[medal]} medal`}
    >
      {labels[medal]}
    </span>
  )
}
