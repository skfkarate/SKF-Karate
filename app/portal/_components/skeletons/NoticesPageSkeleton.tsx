import React from 'react';
import { SkeletonLine, SkeletonCircle, SkeletonBlock, SkeletonButton } from './SkeletonPrimitives';

export const NoticesPageSkeleton = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center', padding: '2rem' }} aria-label="Loading notices" aria-busy="true">
    <SkeletonCircle size={64} style={{ marginBottom: '1.5rem' }} />
    <SkeletonLine width="300px" height={60} style={{ marginBottom: '0.5rem', borderRadius: '12px' }} />
    <SkeletonButton width={120} height={24} style={{ borderRadius: '50px', marginBottom: '2rem' }} />
    <SkeletonLine width="400px" height={20} style={{ marginBottom: '3rem' }} />

    <div style={{ width: '100%', maxWidth: '400px', background: 'rgba(10,14,22,0.6)', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <SkeletonBlock width="100%" height={50} radius={12} />
      <SkeletonBlock width="100%" height={50} radius={12} />
    </div>
  </div>
);
