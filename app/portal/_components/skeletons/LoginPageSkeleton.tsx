import React from 'react';
import { SkeletonLine, SkeletonCircle, SkeletonButton } from './SkeletonPrimitives';
import '../../login/login.css';

export const LoginPageSkeleton = () => (
  <div className="dojo-login" aria-label="Loading login" aria-busy="true">
    <div className="dojo-login__bg-glow" />
    <div className="dojo-login__watermark">空手道</div>
    
    <div className="dojo-login__content" style={{ opacity: 1, transform: 'none' }}>
      <div className="dojo-login__header">
        <div className="dojo-login__brand">
           <SkeletonCircle size={34} />
           <SkeletonLine width="100px" height={12} className="dojo-login__brand-text" />
        </div>

        <div className="dojo-login__title" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
           <SkeletonLine width="220px" height={50} />
           <SkeletonLine width="180px" height={50} />
        </div>
        
        <div className="dojo-login__subtitle" style={{ marginTop: '0.5rem' }}>
          <SkeletonLine width="260px" height={14} />
        </div>
      </div>

      <div className="dojo-login__form">
        <div className="dojo-input-group">
           <SkeletonLine width="100%" height={32} style={{ marginBottom: '0.2rem', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', background: 'transparent' }} />
           <SkeletonLine width="60px" height={10} style={{ marginTop: '0.5rem' }} />
        </div>

        <div className="dojo-input-group">
           <SkeletonLine width="100%" height={32} style={{ marginBottom: '0.2rem', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', background: 'transparent' }} />
           <SkeletonLine width="100px" height={10} style={{ marginTop: '0.5rem' }} />
        </div>

        <SkeletonButton width="100%" height={60} style={{ borderRadius: '4px', marginTop: '1rem' }} />
      </div>
    </div>
  </div>
);
