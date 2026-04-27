import React from 'react'
import { SkeletonLine, SkeletonBlock, SkeletonButton } from './SkeletonPrimitives'

/**
 * ShopPageSkeleton — mirrors shop listing: Header → Filter tabs → Product grid
 */
export default function ShopPageSkeleton() {
  return (
    <div aria-label="Loading shop" aria-busy="true" aria-hidden="true" style={{ paddingTop: '6rem', maxWidth: 1280, margin: '0 auto', padding: '6rem 2rem 4rem' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <SkeletonLine width="200px" height={40} style={{ margin: '0 auto 12px' }} />
        <SkeletonLine width="80%" height={16} style={{ margin: '0 auto 6px', maxWidth: 500 }} />
        <SkeletonLine width="60%" height={16} style={{ margin: '0 auto', maxWidth: 400 }} />
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
        {[...Array(5)].map((_, i) => (
          <SkeletonLine key={i} width={`${70 + i * 12}px`} height={36} style={{ borderRadius: 8 }} />
        ))}
      </div>

      {/* Product grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
            <SkeletonBlock height={300} radius={0} />
            <div style={{ padding: 20 }}>
              <SkeletonLine width="50%" height={11} style={{ marginBottom: 8 }} />
              <SkeletonLine width="80%" height={20} style={{ marginBottom: 12 }} />
              <SkeletonLine width="80px" height={22} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
