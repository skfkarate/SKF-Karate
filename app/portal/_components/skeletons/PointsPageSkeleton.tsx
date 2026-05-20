import React from 'react';
import { SkeletonLine, SkeletonCircle, SkeletonButton } from './SkeletonPrimitives';

export const PointsPageSkeleton = () => (
  <div style={{ padding: '2rem 1rem 6rem', maxWidth: '1000px', margin: '0 auto', width: '100%', minHeight: '70vh', display: 'flex', flexDirection: 'column' }} aria-label="Loading points" aria-busy="true">

    {/* Header Skeleton */}
    <div style={{ paddingTop: '5rem', marginBottom: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <SkeletonLine width="400px" height={56} style={{ marginBottom: '0.5rem', borderRadius: '12px' }} />
      <SkeletonLine width="350px" height={20} style={{ borderRadius: '6px' }} />
    </div>

    {/* Coming Soon Glass Card Skeleton */}
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(255,183,3,0.02)',
      borderRadius: '32px',
      border: '1px solid rgba(255,183,3,0.06)',
      padding: '5rem 2rem',
      textAlign: 'center',
    }}>
      <SkeletonCircle size={80} style={{ marginBottom: '1.5rem' }} />
      <SkeletonButton width={120} height={28} style={{ borderRadius: '100px', marginBottom: '1.5rem' }} />
      <SkeletonLine width="220px" height={40} style={{ marginBottom: '1rem', borderRadius: '8px' }} />
      <SkeletonLine width="350px" height={16} style={{ marginBottom: '0.5rem', borderRadius: '4px' }} />
      <SkeletonLine width="300px" height={16} style={{ borderRadius: '4px' }} />
    </div>
  </div>
);
