import React from 'react';
import { SkeletonLine, SkeletonCircle, SkeletonButton } from './SkeletonPrimitives';

export const EventsPageSkeleton = () => (
  <div style={{ padding: '2rem 1rem 6rem', maxWidth: '1000px', margin: '0 auto', width: '100%', minHeight: '70vh', display: 'flex', flexDirection: 'column' }} aria-label="Loading events" aria-busy="true">
    {/* Header */}
    <div style={{ paddingTop: '3rem', marginBottom: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <SkeletonLine width="350px" height={64} style={{ marginBottom: '0.5rem', borderRadius: '12px' }} />
      <SkeletonLine width="450px" height={20} style={{ borderRadius: '6px' }} />
    </div>

    {/* Upcoming Events Section */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <div>
        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <SkeletonCircle size={28} />
          <SkeletonLine width="180px" height={28} style={{ borderRadius: '6px' }} />
          <SkeletonLine width="40px" height={24} style={{ borderRadius: '50px' }} />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '2rem' }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ 
              position: 'relative',
              background: 'rgba(20,20,20,0.2)',
              borderRadius: '32px',
              border: '1px solid rgba(255,255,255,0.02)',
              padding: '2.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              minHeight: '280px'
            }}>
              {/* Top Metadata */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <SkeletonLine width="70px" height={48} style={{ borderRadius: '8px' }} />
                  <SkeletonLine width="50px" height={16} style={{ borderRadius: '4px' }} />
                </div>
                <SkeletonButton width={80} height={26} style={{ borderRadius: '100px' }} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <SkeletonLine width="80%" height={32} style={{ marginBottom: '1rem', borderRadius: '8px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <SkeletonCircle size={16} />
                  <SkeletonLine width="60%" height={16} style={{ borderRadius: '4px' }} />
                </div>
                
                <div style={{ marginBottom: '2.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <SkeletonLine width="100%" height={14} style={{ borderRadius: '4px' }} />
                  <SkeletonLine width="90%" height={14} style={{ borderRadius: '4px' }} />
                  <SkeletonLine width="75%" height={14} style={{ borderRadius: '4px' }} />
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <SkeletonCircle size={40} />
                  <SkeletonLine width="100px" height={18} style={{ borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);
