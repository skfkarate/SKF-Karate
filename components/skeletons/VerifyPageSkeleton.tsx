import React from 'react'
import { SkeletonLine, SkeletonCircle } from './SkeletonPrimitives'
import '@/app/verify/verify.css'

export default function VerifyPageSkeleton() {
    return (
        <div className="verify-page" aria-busy="true">
            <div className="verify-bg" />
            
            <div className="verify-container">
                {/* ═══════ HEADER ═══════ */}
                <div className="verify-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="verify-icon-wrapper" style={{ border: 'none', background: 'transparent' }}>
                        <SkeletonCircle size={60} />
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <SkeletonLine width="280px" height={48} />
                    </div>
                    <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <SkeletonLine width="400px" height={14} />
                        <SkeletonLine width="320px" height={14} />
                    </div>
                </div>

                {/* ═══════ SEARCH FORM ═══════ */}
                <div className="verify-form-wrapper">
                    <div className="verify-input-group">
                        <div className="verify-input-wrapper" style={{ display: 'flex', flex: 1, border: 'none', background: 'transparent' }}>
                            <SkeletonLine width="100%" height={24} style={{ background: 'transparent', borderBottom: '2px solid rgba(255,255,255,0.1)' }} />
                        </div>
                        <SkeletonLine width="140px" height={56} style={{ borderRadius: '12px' }} />
                    </div>
                </div>

                {/* ═══════ TRUST BADGES ═══════ */}
                <div className="verify-trust-badges" style={{ marginTop: '3rem' }}>
                    <div className="trust-badge" style={{ border: 'none', background: 'transparent' }}>
                        <SkeletonLine width="140px" height={20} style={{ borderRadius: '20px' }} />
                    </div>
                    <div className="trust-badge" style={{ border: 'none', background: 'transparent' }}>
                        <SkeletonLine width="140px" height={20} style={{ borderRadius: '20px' }} />
                    </div>
                    <div className="trust-badge" style={{ border: 'none', background: 'transparent' }}>
                        <SkeletonLine width="140px" height={20} style={{ borderRadius: '20px' }} />
                    </div>
                </div>
            </div>
        </div>
    )
}
