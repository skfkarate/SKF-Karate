import React from 'react'
import { SkeletonLine, SkeletonBlock, SkeletonButton, SkeletonCircle } from './SkeletonPrimitives'

/**
 * EventsPageSkeleton — mirrors events-page layout:
 * Hero (badge + title + subtitle + countdown) → Toolbar (tabs + filters) → Timeline with event cards
 */
export default function EventsPageSkeleton() {
  return (
    <div className="events-page" aria-label="Loading events" aria-busy="true" aria-hidden="true" style={{ paddingTop: '5rem' }}>
      {/* ── Hero ── */}
      <section style={{ textAlign: 'center', padding: '4rem 2rem 3rem', maxWidth: 700, margin: '0 auto' }}>
        <SkeletonLine width="150px" height={28} style={{ borderRadius: 50, margin: '0 auto 20px' }} />
        <SkeletonLine width="260px" height={48} style={{ margin: '0 auto 12px' }} />
        <SkeletonLine width="80%" height={16} style={{ margin: '0 auto 32px' }} />

        {/* Countdown block */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <SkeletonBlock width={60} height={60} radius={12} style={{ marginBottom: 4 }} />
              <SkeletonLine width="40px" height={10} style={{ margin: '0 auto' }} />
            </div>
          ))}
        </div>
        <SkeletonLine width="200px" height={16} style={{ margin: '0 auto 6px' }} />
        <SkeletonLine width="160px" height={13} style={{ margin: '0 auto' }} />
      </section>

      {/* ── Toolbar ── */}
      <div style={{ position: 'sticky', top: 0, padding: '12px 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(3,5,8,0.95)', backdropFilter: 'blur(12px)', zIndex: 10, maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <SkeletonButton width={100} height={36} />
            <SkeletonButton width={80} height={36} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[...Array(4)].map((_, i) => (
              <SkeletonButton key={i} width={80} height={30} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Event Timeline ── */}
      <section style={{ padding: '2rem', maxWidth: 1280, margin: '0 auto' }}>
        {/* Month header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <SkeletonCircle size={12} />
          <SkeletonLine width="150px" height={18} />
          <SkeletonLine width="60px" height={14} />
        </div>

        {/* Event cards */}
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 24, padding: 20, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
            {/* Date */}
            <div style={{ textAlign: 'center', minWidth: 50 }}>
              <SkeletonLine width="40px" height={12} style={{ margin: '0 auto 4px' }} />
              <SkeletonLine width="30px" height={28} style={{ margin: '0 auto' }} />
            </div>
            {/* Connector */}
            <div style={{ width: 2, minHeight: 80, background: 'rgba(255,255,255,0.05)', borderRadius: 1 }} />
            {/* Content */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <SkeletonLine width="80px" height={22} style={{ borderRadius: 50 }} />
              </div>
              <SkeletonLine width="75%" height={20} style={{ marginBottom: 8 }} />
              <SkeletonLine width="100%" height={13} style={{ marginBottom: 4 }} />
              <SkeletonLine width="60%" height={13} style={{ marginBottom: 16 }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 16 }}>
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
