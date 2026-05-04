import React from 'react'
import { SkeletonBlock, SkeletonLine } from './SkeletonPrimitives'
import './skeleton.css'

export default function ShopOrdersSkeleton() {
  return (
    <div className="skel-page skel-shop-shell skel-shop-orders" aria-label="Loading shop orders" aria-busy="true" aria-hidden="true">
      <div className="skel-shop-wrap">
        <div className="skel-shop-orders__head">
          <SkeletonLine className="skel-shop-page-title" width="min(72vw, 330px)" height={56} />
          <SkeletonLine width={132} height={14} />
        </div>

        <div className="skel-shop-orders__list">
          {[0, 1, 2].map((order) => (
            <div className="skel-shop-orders__card" key={order}>
              <div className="skel-shop-orders__summary">
                <div>
                  <SkeletonLine width={150} height={12} style={{ marginBottom: 12 }} />
                  <SkeletonLine width={180} height={22} />
                </div>
                <div className="skel-shop-orders__status">
                  <SkeletonLine width={92} height={24} style={{ marginBottom: 10 }} />
                  <SkeletonBlock width={112} height={28} radius={50} />
                </div>
              </div>

              <div className="skel-shop-orders__detail">
                <div>
                  <SkeletonLine width={100} height={13} style={{ marginBottom: 20 }} />
                  <SkeletonLine width="85%" height={14} style={{ marginBottom: 12 }} />
                  <SkeletonLine width="70%" height={14} />
                </div>
                <div>
                  <SkeletonLine width={102} height={13} style={{ marginBottom: 20 }} />
                  <SkeletonLine width="76%" height={14} style={{ marginBottom: 10 }} />
                  <SkeletonLine width="90%" height={14} style={{ marginBottom: 10 }} />
                  <SkeletonLine width="68%" height={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
