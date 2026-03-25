'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { FaCamera, FaStar, FaTh } from 'react-icons/fa'
import ScrollReveal from '@/app/_components/ScrollReveal'
import GalleryLightbox from '@/app/_components/gallery/GalleryLightbox'
import { allPhotos, categoryOrder } from '@/app/_components/gallery/galleryPhotoData'
import './gallery.css'

export default function GalleryPage() {
    const [lightboxIdx, setLightboxIdx] = useState(null)
    const [activeCat, setActiveCat] = useState('All')

    const availableCategories = categoryOrder.filter(cat => allPhotos.some(p => p.cat === cat))
    const displayedPhotos = activeCat === 'All' ? allPhotos : allPhotos.filter(p => p.cat === activeCat)

    const openLightbox = (i) => setLightboxIdx(i)
    const closeLightbox = () => setLightboxIdx(null)

    const goPrev = useCallback(() => {
        if (lightboxIdx === null) return
        setLightboxIdx(prev => prev > 0 ? prev - 1 : displayedPhotos.length - 1)
    }, [lightboxIdx, displayedPhotos.length])

    const goNext = useCallback(() => {
        if (lightboxIdx === null) return
        setLightboxIdx(prev => prev < displayedPhotos.length - 1 ? prev + 1 : 0)
    }, [lightboxIdx, displayedPhotos.length])

    // Keyboard navigation
    useEffect(() => {
        if (lightboxIdx === null) return
        const handleKey = (e) => {
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
            {/* HERO */}
            <section className="gal-hero">
                <div className="gal-hero__bg">
                    <div className="gal-hero__glow gal-hero__glow--1"></div>
                    <div className="gal-hero__glow gal-hero__glow--2"></div>
                </div>
                <div className="container gal-hero__content">
                    <span className="gal-badge"><FaCamera /> Media Gallery</span>
                    <h1 className="gal-hero__title">Our <span className="gal-text-grad">Gallery</span></h1>
                    <p className="gal-hero__subtitle">Moments from the Dojo, Tournaments, and Championships</p>
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

            {/* GALLERY CONTENT */}
            <section className="section gal-content-section">
                <div className="container">

                    {/* FILTER TABS */}
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

                    {/* SECTION HEADER */}
                    <ScrollReveal delay={0.1}>
                        <div className="gal-section-header">
                            <h2 className="gal-section-title">
                                {activeCat === 'All' ? 'All' : activeCat} <span className="gal-text-grad">Photos</span>
                            </h2>
                            <span className="gal-photo-count">{displayedPhotos.length} photo{displayedPhotos.length !== 1 ? 's' : ''}</span>
                        </div>
                    </ScrollReveal>

                    {/* MASONRY GRID */}
                    <div className="masonry-grid">
                        {displayedPhotos.map((p, i) => (
                            <ScrollReveal key={`${activeCat}-${i}`} delay={(i % 4) * 0.06}>
                                <div className="gal-item" onClick={() => openLightbox(i)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openLightbox(i)}>
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
                </div>
            </section>
            <GalleryLightbox
              closeLightbox={closeLightbox}
              currentPhoto={currentPhoto}
              displayedPhotos={displayedPhotos}
              goNext={goNext}
              goPrev={goPrev}
              lightboxIdx={lightboxIdx}
            />
        </div>
    )
}
