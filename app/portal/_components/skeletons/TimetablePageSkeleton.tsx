import React from 'react';
import { SkeletonLine, SkeletonCircle, SkeletonBlock, SkeletonButton } from './SkeletonPrimitives';

export const TimetablePageSkeleton = () => (
  <div style={{ paddingBottom: '4rem', paddingTop: '1rem', maxWidth: '1420px', margin: '0 auto', width: '100%' }} aria-label="Loading timetable" aria-busy="true">
    
    {/* ── HEADER ── */}
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '3rem', paddingLeft: '0.5rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
           <SkeletonCircle size={48} />
           <SkeletonLine width="250px" height={48} style={{ borderRadius: '8px' }} />
        </div>
        <SkeletonLine width="400px" height={16} />
      </div>

      {/* Location Badge */}
      <div style={{ display: 'flex' }}>
         <SkeletonButton width={160} height={44} style={{ borderRadius: '12px' }} />
      </div>
    </div>

    {/* ── TIMETABLE IMAGE VIEWER ── */}
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1200px',
        borderRadius: '24px',
        overflow: 'hidden',
        background: 'rgba(10, 14, 22, 0.5)',
        border: '1px solid rgba(255,255,255,0.08)',
        margin: '0 0.5rem'
      }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/10' }}>
        <SkeletonBlock width="100%" height="100%" radius={0} />
        
        {/* Action Overlay */}
        <div style={{ 
          position: 'absolute', 
          top: '1.5rem', 
          right: '1.5rem',
          display: 'flex',
          gap: '0.75rem'
        }}>
           <SkeletonButton width={44} height={44} style={{ borderRadius: '12px' }} />
        </div>
      </div>
      
      {/* Footer Bar */}
      <div style={{ 
        padding: '1.5rem', 
        background: 'rgba(0,0,0,0.3)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <SkeletonLine width="120px" height={16} style={{ marginBottom: '6px' }} />
          <SkeletonLine width="180px" height={12} />
        </div>
        <SkeletonLine width="160px" height={14} />
      </div>
    </div>
  </div>
);
