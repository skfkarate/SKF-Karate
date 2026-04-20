'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

function beltLabel(v: string) {
  return String(v || '').replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase())
}

function ProfileSvg({ size = 60 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function getDailyIndex(length: number): number {
  const now = new Date()
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
  return dayOfYear % length
}

export default function DanCarousel({ danHolders }: { danHolders: any[] }) {
  const [centerIdx, setCenterIdx] = useState(0)

  useEffect(() => {
    if (danHolders.length > 0) {
      setCenterIdx(getDailyIndex(danHolders.length))
    }
  }, [danHolders.length])

  if (danHolders.length === 0) return null

  const handleNext = () => {
    setCenterIdx(prev => (prev + 1) % danHolders.length)
  }

  const handlePrev = () => {
    setCenterIdx(prev => (prev - 1 + danHolders.length) % danHolders.length)
  }

  const n = danHolders.length
  const MAX_VISIBLE = 5

  // We want to extract exactly MAX_VISIBLE items based on the current centerIdx
  // Order: center, next 1 right, next 1 left, next 2 right, next 2 left.
  const carouselOrder: { athlete: any; depth: number }[] = []
  
  if (n > 0) {
    const ordered: number[] = [centerIdx]
    let left = 1, right = 1
    // Loop to gather max items minus 1 (the center)
    for (let i = 1; i < Math.min(n, MAX_VISIBLE); i++) {
        if (i % 2 === 1) {
            ordered.push((centerIdx + right) % n)
            right++
        } else {
            ordered.unshift((centerIdx - left + n) % n)
            left++
        }
    }

    const currentCenterPos = ordered.indexOf(centerIdx)
    for (let i = 0; i < ordered.length; i++) {
        const dist = Math.abs(i - currentCenterPos)
        carouselOrder.push({ athlete: danHolders[ordered[i]], depth: dist })
    }
  }

  return (
    <div className="hon-carousel-wrapper">
      <button className="hon-carousel-btn hon-carousel-btn--prev" onClick={handlePrev} aria-label="Previous Profile">
        <FaChevronLeft />
      </button>

      <div className="hon-carousel">
        {carouselOrder.map(({ athlete, depth }) => (
          <Link
            key={athlete.id}
            href={`/athlete/${athlete.registrationNumber}`}
            className={`hon-ccard hon-ccard--d${Math.min(depth, 2)}`}
          >
            <div className="hon-ccard__photo">
              {athlete.photoUrl ? (
                <img src={athlete.photoUrl} alt={`${athlete.firstName} ${athlete.lastName}`} />
              ) : (
                <ProfileSvg size={depth === 0 ? 70 : depth === 1 ? 55 : 42} />
              )}
            </div>
            <div className="hon-ccard__badge">{beltLabel(athlete.currentBelt)}</div>
            <h3 className="hon-ccard__name">{athlete.firstName} {athlete.lastName}</h3>
            <span className="hon-ccard__branch">SKF {athlete.branchName}</span>
            {depth === 0 && (
              <span className="hon-ccard__featured">Featured</span>
            )}
          </Link>
        ))}
      </div>

      <button className="hon-carousel-btn hon-carousel-btn--next" onClick={handleNext} aria-label="Next Profile">
        <FaChevronRight />
      </button>
    </div>
  )
}
