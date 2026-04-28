import React from 'react';
import { SkeletonLine, SkeletonCircle, SkeletonBlock, SkeletonButton } from './SkeletonPrimitives';

export const DashboardPageSkeleton = () => (
  <div className="ap-page kuroobi-dashboard" style={{ background: 'transparent', minHeight: 'auto' }} aria-label="Loading dashboard" aria-busy="true">
    <div className="ap-container">
      {/* 1. AthleteHero skeleton */}
      <section className="ap-hero">
        <div className="ap-hero-bento">
          <div className="ap-hero-bento__grid">
            {/* Portrait Card */}
            <div className="ap-bento-card ap-bento-portrait">
              <SkeletonBlock width="100%" height="100%" radius={0} />
            </div>

            {/* Right side data grid */}
            <div className="ap-bento-data">
              {/* Integrated Premium Header */}
              <div className="ap-bento-header" style={{ padding: '2rem' }}>
                <SkeletonLine width="120px" height={12} style={{ marginBottom: '8px' }} />
                <SkeletonLine width="280px" height={36} style={{ marginBottom: '16px' }} />
                <div style={{ display: 'flex', gap: '16px' }}>
                  <SkeletonLine width="80px" height={14} />
                  <SkeletonLine width="160px" height={14} />
                </div>
              </div>

              {/* Rank Box */}
              <div className="ap-bento-card ap-bento-rank" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <SkeletonLine width="100px" height={12} style={{ marginBottom: '8px' }} />
                    <SkeletonLine width="160px" height={24} style={{ marginBottom: '8px' }} />
                    <SkeletonLine width="80px" height={14} />
                  </div>
                  <SkeletonCircle size={64} style={{ borderRadius: '12px' }} />
                </div>
              </div>

              {/* Stats Box */}
              <div className="ap-bento-card ap-bento-stats" style={{ padding: '2rem', display: 'flex', gap: '2rem' }}>
                {[...Array(4)].map((_, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <SkeletonLine width="40px" height={24} />
                    <SkeletonLine width="60px" height={12} />
                  </div>
                ))}
              </div>

              {/* Medals Box */}
              <div className="ap-bento-card ap-bento-medals" style={{ padding: '2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <SkeletonCircle size={32} />
                    <SkeletonLine width="40px" height={14} />
                  </div>
                ))}
                <div style={{ width: '1px', height: '30px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <SkeletonLine width="32px" height={24} />
                  <SkeletonLine width="40px" height={14} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. NextEventsSection skeleton */}
      <section className="ap-section" style={{ marginTop: '3rem' }}>
        <div className="ap-sec-head" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SkeletonCircle size={24} />
          <SkeletonLine width="180px" height={20} />
        </div>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'hidden' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ flex: '1', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <SkeletonLine width="100px" height={12} style={{ marginBottom: '12px' }} />
              <SkeletonLine width="100%" height={16} style={{ marginBottom: '8px' }} />
              <SkeletonLine width="70%" height={16} />
            </div>
          ))}
        </div>
      </section>

      {/* 3. TabbedCompetitions skeleton */}
      <section className="ap-section" style={{ marginTop: '3rem' }}>
        <div className="ap-sec-head" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <SkeletonCircle size={24} />
          <SkeletonLine width="200px" height={20} />
        </div>
        <div className="ap-panel" style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '2rem' }}>
            <SkeletonButton width={140} height={36} style={{ borderRadius: '20px' }} />
            <SkeletonButton width={100} height={36} style={{ borderRadius: '20px' }} />
            <SkeletonButton width={120} height={36} style={{ borderRadius: '20px' }} />
          </div>
          
          {/* Category overview */}
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
             <div>
                <SkeletonLine width="180px" height={24} style={{ marginBottom: '1rem' }} />
                <SkeletonLine width="240px" height={14} />
             </div>
             <SkeletonCircle size={60} style={{ borderRadius: '12px' }} />
          </div>

          {/* Filter */}
          <SkeletonBlock width="100%" height={44} radius={8} style={{ marginBottom: '1rem' }} />

          {/* Table */}
          <div style={{ marginTop: '1rem' }}>
             <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px', marginBottom: '12px' }}>
               <SkeletonLine width="12%" height={14} style={{ marginRight: '1rem' }} />
               <SkeletonLine width="30%" height={14} style={{ marginRight: '1rem' }} />
               <SkeletonLine width="16%" height={14} style={{ marginRight: '1rem' }} />
               <SkeletonLine width="14%" height={14} style={{ marginRight: '1rem' }} />
               <SkeletonLine width="10%" height={14} style={{ marginRight: '1rem' }} />
               <SkeletonLine width="8%" height={14} style={{ marginRight: '1rem' }} />
               <SkeletonLine width="10%" height={14} />
             </div>
             {[...Array(5)].map((_, i) => (
               <div key={i} style={{ display: 'flex', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                 <SkeletonLine width="10%" height={14} style={{ marginRight: '1rem' }} />
                 <SkeletonLine width="28%" height={14} style={{ marginRight: '1rem' }} />
                 <SkeletonLine width="14%" height={14} style={{ marginRight: '1rem' }} />
                 <SkeletonLine width="12%" height={14} style={{ marginRight: '1rem' }} />
                 <SkeletonCircle size={24} style={{ marginRight: '1rem' }} />
                 <SkeletonLine width="6%" height={14} style={{ marginRight: '1rem' }} />
                 <SkeletonLine width="8%" height={14} />
               </div>
             ))}
          </div>
        </div>
      </section>

    </div>
  </div>
);
