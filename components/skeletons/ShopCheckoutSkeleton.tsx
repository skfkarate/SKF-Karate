import React from 'react'
import { SkeletonBlock, SkeletonButton, SkeletonCircle, SkeletonLine } from './SkeletonPrimitives'
import './skeleton.css'

export default function ShopCheckoutSkeleton() {
  return (
    <div className="skel-page skel-shop-checkout" aria-label="Loading checkout" aria-busy="true" aria-hidden="true">
      <div className="skel-shop-checkout__wrap">
        <div className="skel-shop-checkout__topbar">
          <SkeletonLine width={120} height={14} />

          <div className="skel-shop-checkout__steps">
            <div className="skel-shop-checkout__step">
              <SkeletonCircle size={22} />
              <SkeletonLine width={70} height={12} />
            </div>
            <SkeletonLine width="clamp(10px, 5vw, 40px)" height={1} />
            <div className="skel-shop-checkout__step">
              <SkeletonCircle size={22} />
              <SkeletonLine width={70} height={12} />
            </div>
          </div>
        </div>

        <div className="skel-shop-checkout__grid">
          <main className="skel-shop-checkout__main">
            <div className="skel-shop-checkout__title">
              <SkeletonLine width="min(84%, 430px)" height={52} style={{ marginBottom: 10 }} />
              <SkeletonLine width="min(58%, 300px)" height={52} />
            </div>

            <div className="skel-shop-checkout__intro">
              <SkeletonLine width={150} height={12} style={{ marginBottom: 10 }} />
              <SkeletonLine width="min(100%, 520px)" height={15} style={{ marginBottom: 6 }} />
              <SkeletonLine width="min(82%, 420px)" height={15} />
            </div>

            {[180, 150, 120, 135].map((width, index) => (
              <div className="skel-shop-checkout__field" key={index}>
                <SkeletonLine width={width} height={12} style={{ marginBottom: 16 }} />
                <SkeletonBlock height={50} radius={0} className="skel-shop-checkout__input" />
              </div>
            ))}

            <SkeletonButton width="100%" height={58} style={{ borderRadius: 50, marginTop: '2.5rem' }} />
          </main>

          <aside className="skel-shop-checkout__summary">
            <SkeletonLine width={145} height={13} style={{ marginBottom: 32 }} />

            <div className="skel-shop-checkout__items">
              {[0, 1, 2].map((item) => (
                <div className="skel-shop-checkout__item" key={item}>
                  <SkeletonBlock width={48} height={60} radius={8} />
                  <div className="skel-shop-checkout__item-copy">
                    <SkeletonLine width="82%" height={15} style={{ marginBottom: 8 }} />
                    <SkeletonLine width="56%" height={11} />
                  </div>
                  <SkeletonLine width={56} height={15} />
                </div>
              ))}
            </div>

            <div className="skel-shop-checkout__totals">
              {[0, 1].map((row) => (
                <div className="skel-shop-checkout__total-row" key={row}>
                  <SkeletonLine width={90} height={13} />
                  <SkeletonLine width={70} height={13} />
                </div>
              ))}

              <div className="skel-shop-checkout__grand-total">
                <SkeletonLine width={90} height={22} />
                <SkeletonLine width={95} height={22} />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
