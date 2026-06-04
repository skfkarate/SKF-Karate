'use client'

import React from 'react';
import { SkeletonLine, SkeletonCircle, SkeletonBlock, SkeletonButton } from './SkeletonPrimitives';
import { useNonce } from '@/components/NonceProvider';

/**
 * DashboardPageSkeleton — matches AthleteProfileClient layout
 * Desktop: Bento card hero (portrait left + data grid right) → events row → tabbed competitions table
 * Tablet: Bento stacks, events wrap
 * Mobile: Full-width stacked, compact stats (2x2), minimal medals row
 */
export const DashboardPageSkeleton = () => {
  const nonce = useNonce();

  return (
  <div className="ap-page kuroobi-dashboard skel-dash" style={{ background: 'transparent', minHeight: 'auto' }} aria-label="Loading dashboard" aria-busy="true">
    <div className="ap-container">

      {/* ════ 1. AthleteHero — Championship Card ════ */}
      <section className="skel-dash-hero">
        <div className="skel-dash-card">
          {/* Ambient glow placeholders */}
          <div className="skel-dash-card__ambient" />

          {/* Header Band */}
          <div className="skel-dash-header">
            <div>
              <SkeletonLine width="120px" height={12} style={{ marginBottom: '8px' }} />
              <SkeletonLine width="280px" height={36} style={{ marginBottom: '12px' }} />
              <div className="skel-dash-header__tags">
                <SkeletonButton width={100} height={28} style={{ borderRadius: '100px' }} />
                <SkeletonLine width="160px" height={14} />
              </div>
            </div>
          </div>

          {/* Content: Photo + Detail */}
          <div className="skel-dash-content">
            {/* Photo */}
            <div className="skel-dash-photo">
              <SkeletonBlock width="100%" height="100%" radius={0} />
              <div className="skel-dash-photo__id">
                <SkeletonLine width="50px" height={10} style={{ marginBottom: '4px' }} />
                <SkeletonLine width="80px" height={18} />
              </div>
            </div>

            {/* Detail Panel */}
            <div className="skel-dash-detail">
              {/* Ranking */}
              <div className="skel-dash-rank">
                <div style={{ flex: 1 }}>
                  <SkeletonLine width="100px" height={12} style={{ marginBottom: '6px' }} />
                  <SkeletonLine width="140px" height={16} style={{ marginBottom: '4px' }} />
                  <SkeletonLine width="80px" height={14} />
                </div>
                <SkeletonLine width="60px" height={48} style={{ borderRadius: '12px' }} />
              </div>

              {/* Stats */}
              <div className="skel-dash-stats">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="skel-dash-stat-item">
                    <SkeletonLine width="40px" height={24} />
                    <SkeletonLine width="50px" height={12} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer: Medals + Share */}
          <div className="skel-dash-footer">
            <div className="skel-dash-medals">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="skel-dash-medal">
                  <SkeletonCircle size={28} />
                  <SkeletonLine width="32px" height={12} />
                </div>
              ))}
              <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.1)', margin: '0 0.25rem' }} />
              <div className="skel-dash-medal">
                <SkeletonLine width="28px" height={20} />
                <SkeletonLine width="32px" height={12} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ 2. Upcoming Events ════ */}
      <section className="skel-dash-section">
        <div className="skel-dash-sec-head">
          <SkeletonCircle size={20} />
          <SkeletonLine width="160px" height={18} />
        </div>
        <div className="skel-dash-events-row">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="skel-dash-event-card">
              <SkeletonLine width="90px" height={12} style={{ marginBottom: '10px' }} />
              <SkeletonLine width="100%" height={16} style={{ marginBottom: '6px' }} />
              <SkeletonLine width="65%" height={14} />
            </div>
          ))}
        </div>
      </section>

      {/* ════ 3. Competition Results ════ */}
      <section className="skel-dash-section">
        <div className="skel-dash-sec-head">
          <SkeletonCircle size={20} />
          <SkeletonLine width="180px" height={18} />
        </div>
        <div className="skel-dash-panel">
          {/* Tabs */}
          <div className="skel-dash-tabs">
            <SkeletonButton width={130} height={34} style={{ borderRadius: '20px' }} />
            <SkeletonButton width={95} height={34} style={{ borderRadius: '20px' }} />
            <SkeletonButton width={110} height={34} style={{ borderRadius: '20px' }} />
          </div>

          {/* Category overview */}
          <div className="skel-dash-cat-overview">
            <div>
              <SkeletonLine width="170px" height={22} style={{ marginBottom: '0.75rem' }} />
              <SkeletonLine width="220px" height={14} />
            </div>
            <SkeletonCircle size={54} style={{ borderRadius: '12px' }} />
          </div>

          {/* Filter */}
          <SkeletonBlock width="100%" height={42} radius={8} style={{ marginBottom: '1rem' }} />

          {/* Table header */}
          <div className="skel-dash-tbl-head">
            {['12%', '30%', '16%', '14%', '10%', '8%', '10%'].map((w, i) => (
              <SkeletonLine key={i} width={w} height={13} />
            ))}
          </div>

          {/* Table rows */}
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skel-dash-tbl-row">
              <SkeletonLine width="10%" height={13} />
              <SkeletonLine width="28%" height={13} />
              <SkeletonLine width="14%" height={13} />
              <SkeletonLine width="12%" height={13} />
              <SkeletonCircle size={22} />
              <SkeletonLine width="6%" height={13} />
              <SkeletonLine width="8%" height={13} />
            </div>
          ))}
        </div>
      </section>

    </div>

    <style nonce={nonce} dangerouslySetInnerHTML={{__html: `
      /* ═══ BASE LAYOUT ═══ */
      .skel-dash-hero { margin-bottom: 2rem; }
      .skel-dash-card {
        background: rgba(10,14,22,0.4);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 24px;
        overflow: hidden;
        position: relative;
      }
      .skel-dash-card__ambient {
        position: absolute; top: -40%; right: -30%; width: 300px; height: 300px;
        background: radial-gradient(circle, rgba(214,40,40,0.08) 0%, transparent 70%);
        pointer-events: none;
      }
      .skel-dash-header { padding: 2rem 2.5rem 0; position: relative; z-index: 2; }
      .skel-dash-header__tags { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

      /* Content: Photo + Detail side by side */
      .skel-dash-content {
        display: grid;
        grid-template-columns: 280px 1fr;
        gap: 0;
        position: relative; z-index: 2;
        margin-top: 1.5rem;
      }
      .skel-dash-photo {
        position: relative;
        aspect-ratio: 3/4;
        overflow: hidden;
      }
      .skel-dash-photo__id {
        position: absolute; bottom: 1rem; left: 1rem;
        display: flex; flex-direction: column;
      }
      .skel-dash-detail {
        padding: 1.5rem 2rem;
        display: flex; flex-direction: column; gap: 1.25rem; justify-content: center;
      }
      .skel-dash-rank {
        display: flex; justify-content: space-between; align-items: center;
        padding: 1.25rem;
        background: rgba(255,255,255,0.02);
        border: 1px solid rgba(255,255,255,0.05);
        border-radius: 16px;
      }
      .skel-dash-stats {
        display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem;
      }
      .skel-dash-stat-item {
        display: flex; flex-direction: column; align-items: center; gap: 6px;
      }

      /* Footer */
      .skel-dash-footer {
        padding: 1.25rem 2rem;
        border-top: 1px solid rgba(255,255,255,0.05);
        position: relative; z-index: 2;
      }
      .skel-dash-medals {
        display: flex; align-items: center; gap: 1rem;
      }
      .skel-dash-medal {
        display: flex; flex-direction: column; align-items: center; gap: 4px;
      }

      /* Section */
      .skel-dash-section { margin-top: 2.5rem; }
      .skel-dash-sec-head {
        display: flex; align-items: center; gap: 10px;
        margin-bottom: 1.25rem;
      }

      /* Events row */
      .skel-dash-events-row {
        display: grid; 
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); 
        gap: 1rem;
      }
      .skel-dash-event-card {
        padding: 1.35rem 1.5rem;
        background: rgba(255,255,255,0.025);
        border-radius: 18px;
        border: 1px solid rgba(255,255,255,0.06);
      }

      /* Panel */
      .skel-dash-panel {
        padding: 1.5rem;
        background: rgba(255,255,255,0.02);
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.06);
      }
      .skel-dash-tabs { display: flex; gap: 10px; margin-bottom: 1.5rem; flex-wrap: wrap; }
      .skel-dash-cat-overview {
        display: flex; justify-content: space-between; align-items: flex-start;
        margin-bottom: 1.5rem;
      }
      .skel-dash-tbl-head {
        display: flex; gap: 0.75rem; padding-bottom: 10px; margin-bottom: 10px;
        border-bottom: 1px solid rgba(255,255,255,0.08);
      }
      .skel-dash-tbl-row {
        display: flex; align-items: center; gap: 0.75rem;
        padding: 10px 0;
        border-bottom: 1px solid rgba(255,255,255,0.04);
      }

      /* ═══ TABLET (≤1024px) ═══ */
      @media (max-width: 1024px) {
        .skel-dash-content {
          grid-template-columns: 220px 1fr;
        }
      }

      /* ═══ MOBILE GRID COLLAPSE (≤900px) matches real ap-hero-bento__grid ═══ */
      @media (max-width: 900px) {
        .skel-dash-content {
          grid-template-columns: 1fr;
        }
        .skel-dash-events-row {
          grid-template-columns: 1fr;
        }
      }

      /* ═══ MOBILE DETAILS (≤768px) ═══ */
      @media (max-width: 768px) {
        .skel-dash-header { padding: 1.25rem 1.25rem 0; }
        .skel-dash-header .skeleton-shimmer:nth-child(2) {
          width: 200px !important;
          height: 28px !important;
        }
        .skel-dash-photo {
          aspect-ratio: 16/9;
          max-height: 220px;
        }
        .skel-dash-detail { padding: 1.25rem; }
        .skel-dash-stats {
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        .skel-dash-rank {
          padding: 1rem;
        }
        .skel-dash-footer {
          padding: 1rem 1.25rem;
        }
        .skel-dash-medals {
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .skel-dash-medal .skeleton-shimmer:first-child {
          width: 24px !important; height: 24px !important;
        }
        .skel-dash-events-row {
          gap: 0.75rem;
        }
        .skel-dash-event-card { padding: 1rem; border-radius: 10px; }
        .skel-dash-panel { padding: 1.25rem; border-radius: 14px; }
        .skel-dash-tabs { gap: 8px; }
        .skel-dash-tabs .skeleton-shimmer {
          height: 30px !important;
        }
        .skel-dash-cat-overview {
          flex-direction: column;
          gap: 1rem;
        }
        .skel-dash-tbl-head, .skel-dash-tbl-row {
          display: none;
        }
        /* Show mobile-friendly card rows instead */
        .skel-dash-panel::after {
          content: '';
          display: block;
          margin-top: 0.5rem;
        }
      }

      /* ═══ SMALL PHONE (≤480px) ═══ */
      @media (max-width: 480px) {
        .skel-dash-card { border-radius: 18px; }
        .skel-dash-header { padding: 1rem 1rem 0; }
        .skel-dash-header .skeleton-shimmer:first-child {
          width: 80px !important;
        }
        .skel-dash-header .skeleton-shimmer:nth-child(2) {
          width: 160px !important;
          height: 24px !important;
        }
        .skel-dash-photo { max-height: 180px; }
        .skel-dash-detail { padding: 1rem; gap: 1rem; }
        .skel-dash-rank {
          padding: 0.75rem;
          border-radius: 12px;
        }
        .skel-dash-stats {
          gap: 0.5rem;
        }
        .skel-dash-stat-item .skeleton-shimmer:first-child {
          width: 30px !important; height: 18px !important;
        }
        .skel-dash-stat-item .skeleton-shimmer:last-child {
          width: 40px !important; height: 10px !important;
        }
        .skel-dash-footer { padding: 0.75rem 1rem; }
        .skel-dash-section { margin-top: 2rem; }
        .skel-dash-sec-head .skeleton-shimmer:last-child {
          width: 120px !important;
        }
      }
    `}} />
  </div>
  );
};
