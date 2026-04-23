'use client'

import { useState } from 'react'
import { FaPlay, FaTimes } from 'react-icons/fa'
import type { PortalVideoRecord } from '@/lib/server/repositories/portal-content-live'

type Props = {
    videos: PortalVideoRecord[]
    hideBeltFilter?: boolean
}

export default function TechniquesClient({ videos, hideBeltFilter }: Props) {
    const [activeCategory, setActiveCategory] = useState('all')
    const [activeBelt, setActiveBelt] = useState('All')
    const [activeVideo, setActiveVideo] = useState<PortalVideoRecord | null>(null)

    const categories = [
        { value: 'all', label: 'All' },
        { value: 'kata', label: 'Kata' },
        { value: 'kumite', label: 'Kumite' },
        { value: 'techniques', label: 'Kihon' },
        { value: 'bunkai', label: 'Bunkai' },
        { value: 'fitness', label: 'Conditioning' },
        { value: 'seminar', label: 'Seminar' },
    ]
    const beltTabs = [
        { label: 'All', value: 'All' },
        { label: 'Beginner (White–Yellow)', value: 'beginner' },
        { label: 'Intermediate (Orange–Green)', value: 'intermediate' },
        { label: 'Advanced (Blue–Black)', value: 'advanced' }
    ]

    const getBeltGroup = (beltLevel: string) => {
        const bl = beltLevel.toLowerCase()
        if (['white', 'yellow'].includes(bl)) return 'beginner'
        if (['orange', 'green'].includes(bl)) return 'intermediate'
        if (['blue', 'brown', 'black'].includes(bl)) return 'advanced'
        return 'other'
    }

    const matchesBeltFilter = (video: PortalVideoRecord) => {
        if (activeBelt === 'All') return true
        if (!video.beltLevels?.length) return true
        return video.beltLevels.some((beltLevel) => getBeltGroup(beltLevel) === activeBelt)
    }

    const formatBeltLabel = (video: PortalVideoRecord) => {
        if (!video.beltLevels?.length) return 'All Belts'
        const labels = video.beltLevels.map((belt) => belt.charAt(0).toUpperCase() + belt.slice(1))
        return labels.length <= 2 ? labels.join(' • ') : `${labels.slice(0, 2).join(' • ')} +${labels.length - 2}`
    }

    const filtered = videos.filter(v => {
        if (activeCategory !== 'all' && v.category.toLowerCase() !== activeCategory.toLowerCase()) {
            return false
        }
        if (!hideBeltFilter && !matchesBeltFilter(v)) {
            return false
        }
        return true
    })

    return (
        <div>
            {/* Filters */}
            <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                    {categories.map(cat => (
                        <button
                            key={cat.value}
                            onClick={() => setActiveCategory(cat.value)}
                            style={{
                                background: activeCategory === cat.value ? 'var(--gold, #ffb703)' : 'rgba(255,255,255,0.05)',
                                color: activeCategory === cat.value ? '#000' : '#fff',
                                border: '1px solid',
                                borderColor: activeCategory === cat.value ? 'var(--gold, #ffb703)' : 'rgba(255,255,255,0.1)',
                                padding: '0.6rem 1.4rem',
                                borderRadius: '50px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                fontSize: '0.9rem'
                            }}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {!hideBeltFilter && (
                    <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '1rem', justifyContent: 'center' }}>
                        {beltTabs.map(tab => (
                            <button
                                key={tab.label}
                                onClick={() => setActiveBelt(tab.value)}
                                style={{
                                    background: activeBelt === tab.value ? 'var(--crimson, #dc3545)' : 'rgba(255,255,255,0.05)',
                                    color: '#fff',
                                    border: '1px solid',
                                    borderColor: activeBelt === tab.value ? 'var(--crimson, #dc3545)' : 'rgba(255,255,255,0.1)',
                                    padding: '0.5rem 1.2rem',
                                    borderRadius: '50px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap',
                                    fontSize: '0.85rem'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Video Grid */}
            {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#666', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                    No technique videos available for these filters.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {filtered.map(video => {
                        return (
                            <div 
                                key={video.id} 
                                onClick={() => setActiveVideo(video)}
                                style={{
                                    background: 'rgba(10, 15, 28, 0.65)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    transition: 'transform 0.2s, background 0.2s, box-shadow 0.2s',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backdropFilter: 'blur(10px)'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.transform = 'translateY(-4px)'
                                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)'
                                    e.currentTarget.style.borderColor = 'rgba(255,183,3,0.3)'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = 'none'
                                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                                }}
                            >
                                <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
                                    {video.thumbnailUrl ? (
                                        <img
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(214,40,40,0.25), rgba(255,183,3,0.12))' }} />
                                    )}
                                    <div style={{ 
                                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        background: 'rgba(0,0,0,0.3)'
                                    }}>
                                        <div style={{ 
                                            width: '50px', height: '50px', background: 'rgba(214, 40, 40, 0.9)', 
                                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontSize: '1.2rem', boxShadow: '0 0 20px rgba(214,40,40,0.5)'
                                        }}>
                                            <FaPlay style={{ marginLeft: '4px' }} />
                                        </div>
                                    </div>
                                    <span style={{ 
                                        position: 'absolute', bottom: '0.8rem', right: '0.8rem', background: 'rgba(0,0,0,0.8)', 
                                        color: '#fff', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' 
                                    }}>
                                        {video.durationLabel || 'ON DEMAND'}
                                    </span>
                                </div>
                                <div style={{ padding: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1rem', color: '#fff' }}>
                                        {video.title}
                                    </h3>
                                    <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                                        <span style={{ 
                                            background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)', 
                                            padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold',
                                            textTransform: 'uppercase'
                                        }}>
                                            {categories.find((category) => category.value === video.category)?.label || video.category || 'General'}
                                        </span>
                                        <span style={{ 
                                            background: 'rgba(255, 183, 3, 0.1)', color: 'var(--gold, #ffb703)', 
                                            padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold',
                                            textTransform: 'uppercase'
                                        }}>
                                            {formatBeltLabel(video)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Video Modal */}
            {activeVideo && (
                <div style={{ 
                    position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' 
                }} onClick={() => setActiveVideo(null)}>
                    
                    <button style={{ 
                        position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', 
                        color: '#fff', fontSize: '2rem', cursor: 'pointer', zIndex: 10000 
                    }} onClick={() => setActiveVideo(null)}>
                        <FaTimes />
                    </button>
                    
                    <div style={{ width: '100%', maxWidth: '1000px', aspectRatio: '16/9', background: '#000', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }} onClick={e => e.stopPropagation()}>
                        {activeVideo.playbackMode === 'iframe' ? (
                            <iframe 
                                src={activeVideo.playbackUrl} 
                                style={{ width: '100%', height: '100%', border: 'none' }}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        ) : (
                            <video
                                src={activeVideo.playbackUrl}
                                style={{ width: '100%', height: '100%' }}
                                controls
                                autoPlay
                                playsInline
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
