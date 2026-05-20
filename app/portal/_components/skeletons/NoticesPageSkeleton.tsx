import React from 'react';
import { SkeletonLine, SkeletonBlock, SkeletonButton } from './SkeletonPrimitives';

export const NoticesPageSkeleton = () => (
  <div style={{ padding: '2rem 1rem 4rem', maxWidth: '1000px', margin: '0 auto', width: '100%' }} aria-label="Loading notices" aria-busy="true">

    {/* Header Skeleton */}
    <div style={{ paddingTop: '3rem', marginBottom: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <SkeletonLine width="350px" height={64} style={{ marginBottom: '0.5rem', borderRadius: '12px' }} />
      <SkeletonLine width="500px" height={20} style={{ borderRadius: '6px' }} />
    </div>

    {/* Notice Card Skeleton */}
    <div style={{
      background: 'rgba(10,14,22,0.4)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '28px',
      padding: '2.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    }}>
      {/* Icon */}
      <SkeletonBlock width="58px" height="58px" radius={20} />

      {/* Title and description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <SkeletonLine width="280px" height={32} style={{ borderRadius: '8px' }} />
        <SkeletonLine width="100%" height={16} style={{ borderRadius: '4px' }} />
        <SkeletonLine width="85%" height={16} style={{ borderRadius: '4px' }} />
      </div>

      {/* Pill badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem' }}>
        <SkeletonButton width={140} height={36} style={{ borderRadius: '999px' }} />
        <SkeletonButton width={200} height={36} style={{ borderRadius: '999px' }} />
      </div>
    </div>
  </div>
);
