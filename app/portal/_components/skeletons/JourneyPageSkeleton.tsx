import React from 'react';
import { SkeletonLine, SkeletonCircle, SkeletonBlock } from './SkeletonPrimitives';

export const JourneyPageSkeleton = () => (
  <div style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto', width: '100%' }} aria-label="Loading journey" aria-busy="true">
    <div style={{ marginBottom: '4rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
        <SkeletonCircle size={40} />
        <SkeletonLine width="200px" height={40} style={{ borderRadius: '8px' }} />
      </div>
      <SkeletonLine width="240px" height={16} />
    </div>

    <div style={{ position: 'relative', paddingLeft: '3rem', paddingBottom: '2rem' }}>
      {/* The Vertical Line / Spine */}
      <div
        style={{
          position: 'absolute',
          left: '0px',
          top: 0,
          width: '2px',
          height: '100%',
          background: 'rgba(255,183,3,0.1)',
        }}
      />

      {[...Array(4)].map((_, idx) => (
        <div key={idx} style={{ position: 'relative', marginBottom: '3rem' }}>
          {/* Node Dot */}
          <SkeletonCircle
            size={16}
            style={{
              position: 'absolute',
              left: '-55px', // 3rem paddingLeft = 48px, + 7px offset = 55px (approx to center on line)
              top: '24px',
              border: '3px solid rgba(255,255,255,0.05)',
              background: '#0a0e16',
            }}
          />

          {/* Node Content Card */}
          <div style={{
            background: 'rgba(10, 14, 22, 0.6)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '1.5rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <SkeletonCircle size={18} />
                <SkeletonLine width="80px" height={14} />
              </div>
              {idx === 0 && (
                 <SkeletonBlock width="80px" height={20} radius={100} />
              )}
            </div>

            <SkeletonLine width="60%" height={24} style={{ marginBottom: '0.5rem' }} />
            <SkeletonLine width="80%" height={16} />
          </div>
        </div>
      ))}
      
      {/* Future / Upcoming Node */}
      <div style={{ position: 'relative' }}>
         <SkeletonCircle
            size={12}
            style={{
              position: 'absolute',
              left: '-53px',
              top: '24px',
              background: '#0a0e16',
            }}
          />
          <div style={{
            border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            justifyContent: 'center'
          }}>
             <SkeletonLine width="160px" height={16} />
          </div>
      </div>
    </div>
  </div>
);
