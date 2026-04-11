'use client'

import { useState } from 'react'
import Image from 'next/image'
import { TechniqueVideo } from '@/lib/server/sheets'
import { FaPlay, FaTimes } from 'react-icons/fa'

type Props = {
    videos: TechniqueVideo[]
    hideBeltFilter?: boolean
}

export default function TechniquesClient({ videos, hideBeltFilter }: Props) {
    const [activeCategory, setActiveCategory] = useState('All')
    const [activeBelt, setActiveBelt] = useState('All')
    const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null)

    const categories = ['All', 'Kata', 'Kumite', 'Kihon', 'Conditioning']
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

    const filtered = videos.filter(v => {
        if (activeCategory !== 'All' && v.category.toLowerCase() !== activeCategory.toLowerCase()) {
            return false
        }
        if (!hideBeltFilter && activeBelt !== 'All') {
            if (activeBelt !== getBeltGroup(v.beltLevel)) {
                return false
            }
        }
        return true
    })

    function extractVideoId(url: string) {
        if (!url) return null;
        let match = url.match(/embed\/([^?]+)/);
        return match ? match[1] : null;
    }

    return (
        <div>
            {/* Filters */}
            <div style={{ marginBottom: '3rem' }}>
                <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            style={{
                                background: activeCategory === cat ? 'var(--gold, #ffb703)' : 'rgba(255,255,255,0.05)',
                                color: activeCategory === cat ? '#000' : '#fff',
                                border: '1px solid',
                                borderColor: activeCategory === cat ? 'var(--gold, #ffb703)' : 'rgba(255,255,255,0.1)',
                                padding: '0.6rem 1.4rem',
                                borderRadius: '50px',
                                fontWeight: 'bold',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                whiteSpace: 'nowrap',
                                fontSize: '0.9rem'
                            }}
                        >
                            {cat}
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
                        const vId = extractVideoId(video.youtubeUrl)
                        const thumbnailUrl = vId ? `https://img.youtube.com/vi/${vId}/maxresdefault.jpg` : ''
                        return (
                            <div 
                                key={video.videoId} 
                                onClick={() => setActiveVideoUrl(video.youtubeUrl)}
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
                                    {thumbnailUrl && (
                                        <Image 
                                            src={thumbnailUrl} 
                                            alt={video.title} 
                                            fill
                                            style={{ objectFit: 'cover', opacity: 0.8 }} 
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.srcset = `https://img.youtube.com/vi/${vId}/hqdefault.jpg`;
                                            }}
                                        />
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
                                        {video.durationMin} MIN
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
                                            {video.category || 'General'}
                                        </span>
                                        <span style={{ 
                                            background: 'rgba(255, 183, 3, 0.1)', color: 'var(--gold, #ffb703)', 
                                            padding: '0.3rem 0.8rem', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold',
                                            textTransform: 'uppercase'
                                        }}>
                                            {video.beltLevel || 'All Belts'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Video Modal */}
            {activeVideoUrl && (
                <div style={{ 
                    position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.9)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' 
                }} onClick={() => setActiveVideoUrl(null)}>
                    
                    <button style={{ 
                        position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', 
                        color: '#fff', fontSize: '2rem', cursor: 'pointer', zIndex: 10000 
                    }} onClick={() => setActiveVideoUrl(null)}>
                        <FaTimes />
                    </button>
                    
                    <div style={{ width: '100%', maxWidth: '1000px', aspectRatio: '16/9', background: '#000', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }} onClick={e => e.stopPropagation()}>
                        <iframe 
                            src={activeVideoUrl} 
                            style={{ width: '100%', height: '100%', border: 'none' }}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>
            )}
        </div>
    )
}
