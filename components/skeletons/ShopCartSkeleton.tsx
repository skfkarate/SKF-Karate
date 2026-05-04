import React from 'react'
import { SkeletonBlock, SkeletonButton, SkeletonCircle, SkeletonLine } from './SkeletonPrimitives'
import './skeleton.css'

export default function ShopCartSkeleton() {
  return (
    <div className="skel-page skel-shop-shell" aria-label="Loading cart" aria-busy="true" aria-hidden="true">
      <div className="skel-shop-wrap">
        <SkeletonLine width={150} height={14} style={{ marginBottom: '3rem' }} />
        <SkeletonLine className="skel-shop-page-title" width="min(82vw, 330px)" height={56} />

        <div className="skel-shop-cart">
          <main className="skel-shop-cart__items">
            <div className="skel-shop-cart__athlete">
              <SkeletonCircle size={64} />
              <div className="skel-flex-1">
                <SkeletonLine width="min(72%, 260px)" height={20} style={{ marginBottom: 12 }} />
                <SkeletonLine width="min(58%, 220px)" height={12} />
              </div>
            </div>

            {[0, 1, 2].map((item) => (
              <div className="skel-shop-cart__item" key={item}>
                <SkeletonBlock className="skel-shop-cart__image" width={120} height={160} radius={0} />
                <div className="skel-shop-cart__item-copy">
                  <div>
                    <div className="skel-shop-cart__item-head">
                      <SkeletonLine width="min(70%, 260px)" height={20} />
                      <SkeletonLine width={72} height={18} />
                    </div>
                    <SkeletonLine width={78} height={12} style={{ marginTop: 10 }} />
                  </div>

                  <div className="skel-shop-cart__item-actions">
                    <SkeletonBlock width={128} height={38} radius={50} />
                    <SkeletonLine width={82} height={12} />
                  </div>
                </div>
              </div>
            ))}
          </main>

          <aside className="skel-shop-cart__summary">
            <SkeletonLine width={96} height={14} style={{ marginBottom: '2rem' }} />

            {[0, 1].map((row) => (
              <div className="skel-shop-cart__summary-row" key={row}>
                <SkeletonLine width={90} height={13} />
                <SkeletonLine width={72} height={13} />
              </div>
            ))}

            <div className="skel-shop-cart__promo">
              <SkeletonLine width={132} height={12} style={{ marginBottom: 16 }} />
              <div className="skel-shop-cart__promo-row">
                <SkeletonBlock height={38} radius={0} />
                <SkeletonLine width={58} height={12} />
              </div>
            </div>

            <div className="skel-shop-cart__total">
              <SkeletonLine width={80} height={22} />
              <SkeletonLine width={96} height={22} />
            </div>

            <SkeletonButton width="100%" height={58} style={{ borderRadius: 50, marginTop: '2.5rem' }} />
            <SkeletonLine width={150} height={12} style={{ margin: '1.5rem auto 0' }} />
          </aside>
        </div>
      </div>
    </div>
  )
}
