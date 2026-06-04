import React from 'react'
import { SkeletonLine, SkeletonButton, SkeletonCircle } from './SkeletonPrimitives'
import '@/app/events/events.css'

/**
 * EventsPageSkeleton — mirrors events-page layout:
 * Hero (badge + title + subtitle + countdown) → Toolbar (tabs + filters) → Timeline with event cards
 */
export default function EventsPageSkeleton() {
  return (
    <div className="events-page" aria-label="Loading events" aria-busy="true" aria-hidden="true">
      <div className="ev-orb ev-orb--1" />
      <div className="ev-orb ev-orb--2" />
      <div className="ev-watermark">行事</div>

      {/* ── Hero ── */}
      <section className="ev-hero">
        <div className="ev-hero__bg" />
        <div className="container ev-hero__content">
          <SkeletonLine width="150px" height={28} style={{ borderRadius: 50, marginBottom: 20 }} />
          <div className="ev-hero__title" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: 12 }}>
             <SkeletonLine width="300px" height={60} />
          </div>
          <SkeletonLine width="min(80%, 400px)" height={16} style={{ marginBottom: 32 }} />

          {/* Countdown block */}
          <div className="ev-countdown" style={{ width: '100%', maxWidth: 600 }}>
            <div className="ev-countdown__label">
              <SkeletonLine width="100px" height={16} />
            </div>
            <div className="ev-countdown__timer" style={{ gap: 16 }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="ev-countdown__unit">
                  <SkeletonLine width="50px" height={40} style={{ margin: '0 auto 8px' }} />
                  <SkeletonLine width="40px" height={10} style={{ margin: '0 auto' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Toolbar ── */}
      <div className="ev-toolbar">
        <div className="container ev-toolbar__inner">
          <div className="ev-toolbar__tabs">
            <SkeletonButton width={100} height={42} style={{ borderRadius: '8px' }} />
            <SkeletonButton width={80} height={42} style={{ borderRadius: '8px' }} />
          </div>
          <div className="ev-toolbar__filters">
             <SkeletonCircle size={16} />
            {[...Array(4)].map((_, i) => (
              <SkeletonButton key={i} width={80} height={32} style={{ borderRadius: '6px' }} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Event Timeline ── */}
      <section className="ev-content">
        <div className="container">
          <div className="ev-timeline">
             <div className="ev-timeline__group">
                <div className="ev-timeline__month-header">
                  <div className="ev-timeline__month-dot" />
                  <SkeletonLine width="150px" height={24} />
                  <SkeletonLine width="60px" height={14} style={{ marginLeft: '1rem' }} />
                </div>

                <div className="ev-timeline__events">
                  {[...Array(3)].map((_, i) => (
                    <div className="ev-card" key={i}>
                      {/* Left: Date */}
                      <div className="ev-card__date" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                         <SkeletonLine width="40px" height={16} style={{ marginBottom: 4 }} />
                         <SkeletonLine width="50px" height={36} />
                      </div>

                      {/* Timeline Connector */}
                      <div className="ev-card__connector">
                        <div className="ev-card__dot" />
                      </div>

                      {/* Right: Content */}
                      <div className="ev-card__body">
                        <div className="ev-card__top">
                          <SkeletonLine width="80px" height={24} style={{ borderRadius: '6px' }} />
                        </div>
                        <SkeletonLine width="80%" height={24} style={{ margin: '1rem 0' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: '1.5rem' }}>
                           <SkeletonLine width="100%" height={14} />
                           <SkeletonLine width="85%" height={14} />
                        </div>
                        <div className="ev-card__footer">
                           <SkeletonLine width="180px" height={14} />
                           <SkeletonButton width={140} height={36} style={{ borderRadius: '6px' }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </section>
    </div>
  )
}
