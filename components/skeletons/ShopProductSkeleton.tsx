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
    <div className="skel-page skel-shop-shell" aria-label="Loading product" aria-busy="true" aria-hidden="true">
      <div className="skel-shop-wrap">
        <SkeletonLine width={140} height={14} style={{ marginBottom: '3rem' }} />

        <div className="skel-shop-detail">
          <div className="skel-shop-detail__gallery">
            <SkeletonBlock className="skel-shop-detail__hero-image" height={640} radius={0} />
            <div className="skel-shop-detail__thumbs">
              {[...Array(3)].map((_, i) => (
                <SkeletonBlock key={i} width={100} height={100} radius={0} />
              ))}
            </div>
          </div>

          <div className="skel-shop-detail__info">
            <div className="skel-shop-detail__badges">
              <SkeletonLine width={88} height={11} />
              <SkeletonLine width={110} height={11} />
            </div>

            <SkeletonLine className="skel-shop-detail__title" width="88%" height={58} style={{ marginBottom: 10 }} />
            <SkeletonLine className="skel-shop-detail__title" width="58%" height={58} style={{ marginBottom: '1.75rem' }} />

            <SkeletonLine width={110} height={25} style={{ marginBottom: '2.5rem' }} />

            <div className="skel-shop-detail__description">
              <SkeletonLine width="100%" height={14} style={{ marginBottom: 8 }} />
              <SkeletonLine width="92%" height={14} style={{ marginBottom: 8 }} />
              <SkeletonLine width="72%" height={14} />
            </div>

            <div className="skel-shop-detail__selector-head">
              <SkeletonLine width={92} height={12} />
              <SkeletonLine width={82} height={12} />
            </div>
            <div className="skel-shop-detail__sizes">
              {[...Array(5)].map((_, i) => (
                <SkeletonBlock key={i} width={68} height={42} radius={50} />
              ))}
            </div>

            <div className="skel-shop-detail__quantity">
              <SkeletonBlock width={128} height={46} radius={50} />
              <SkeletonLine width={108} height={12} />
            </div>

            <SkeletonButton width="100%" height={58} style={{ borderRadius: 50 }} />

            <div className="skel-shop-detail__trust">
              <SkeletonLine width={220} height={12} />
              <SkeletonLine width={200} height={12} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
