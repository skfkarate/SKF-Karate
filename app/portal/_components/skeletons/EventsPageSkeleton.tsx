import React from 'react';
import { SkeletonLine, SkeletonCircle, SkeletonButton } from './SkeletonPrimitives';

export const EventsPageSkeleton = () => (
  <div style={{ padding: '2rem 1rem', maxWidth: '1420px', margin: '0 auto', width: '100%', minHeight: '70vh', display: 'flex', flexDirection: 'column' }} aria-label="Loading events" aria-busy="true">
    {/* Header */}
    <div style={{ marginBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
        <SkeletonCircle size={48} />
        <SkeletonLine width="200px" height={48} style={{ borderRadius: '8px' }} />
      </div>
      <SkeletonLine width="600px" height={16} />
    </div>

    {/* Upcoming Events Section */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <div>
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SkeletonCircle size={20} />
          <SkeletonLine width="160px" height={24} />
          <SkeletonLine width="32px" height={20} style={{ borderRadius: '50px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <SkeletonButton width={80} height={20} style={{ borderRadius: '50px' }} />
                <SkeletonLine width="80px" height={14} />
              </div>
              <SkeletonLine width="80%" height={24} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <SkeletonCircle size={14} />
                <SkeletonLine width="60%" height={12} />
              </div>
              <SkeletonLine width="100%" height={12} style={{ marginTop: 'auto' }} />
              <SkeletonLine width="80%" height={12} />
              <SkeletonButton width="100%" height={38} style={{ borderRadius: '10px', marginTop: '1rem' }} />
            </div>
          ))}
        </div>
      </div>

      {/* Past Events Section */}
      <div>
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SkeletonLine width="120px" height={24} />
          <SkeletonLine width="32px" height={20} style={{ borderRadius: '50px' }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))', gap: '1.5rem' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '16px', padding: '1.5rem', opacity: 0.7 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <SkeletonButton width={60} height={16} style={{ borderRadius: '50px' }} />
                <SkeletonLine width="60px" height={12} />
              </div>
              <SkeletonLine width="70%" height={16} style={{ marginBottom: '0.5rem' }} />
              <SkeletonLine width="50%" height={12} />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
