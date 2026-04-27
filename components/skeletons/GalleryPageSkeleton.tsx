import React from 'react'
import { SkeletonLine, SkeletonBlock } from './SkeletonPrimitives'

/**
 * GalleryPageSkeleton — mirrors gallery-page layout:
 * Hero (badge + title + stats row) → Filter bar → Section header → Masonry grid
 */
export default function GalleryPageSkeleton() {
  return (
    <div className="gallery-page" aria-label="Loading gallery" aria-busy="true" aria-hidden="true" style={{ paddingTop: '5rem' }}>
      {/* ── Hero ── */}
      <section style={{ textAlign: 'center', padding: '4rem 2rem 3rem', maxWidth: 700, margin: '0 auto' }}>
        <SkeletonLine width="160px" height={28} style={{ borderRadius: 50, margin: '0 auto 20px' }} />
        <SkeletonLine width="280px" height={48} style={{ margin: '0 auto 12px' }} />
        <SkeletonLine width="80%" height={16} style={{ margin: '0 auto 32px' }} />
        {/* Stats row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <SkeletonLine width="40px" height={28} style={{ margin: '0 auto 4px' }} />
            <SkeletonLine width="50px" height={12} style={{ margin: '0 auto' }} />
          </div>
          <SkeletonBlock width={1} height={30} radius={0} />
          <div style={{ textAlign: 'center' }}>
            <SkeletonLine width="30px" height={28} style={{ margin: '0 auto 4px' }} />
            <SkeletonLine width="70px" height={12} style={{ margin: '0 auto' }} />
          </div>
          <SkeletonBlock width={1} height={30} radius={0} />
          <div style={{ textAlign: 'center' }}>
            <SkeletonLine width="25px" height={28} style={{ margin: '0 auto 4px' }} />
            <SkeletonLine width="60px" height={12} style={{ margin: '0 auto' }} />
          </div>
        </div>
      </section>

      {/* ── Filter Bar ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem 1rem' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
          {[...Array(6)].map((_, i) => (
            <SkeletonLine key={i} width={`${70 + i * 10}px`} height={34} style={{ borderRadius: 50 }} />
          ))}
        </div>

        {/* Section header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <SkeletonLine width="180px" height={28} />
          <SkeletonLine width="80px" height={14} />
        </div>

        {/* ── Masonry Grid ── */}
        <div style={{ columns: '3 300px', columnGap: 16 }}>
          {[220, 300, 180, 280, 200, 320, 240, 260, 190, 310, 230, 270].map((h, i) => (
            <SkeletonBlock key={i} height={h} radius={12} style={{ marginBottom: 16, breakInside: 'avoid' }} />
          ))}
        </div>
      </div>
    </div>
  )
}
