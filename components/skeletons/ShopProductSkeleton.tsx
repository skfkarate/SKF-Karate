import React from 'react'
import { SkeletonLine, SkeletonBlock, SkeletonButton } from './SkeletonPrimitives'

/**
 * ShopProductSkeleton — mirrors product detail: Back link → 2-col (image gallery + product info)
 */
export default function ShopProductSkeleton() {
  return (
    <div aria-label="Loading product" aria-busy="true" aria-hidden="true" style={{ maxWidth: 1280, margin: '0 auto', padding: '6rem 2rem 4rem' }}>
      <SkeletonLine width="140px" height={14} style={{ marginBottom: 32 }} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
        {/* Image gallery */}
        <div>
          <SkeletonBlock height={500} radius={24} style={{ marginBottom: 16 }} />
          <div style={{ display: 'flex', gap: 12 }}>
            {[...Array(4)].map((_, i) => (
              <SkeletonBlock key={i} width={80} height={80} radius={12} />
            ))}
          </div>
        </div>

        {/* Product info */}
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <SkeletonLine width="80px" height={24} style={{ borderRadius: 50 }} />
            <SkeletonLine width="100px" height={24} style={{ borderRadius: 50 }} />
          </div>
          <SkeletonLine width="85%" height={40} style={{ marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginBottom: 20 }}>
            <SkeletonLine width="100px" height={32} />
            <SkeletonLine width="120px" height={16} />
          </div>
          <SkeletonLine width="100%" height={14} style={{ marginBottom: 6 }} />
          <SkeletonLine width="90%" height={14} style={{ marginBottom: 6 }} />
          <SkeletonLine width="75%" height={14} style={{ marginBottom: 32 }} />

          {/* Size selector */}
          <SkeletonLine width="90px" height={12} style={{ marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
            {[...Array(5)].map((_, i) => (
              <SkeletonBlock key={i} width={56} height={40} radius={8} />
            ))}
          </div>

          {/* Action bar */}
          <div style={{ padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <SkeletonBlock width={120} height={40} radius={8} />
              <SkeletonLine width="120px" height={14} />
            </div>
            <SkeletonButton width={400} height={48} />
          </div>
        </div>
      </div>
    </div>
  )
}
