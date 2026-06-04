'use client'

import React from 'react';
import { SkeletonLine, SkeletonBlock, SkeletonButton } from './SkeletonPrimitives';
import { useNonce } from '@/components/NonceProvider';

/**
 * NoticesPageSkeleton — matches NoticesClient layout precisely
 * Desktop: Left-aligned header (icon + title + subtitle) → Notice card (icon + title + desc + pill badges)
 * Mobile: Compact header, reduced padding, smaller icon and text placeholders
 */
export const NoticesPageSkeleton = () => {
  const nonce = useNonce();

  return (
  <div className="skel-notices" style={{ padding: '2rem 1rem 4rem', maxWidth: '1420px', margin: '0 auto', width: '100%' }} aria-label="Loading notices" aria-busy="true">

    {/* ══ HEADER — left-aligned with icon ══ */}
    <div className="skel-notices-header">
      <div className="skel-notices-title-row">
        <SkeletonBlock width="48px" height="48px" radius={12} className="skel-notices-bell" />
        <SkeletonLine width="280px" height={48} className="skel-notices-title" style={{ borderRadius: '10px' }} />
      </div>
      <SkeletonLine width="450px" height={18} className="skel-notices-sub" style={{ borderRadius: '6px', marginTop: '0.75rem' }} />
    </div>

    {/* ══ NOTICE CARD ══ */}
    <div className="skel-notices-card">
      {/* Icon */}
      <SkeletonBlock width="58px" height="58px" radius={20} className="skel-notices-card__icon" />

      {/* Title and description */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <SkeletonLine width="260px" height={30} className="skel-notices-card__title" style={{ borderRadius: '8px' }} />
        <SkeletonLine width="100%" height={16} style={{ borderRadius: '4px' }} />
        <SkeletonLine width="85%" height={16} style={{ borderRadius: '4px' }} />
      </div>

      {/* Pill badges */}
      <div className="skel-notices-pills">
        <SkeletonButton width={140} height={36} style={{ borderRadius: '999px' }} />
        <SkeletonButton width={220} height={36} style={{ borderRadius: '999px' }} />
      </div>
    </div>

    <style nonce={nonce} dangerouslySetInnerHTML={{__html: `
      .skel-notices-header {
        margin-bottom: 3rem;
      }
      .skel-notices-title-row {
        display: flex; align-items: center; gap: 1rem;
      }
      .skel-notices-card {
        background: rgba(10,14,22,0.72);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 28px;
        padding: 2.5rem;
        display: grid;
        gap: 1.5rem;
      }
      .skel-notices-pills {
        display: flex; flex-wrap: wrap; gap: 0.85rem;
      }

      /* ═══ MOBILE (≤768px) ═══ */
      @media (max-width: 768px) {
        .skel-notices-header { margin-bottom: 2rem; }
        .skel-notices-bell { width: 36px !important; height: 36px !important; }
        .skel-notices-title { width: 200px !important; height: 36px !important; }
        .skel-notices-sub { width: 280px !important; height: 16px !important; }
        .skel-notices-card {
          padding: 1.5rem;
          border-radius: 22px;
          gap: 1.25rem;
        }
        .skel-notices-card__icon { width: 44px !important; height: 44px !important; }
        .skel-notices-card__title { width: 200px !important; height: 24px !important; }
        .skel-notices-pills .skeleton-shimmer:first-child { width: 110px !important; height: 32px !important; }
        .skel-notices-pills .skeleton-shimmer:last-child { width: 180px !important; height: 32px !important; }
      }

      /* ═══ SMALL PHONE (≤480px) ═══ */
      @media (max-width: 480px) {
        .skel-notices-card {
          padding: 1.25rem;
          border-radius: 18px;
        }
        .skel-notices-bell { width: 32px !important; height: 32px !important; }
        .skel-notices-title { width: 160px !important; height: 30px !important; }
        .skel-notices-sub { width: 220px !important; }
        .skel-notices-card__icon { width: 38px !important; height: 38px !important; border-radius: 14px !important; }
        .skel-notices-card__title { width: 160px !important; height: 22px !important; }
        .skel-notices-pills {
          flex-direction: column;
          gap: 0.5rem;
        }
        .skel-notices-pills .skeleton-shimmer { width: 100% !important; }
      }
    `}} />
  </div>
  );
};
