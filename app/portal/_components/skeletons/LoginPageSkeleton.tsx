import React from 'react';
import { SkeletonLine, SkeletonBlock, SkeletonButton } from './SkeletonPrimitives';
import '../../login/login.css';

export const LoginPageSkeleton = () => (
  <div className="dojo-login" aria-label="Loading login" aria-busy="true">
    <div className="dojo-login__bg-glow" />
    
    <div className="dojo-login__content" style={{ opacity: 1, transform: 'none' }}>
      <div className="dojo-login__header" style={{ marginBottom: '2rem' }}>
        <SkeletonLine width="180px" height={40} style={{ marginBottom: '0.5rem' }} />
        <SkeletonLine width="260px" height={16} />
      </div>

      <div className="dojo-login__form">
        <div className="dojo-input-group" style={{ marginBottom: '1.5rem' }}>
          <SkeletonLine width="120px" height={14} style={{ marginBottom: '0.75rem' }} />
          <SkeletonBlock width="100%" height={56} radius={14} />
        </div>

        <div className="dojo-input-group" style={{ marginBottom: '2rem' }}>
          <SkeletonLine width="100px" height={14} style={{ marginBottom: '0.75rem' }} />
          <SkeletonBlock width="100%" height={56} radius={14} />
        </div>

        <SkeletonButton width="100%" height={56} style={{ borderRadius: '14px' }} />
      </div>
    </div>
  </div>
);
