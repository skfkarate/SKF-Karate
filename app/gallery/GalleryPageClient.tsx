'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { FaCamera, FaStar, FaTh } from 'react-icons/fa'
import ScrollReveal from '@/app/_components/ScrollReveal'
import GalleryLightbox from '@/app/_components/gallery/GalleryLightbox'
import './gallery.css'

type GalleryPhoto = {
  id?: string
  src: string
  title: string
  cat: string
  pinned?: boolean
  eventId?: string
  eventDate?: string
}

export default function GalleryPageClient({
  initialPhotos,
  categoryOrder,
}: {
  initialPhotos: GalleryPhoto[]
  categoryOrder: string[]
}) {
    const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
    const [activeCat, setActiveCat] = useState('All')

    const allPhotos = initialPhotos
    const availableCategories = categoryOrder.filter(cat => allPhotos.some(p => p.cat === cat))
    const displayedPhotos = activeCat === 'All' ? allPhotos : allPhotos.filter(p => p.cat === activeCat)

    const openLightbox = (i: number) => setLightboxIdx(i)
    const closeLightbox = () => setLightboxIdx(null)

    const goPrev = useCallback(() => {
        if (lightboxIdx === null) return
        setLightboxIdx(prev => prev !== null && prev > 0 ? prev - 1 : displayedPhotos.length - 1)
    }, [lightboxIdx, displayedPhotos.length])

    const goNext = useCallback(() => {
        if (lightboxIdx === null) return
        setLightboxIdx(prev => prev !== null && prev < displayedPhotos.length - 1 ? prev + 1 : 0)
    }, [lightboxIdx, displayedPhotos.length])

    useEffect(() => {
        if (lightboxIdx === null) return
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox()
            if (e.key === 'ArrowLeft') goPrev()
            if (e.key === 'ArrowRight') goNext()
        }
        document.body.style.overflow = 'hidden'
        window.addEventListener('keydown', handleKey)
        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', handleKey)
        }
    }, [lightboxIdx, goPrev, goNext])

    const currentPhoto = lightboxIdx !== null ? displayedPhotos[lightboxIdx] : null

    return (
        <div className="gallery-page">
            <div className="gal-orb gal-orb--1" />
            <div className="gal-orb gal-orb--2" />

            <section className="gal-hero">
                <div className="gal-hero__bg">
                    <div className="gal-hero__glow gal-hero__glow--1"></div>
                    <div className="gal-hero__glow gal-hero__glow--2"></div>
                </div>
                <div className="container gal-hero__content">
                    <span className="gal-badge"><FaCamera /> Media Gallery</span>
                    <h1 className="gal-hero__title">SKF <span className="gal-text-grad">Gallery</span></h1>
                    <p className="gal-hero__subtitle">Elite moments from the Dojo, championships, and masterclasses.</p>
                    <div className="gal-hero__stats-row">
                        <div className="gal-hero__stat">
                            <span className="gal-hero__stat-num">{allPhotos.length}</span>
                            <span className="gal-hero__stat-label">Photos</span>
                        </div>
                        <div className="gal-hero__stat-divider"></div>
                        <div className="gal-hero__stat">
                            <span className="gal-hero__stat-num">{availableCategories.length}</span>
                            <span className="gal-hero__stat-label">Categories</span>
                        </div>
                        <div className="gal-hero__stat-divider"></div>
                        <div className="gal-hero__stat">
                            <span className="gal-hero__stat-num">{allPhotos.filter(p => p.pinned).length}</span>
                            <span className="gal-hero__stat-label">Featured</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section gal-content-section">
                <div className="container">
                    <ScrollReveal>
                        <div className="gal-filter-bar">
                            <button
                                className={`gal-filter-pill ${activeCat === 'All' ? 'gal-filter-pill--active' : ''}`}
                                onClick={() => setActiveCat('All')}
                            >
                                <FaStar /> All
                            </button>
                            {availableCategories.map(cat => (
                                <button
                                    key={cat}
                                    className={`gal-filter-pill ${activeCat === cat ? 'gal-filter-pill--active' : ''}`}
                                    onClick={() => setActiveCat(cat)}
                                >
                                    <FaTh /> {cat}
                                </button>
                            ))}
                        </div>
                    </ScrollReveal>

                    <ScrollReveal delay={0.1}>
                        <div className="gal-section-header">
                            <h2 className="gal-section-title">
                                {activeCat === 'All' ? 'All' : activeCat} <span className="gal-text-grad">Photos</span>
                            </h2>
                            <span className="gal-photo-count">{displayedPhotos.length} photo{displayedPhotos.length !== 1 ? 's' : ''}</span>
                        </div>
                    </ScrollReveal>

                    {activeCat === 'Events' ? (
                        <div className="gal-events-timeline space-y-12">
                            {Object.entries(
                                displayedPhotos.reduce((acc, photo) => {
                                    const key = photo.eventId || 'other'
                                    if (!acc[key]) acc[key] = []
                                    acc[key].push(photo)
                                    return acc
                                }, {} as Record<string, typeof displayedPhotos>)
                            )
                            .sort(([, a], [, b]) => {
                                const dateA = a[0]?.eventDate ? new Date(a[0].eventDate).getTime() : 0
                                const dateB = b[0]?.eventDate ? new Date(b[0].eventDate).getTime() : 0
                                return dateB - dateA
                            })
                            .map(([eventId, eventPhotos], groupIndex) => {
                                // Extract event name from the first photo's title (e.g. "Event Name - Photo")
                                const eventName = eventPhotos[0]?.title.split(' - ')[0] || 'Special Event'
                                const eventDate = eventPhotos[0]?.eventDate 
                                    ? new Date(eventPhotos[0].eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
                                    : ''
                                
                                return (
                                    <div key={eventId} className="gal-timeline-group relative">
                                        {/* Timeline connector */}
                                        {groupIndex !== 0 && (
                                            <div className="absolute -top-12 left-4 h-12 w-0.5 bg-gradient-to-b from-transparent to-amber-500/30 md:left-8"></div>
                                        )}
                                        
                                        <ScrollReveal delay={0.1}>
                                            <div className="mb-6 flex items-center gap-4 pl-0 md:pl-4">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 ring-1 ring-amber-500/50">
                                                    <div className="h-2.5 w-2.5 rounded-full bg-amber-500"></div>
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white md:text-2xl">{eventName}</h3>
                                                    {eventDate && <p className="text-sm text-zinc-400">{eventDate}</p>}
                                                </div>
                                            </div>
                                        </ScrollReveal>
                                        
                                        <div className="masonry-grid pl-4 md:pl-12">
                                            {eventPhotos.map((p, i) => {
                                                const globalIdx = displayedPhotos.findIndex(photo => photo.id === p.id)
                                                return (
                                                    <ScrollReveal key={`${activeCat}-${p.id || i}`} delay={(i % 4) * 0.06}>
                                                        <div
                                                            className="gal-item"
                                                            onClick={() => openLightbox(globalIdx)}
                                                            role="button"
                                                            tabIndex={0}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter' || e.key === ' ') {
                                                                    e.preventDefault()
                                                                    openLightbox(globalIdx)
                                                                }
                                                            }}
                                                        >
                                                            <Image
                                                                src={p.src}
                                                                alt={p.title}
                                                                className="gal-item__img"
                                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                                width={800}
                                                                height={600}
                                                                style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                                                            />
                                                            {p.pinned && <div className="gal-item__star"><FaStar /></div>}
                                                            <div className="gal-item__overlay">
                                                                <span className="gal-item__cat">{p.cat}</span>
                                                                <p className="gal-item__title">{p.title}</p>
                                                            </div>
                                                        </div>
                                                    </ScrollReveal>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="masonry-grid">
                            {displayedPhotos.map((p, i) => (
                                <ScrollReveal key={`${activeCat}-${p.id || i}`} delay={(i % 4) * 0.06}>
                                    <div
                                        className="gal-item"
                                        onClick={() => openLightbox(i)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault()
                                                openLightbox(i)
                                            }
                                        }}
                                    >
                                        <Image
                                            src={p.src}
                                            alt={p.title}
                                            className="gal-item__img"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            width={800}
                                            height={600}
                                            style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                                        />
                                        {p.pinned && <div className="gal-item__star"><FaStar /></div>}
                                        <div className="gal-item__overlay">
                                            <span className="gal-item__cat">{p.cat}</span>
                                            <p className="gal-item__title">{p.title}</p>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            {lightboxIdx !== null && (
              <GalleryLightbox
                closeLightbox={closeLightbox}
                currentPhoto={currentPhoto}
                displayedPhotos={displayedPhotos}
                goNext={goNext}
                goPrev={goPrev}
                lightboxIdx={lightboxIdx}
              />
            )}
        </div>
    )
}
