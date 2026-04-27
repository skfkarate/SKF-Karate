import React from 'react'
import { SkeletonLine, SkeletonBlock, SkeletonCircle } from './SkeletonPrimitives'

/**
 * AthleteProfileSkeleton — mirrors athlete/[registrationNumber] profile page
 */
export default function AthleteProfileSkeleton() {
  return (
    <div aria-label="Loading athlete profile" aria-busy="true" aria-hidden="true" style={{ paddingTop: '5rem', maxWidth: 1000, margin: '0 auto', padding: '5rem 2rem 4rem' }}>
      {/* Profile header */}
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', marginBottom: 48 }}>
        <SkeletonCircle size={120} />
        <div style={{ flex: 1 }}>
          <SkeletonLine width="100px" height={14} style={{ marginBottom: 8 }} />
          <SkeletonLine width="250px" height={36} style={{ marginBottom: 8 }} />
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <SkeletonLine width="80px" height={24} style={{ borderRadius: 50 }} />
            <SkeletonLine width="100px" height={24} style={{ borderRadius: 50 }} />
            <SkeletonLine width="90px" height={24} style={{ borderRadius: 50 }} />
          </div>
          <SkeletonLine width="200px" height={14} />
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 48 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <SkeletonLine width="50px" height={32} style={{ margin: '0 auto 8px' }} />
            <SkeletonLine width="80px" height={13} style={{ margin: '0 auto' }} />
          </div>
        ))}
      </div>

      {/* Achievement section */}
      <SkeletonLine width="180px" height={24} style={{ marginBottom: 20 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ padding: 20, borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
            <SkeletonLine width="60%" height={16} style={{ marginBottom: 8 }} />
            <SkeletonLine width="80%" height={13} style={{ marginBottom: 6 }} />
            <SkeletonLine width="50%" height={13} />
          </div>
        ))}
      </div>
    </div>
  )
}
