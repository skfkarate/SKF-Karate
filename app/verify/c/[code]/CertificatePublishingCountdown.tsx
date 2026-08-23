'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

type TimeRemaining = {
  days: number
  hours: number
  minutes: number
  seconds: number
  completed: boolean
}

function calculateRemaining(targetIso: string): TimeRemaining {
  const target = new Date(targetIso).getTime()
  const diff = Math.max(0, target - Date.now())

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    completed: diff <= 0,
  }
}

function twoDigit(value: number) {
  return String(value).padStart(2, '0')
}

export function CertificatePublishingCountdown({ targetIso }: { targetIso: string }) {
  const [remaining, setRemaining] = useState<TimeRemaining | null>(null)

  useEffect(() => {
    setRemaining(calculateRemaining(targetIso))
    const interval = window.setInterval(() => {
      setRemaining(calculateRemaining(targetIso))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [targetIso])

  if (!remaining) {
    return <div className="cv-countdown" style={{ opacity: 0 }} aria-hidden="true" />
  }

  if (remaining.completed) {
    return (
      <div className="cv-countdown--done">
        <CheckCircle2 size={20} />
        <span>Certificate publishing is now active</span>
      </div>
    )
  }

  const units = [
    { value: remaining.days, label: 'Days' },
    { value: remaining.hours, label: 'Hours' },
    { value: remaining.minutes, label: 'Min' },
    { value: remaining.seconds, label: 'Sec' },
  ]

  return (
    <div className="cv-countdown" aria-label="Certificate publishing countdown">
      {units.map(({ value, label }) => (
        <div className="cv-countdown__unit" key={label}>
          <strong className="cv-countdown__digit">{twoDigit(value)}</strong>
          <span className="cv-countdown__label">{label}</span>
        </div>
      ))}
    </div>
  )
}
