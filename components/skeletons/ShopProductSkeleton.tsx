import React from 'react'
import { SkeletonLine, SkeletonBlock, SkeletonButton } from './SkeletonPrimitives'
import './skeleton.css'

/**
 * ShopProductSkeleton — mirrors product detail:
 * Back link → 2-col (image gallery + product info)
 * Columns stack on mobile with product info below image.
 */
export default function ShopProductSkeleton() {
  return (
    <div className="skel-page" aria-label="Loading product" aria-busy="true" aria-hidden="true">
      <div className="skel-section skel-section--wide" style={{ paddingTop: '6rem' }}>
        <SkeletonLine width="140px" height={14} style={{ marginBottom: 32 }} />

        <div className="skel-grid skel-grid--2col">
          {/* ── Image gallery ── */}
          <div>
            <SkeletonBlock height={500} radius={24} style={{ marginBottom: 16 }} />
            <div className="skel-row" style={{ gap: 12 }}>
              {[...Array(4)].map((_, i) => (
                <SkeletonBlock key={i} width={80} height={80} radius={12} />
              ))}
            </div>
          </div>

          {/* ── Product info ── */}
          <div>
            <div className="skel-row skel-mb-md" style={{ gap: 8 }}>
              <SkeletonLine width="80px" height={24} style={{ borderRadius: 50 }} />
              <SkeletonLine width="100px" height={24} style={{ borderRadius: 50 }} />
            </div>
            <SkeletonLine width="85%" height={40} style={{ marginBottom: 8 }} />
            <div className="skel-row skel-mb-lg" style={{ gap: 24 }}>
              <SkeletonLine width="100px" height={32} />
              <SkeletonLine width="120px" height={16} />
            </div>
            <SkeletonLine width="100%" height={14} style={{ marginBottom: 6 }} />
            <SkeletonLine width="90%" height={14} style={{ marginBottom: 6 }} />
            <SkeletonLine width="75%" height={14} style={{ marginBottom: 32 }} />

            {/* Size selector */}
            <SkeletonLine width="90px" height={12} style={{ marginBottom: 12 }} />
            <div className="skel-row skel-mb-xl" style={{ gap: 10 }}>
              {[...Array(5)].map((_, i) => (
                <SkeletonBlock key={i} width={56} height={40} radius={8} />
              ))}
            </div>

            {/* Action bar */}
            <div style={{ padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="skel-row skel-row--between skel-mb-md">
                <SkeletonBlock width={120} height={40} radius={8} />
                <SkeletonLine width="120px" height={14} />
              </div>
              <SkeletonButton width="100%" height={48} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
