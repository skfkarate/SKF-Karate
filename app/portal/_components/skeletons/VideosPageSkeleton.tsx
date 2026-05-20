import React from 'react';
import { SkeletonLine, SkeletonBlock, SkeletonButton } from './SkeletonPrimitives';

export const VideosPageSkeleton = () => (
  <div style={{ background: '#000', minHeight: '100vh', width: '100%', overflowX: 'hidden' }} aria-label="Loading videos" aria-busy="true">

    {/* ── CINEMATIC HERO SKELETON ── */}
    <div className="skel-video-hero" style={{
      position: 'relative', width: '100%', height: '85vh', minHeight: '600px',
      backgroundColor: '#000', marginBottom: '2rem',
    }}>
      {/* Background shimmer for the poster */}
      <SkeletonBlock width="100%" height="100%" radius={0} style={{ position: 'absolute', inset: 0, opacity: 0.3 }} />

      {/* Vignette gradients */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to right, #000 0%, rgba(0,0,0,0.5) 40%, transparent 100%)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0) 30%)' }} />
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 20%)' }} />

      {/* Content Layer */}
      <div className="skel-video-hero-content" style={{ position: 'absolute', bottom: '20%', left: '4%', right: '4%', zIndex: 10, maxWidth: '600px' }}>
        {/* N SERIES badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <SkeletonLine width="120px" height={22} style={{ borderRadius: '4px' }} />
        </div>

        {/* Title */}
        <SkeletonLine width="80%" height={72} style={{ marginBottom: '1.5rem', borderRadius: '8px' }} />

        {/* Meta row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <SkeletonLine width="90px" height={20} style={{ borderRadius: '4px' }} />
          <SkeletonLine width="50px" height={20} style={{ borderRadius: '4px' }} />
          <SkeletonLine width="40px" height={20} style={{ borderRadius: '4px' }} />
          <SkeletonLine width="50px" height={20} style={{ borderRadius: '4px' }} />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <SkeletonLine width="100%" height={18} style={{ borderRadius: '4px' }} />
          <SkeletonLine width="90%" height={18} style={{ borderRadius: '4px' }} />
          <SkeletonLine width="60%" height={18} style={{ borderRadius: '4px' }} />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <SkeletonButton width={140} height={50} style={{ borderRadius: '4px', background: 'rgba(255,255,255,0.15)' }} />
          <SkeletonButton width={160} height={50} style={{ borderRadius: '4px', background: 'rgba(109,109,110,0.3)' }} />
        </div>
      </div>
    </div>

    {/* ── CONTENT ROWS ── */}
    <div style={{ position: 'relative', zIndex: 10, marginTop: '-5vh' }}>
      {[...Array(3)].map((_, rowIdx) => (
        <div key={rowIdx} style={{ marginBottom: '3.5rem' }}>
          {/* Row Title */}
          <div style={{ paddingLeft: '4%', marginBottom: '1rem' }}>
            <SkeletonLine width="200px" height={24} style={{ borderRadius: '4px' }} />
          </div>

          {/* Scrolling Cards */}
          <div className="skel-video-row" style={{ display: 'flex', gap: '0.5rem', overflowX: 'hidden', paddingLeft: '4%', paddingRight: '4%' }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skel-video-card" style={{ flex: '0 0 auto', borderRadius: '4px', overflow: 'hidden', background: '#111' }}>
                <SkeletonBlock width="100%" height="100%" radius={4} style={{ aspectRatio: '16/9' }} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>

    <style dangerouslySetInnerHTML={{__html: `
      .skel-video-card {
        width: clamp(200px, 18vw, 300px);
        aspect-ratio: 16/9;
      }
      @media (max-width: 768px) {
        .skel-video-hero {
          height: 60vh !important;
          min-height: 400px !important;
        }
        .skel-video-hero-content {
          bottom: 12% !important;
        }
        .skel-video-card {
          width: 200px !important;
        }
      }
    `}} />
  </div>
);
