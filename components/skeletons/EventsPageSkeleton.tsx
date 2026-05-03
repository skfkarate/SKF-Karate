import React from 'react'
import { SkeletonLine, SkeletonBlock, SkeletonButton, SkeletonCircle } from './SkeletonPrimitives'
import './skeleton.css'

/**
 * EventsPageSkeleton — mirrors events-page layout:
 * Hero (badge + title + subtitle + countdown) → Toolbar (tabs + filters) → Timeline with event cards
 * Event rows stack on mobile; toolbar wraps gracefully.
 */
export default function EventsPageSkeleton() {
  return (
    <div className="skel-page" aria-label="Loading events" aria-busy="true" aria-hidden="true">
      {/* ── Hero ── */}
      <section className="skel-hero">
        <SkeletonLine width="150px" height={28} style={{ borderRadius: 50, marginBottom: 20 }} />
        <SkeletonLine width="min(70%, 260px)" height={48} style={{ marginBottom: 12 }} />
        <SkeletonLine width="min(80%, 400px)" height={16} style={{ marginBottom: 32 }} />

        {/* Countdown block */}
        <div className="skel-row skel-row--center" style={{ gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <SkeletonBlock width={60} height={60} radius={12} style={{ marginBottom: 4 }} />
              <SkeletonLine width="40px" height={10} style={{ margin: '0 auto' }} />
            </div>
          ))}
        </div>
        <SkeletonLine width="200px" height={16} style={{ marginBottom: 6 }} />
        <SkeletonLine width="160px" height={13} />
      </section>

      {/* ── Toolbar ── */}
      <div className="skel-toolbar">
        <div className="skel-toolbar__inner">
          <div className="skel-row" style={{ gap: 8 }}>
            <SkeletonButton width={100} height={36} />
            <SkeletonButton width={80} height={36} />
          </div>
          <div className="skel-row skel-row--wrap" style={{ gap: 8 }}>
            {[...Array(4)].map((_, i) => (
              <SkeletonButton key={i} width={80} height={30} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Event Timeline ── */}
      <section className="skel-section skel-section--wide">
        {/* Month header */}
        <div className="skel-row skel-mb-lg" style={{ gap: 12 }}>
          <SkeletonCircle size={12} />
          <SkeletonLine width="150px" height={18} />
          <SkeletonLine width="60px" height={14} />
        </div>

        {/* Event cards */}
        {[...Array(5)].map((_, i) => (
          <div className="skel-event-row" key={i}>
            {/* Date */}
            <div style={{ textAlign: 'center', minWidth: 50, flexShrink: 0 }}>
              <SkeletonLine width="40px" height={12} style={{ margin: '0 auto 4px' }} />
              <SkeletonLine width="30px" height={28} style={{ margin: '0 auto' }} />
            </div>
            {/* Content */}
            <div className="skel-flex-1">
              <div className="skel-row skel-mb-sm" style={{ gap: 8 }}>
                <SkeletonLine width="80px" height={22} style={{ borderRadius: 50 }} />
              </div>
              <SkeletonLine width="75%" height={20} style={{ marginBottom: 8 }} />
              <SkeletonLine width="100%" height={13} style={{ marginBottom: 4 }} />
              <SkeletonLine width="60%" height={13} style={{ marginBottom: 16 }} />
              <div className="skel-row skel-row--between skel-row--wrap" style={{ gap: 8 }}>
                <div className="skel-row" style={{ gap: 16 }}>
                  <SkeletonLine width="120px" height={13} />
                  <SkeletonLine width="80px" height={13} />
                </div>
                <SkeletonButton width={110} height={32} />
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
