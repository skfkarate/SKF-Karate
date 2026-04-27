import React from 'react'
import { SkeletonLine, SkeletonBlock, SkeletonCircle, SkeletonButton } from './SkeletonPrimitives'

/**
 * ClassesPageSkeleton — mirrors obs-page layout:
 * Hero (badge + title + sub + 3 stats) → Section header → 4 city cards → 2 CTA cards
 */
export default function ClassesPageSkeleton() {
  return (
    <div className="obs-page" aria-label="Loading classes" aria-busy="true" aria-hidden="true" style={{ paddingTop: '6rem' }}>
      {/* ── Hero ── */}
      <section style={{ textAlign: 'center', padding: '4rem 2rem 3rem', maxWidth: 700, margin: '0 auto' }}>
        {/* Badge */}
        <SkeletonLine width="200px" height={28} style={{ borderRadius: 50, margin: '0 auto 24px' }} />
        {/* Title */}
        <SkeletonLine width="240px" height={24} style={{ margin: '0 auto 8px' }} />
        <SkeletonLine width="300px" height={56} style={{ margin: '0 auto 20px' }} />
        {/* Subtitle */}
        <SkeletonLine width="90%" height={16} style={{ margin: '0 auto 6px' }} />
        <SkeletonLine width="70%" height={16} style={{ margin: '0 auto 32px' }} />
        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48 }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <SkeletonLine width="50px" height={36} style={{ margin: '0 auto 6px' }} />
              <SkeletonLine width="60px" height={14} style={{ margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── Section Header ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <SkeletonBlock width={4} height={24} radius={2} />
          <SkeletonLine width="120px" height={20} />
        </div>

        {/* ── City Grid (4 cards) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: 64 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
              <SkeletonBlock height={220} radius={0} />
              <div style={{ padding: 20 }}>
                <SkeletonLine width="40%" height={12} style={{ marginBottom: 8 }} />
                <SkeletonLine width="70%" height={24} style={{ marginBottom: 12 }} />
                <SkeletonLine width="55%" height={14} style={{ marginBottom: 16 }} />
                <SkeletonLine width="130px" height={14} />
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, paddingBottom: 64 }}>
          {[...Array(2)].map((_, i) => (
            <div key={i} style={{ padding: 32, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
              <SkeletonCircle size={48} />
              <SkeletonLine width="60%" height={22} style={{ margin: '16px 0 8px' }} />
              <SkeletonLine width="100%" height={14} style={{ marginBottom: 6 }} />
              <SkeletonLine width="80%" height={14} style={{ marginBottom: 20 }} />
              <SkeletonButton width={140} height={40} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
