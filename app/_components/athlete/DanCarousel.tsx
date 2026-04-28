'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

function beltLabel(v: string) {
  return String(v || '').replace(/-/g, ' ').replace(/\b\w/g, m => m.toUpperCase())
}

function getCardHref(holder: any) {
  if (holder?.profileHref) return holder.profileHref
  if (holder?.registrationNumber) return `/athlete/${holder.registrationNumber}`
  return '/athlete/search'
}

function getCardName(holder: any) {
  if (holder?.displayName) return holder.displayName
  if (holder?.name) return holder.name
  return `${holder?.firstName || ''} ${holder?.lastName || ''}`.trim()
}

function getCardBadge(holder: any) {
  if (holder?.danLabel) return holder.danLabel
  if (holder?.dan) return holder.dan
  return beltLabel(holder?.currentBelt)
}

function getCardSubtitle(holder: any) {
  if (holder?.subtitle) return holder.subtitle
  if (holder?.assignments?.[0]?.branchName) return `SKF ${holder.assignments[0].branchName}`
  if (holder?.branchName) return `SKF ${holder.branchName}`
  return holder?.title || 'SKF Karate'
}

function getCardImage(holder: any) {
  return (
    holder?.imageUrl ||
    holder?.photoUrl ||
    (holder?.gender?.toLowerCase() === 'female'
      ? '/no-profile/no profile female.png'
      : '/no-profile/no profile male.png')
  )
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
            href={getCardHref(athlete)}
            className={`hon-ccard hon-ccard--d${Math.min(depth, 2)}`}
          >
            <div className="hon-ccard__photo" style={{ position: 'relative' }}>
              <Image 
                src={getCardImage(athlete)}
                alt={getCardName(athlete)}
                fill
                style={{ objectFit: 'cover' }}
                sizes="(max-width: 768px) 100vw, 300px"
              />
            </div>
            <div className="hon-ccard__badge">{getCardBadge(athlete)}</div>
            <h3 className="hon-ccard__name">{getCardName(athlete)}</h3>
            <span className="hon-ccard__branch">{getCardSubtitle(athlete)}</span>
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
