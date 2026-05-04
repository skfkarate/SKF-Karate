import React from 'react'
import { SkeletonButton, SkeletonCircle, SkeletonLine } from './SkeletonPrimitives'
import './skeleton.css'

export default function ShopSuccessSkeleton() {
  return (
    <div className="skel-page skel-shop-success" aria-label="Loading order confirmation" aria-busy="true" aria-hidden="true">
      <div className="skel-shop-success__card">
        <SkeletonCircle size={100} style={{ margin: '0 auto 2.5rem' }} />
        <SkeletonLine width={160} height={13} style={{ margin: '0 auto 1rem' }} />
        <SkeletonLine width="min(80vw, 430px)" height={58} style={{ margin: '0 auto 1.5rem' }} />
        <SkeletonLine width="min(76vw, 500px)" height={15} style={{ margin: '0 auto 8px' }} />
        <SkeletonLine width="min(62vw, 380px)" height={15} style={{ margin: '0 auto 3rem' }} />
        <SkeletonLine width={280} height={76} style={{ borderRadius: 20, margin: '0 auto 4rem' }} />
        <SkeletonButton width={320} height={58} style={{ borderRadius: 50, margin: '0 auto 1.25rem' }} />
        <SkeletonLine width={118} height={14} style={{ margin: '0 auto' }} />
      </div>
    </div>
  )
}
