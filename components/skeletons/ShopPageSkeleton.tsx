import React from 'react'
import { SkeletonLine, SkeletonBlock } from './SkeletonPrimitives'
import './skeleton.css'

/**
 * ShopPageSkeleton — mirrors shop listing:
 * Header → Filter tabs → Product grid
 * Product grid collapses to single column on mobile.
 */
export default function ShopPageSkeleton() {
  return (
    <div className="skel-page skel-shop-shell" aria-label="Loading shop" aria-busy="true" aria-hidden="true">
      <div className="skel-shop-wrap">
        <header className="skel-shop-listing__header">
          <SkeletonLine className="skel-shop-listing__title" width="min(72vw, 390px)" height={84} />
          <SkeletonLine width="min(86vw, 680px)" height={15} style={{ margin: '1.5rem auto 8px' }} />
          <SkeletonLine width="min(64vw, 500px)" height={15} style={{ margin: '0 auto' }} />
        </header>

        <div className="skel-shop-listing__filters">
          {[76, 92, 84, 118, 88].map((width, i) => (
            <SkeletonLine key={i} width={width} height={14} />
          ))}
        </div>

        <div className="skel-shop-listing__grid">
          {[...Array(6)].map((_, i) => (
            <div className="skel-shop-product-card" key={i}>
              <SkeletonBlock className="skel-shop-product-card__image" height={360} radius={4} />
              <div className="skel-shop-product-card__body">
                <SkeletonLine width="78%" height={16} style={{ marginBottom: 8 }} />
                <div className="skel-shop-product-card__meta">
                  <SkeletonLine width="42%" height={11} />
                  <SkeletonLine width={58} height={13} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
