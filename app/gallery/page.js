'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { FaCamera, FaStar, FaTh, FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa'
import ScrollReveal from '../components/ScrollReveal'
import './gallery.css'

const allPhotos = [
    { src: '/gallery/Tournment8 starred.jpeg', title: 'A Proud Champion Flashes Her Gold Medal', cat: 'Tournaments', pinned: true },
    { src: '/gallery/Karate Demonstration2 starred.jpeg', title: 'Team Pose with Weapons — Demo Day', cat: 'Demonstrations', pinned: true },
    { src: '/gallery/In dojo 2 starred.jpeg', title: 'Sensei with Little Karatekas — Smiles at the Dojo', cat: 'In Dojo', pinned: true },
    { src: '/gallery/Train the Elite - Training Camp starred.jpeg', title: 'Train the Elite Camp — Certificate Ceremony', cat: 'Camps', pinned: true },
    { src: '/gallery/tounrmentss.jpg', title: 'Karateka Competing in a Tournament', cat: 'Tournaments', pinned: false },
    { src: '/gallery/tournmentss.jpg', title: 'Competition Match at a Karate Tournament', cat: 'Tournaments', pinned: false },
    { src: '/gallery/beltexam.jpg', title: 'Athletes Participating in Belt Promotion Exam', cat: 'Belt Exams', pinned: false },
    { src: '/gallery/Karate Demonstration.jpeg', title: 'Synchronized Kicks — Outdoor Demo', cat: 'Demonstrations', pinned: false },
    { src: '/gallery/belt.jpg', title: 'Belt Grading Ceremony', cat: 'Belt Exams', pinned: false },
    { src: '/gallery/Tournment.jpeg', title: 'All-India Kata Championship — Medal Winners', cat: 'Tournaments', pinned: false },
    { src: '/gallery/Tournment2.jpeg', title: 'Kumite Squad with Judges & Officials', cat: 'Tournaments', pinned: false },
    { src: '/gallery/Tournment5.jpeg', title: 'Young Karatekas Ready for Action', cat: 'Tournaments', pinned: false },
    { src: '/gallery/Tournment4.jpeg', title: 'Cheering Before the Final Round', cat: 'Tournaments', pinned: false },
    { src: '/gallery/In Dojo.jpeg', title: 'Senseis Leading Morning Formation', cat: 'In Dojo', pinned: false },
    { src: '/gallery/Tournment3.jpeg', title: 'Team Group Photo at the Arena', cat: 'Tournaments', pinned: false },
    { src: '/gallery/Kungal belt examination.jpeg', title: 'Kungal Kyu Grading — Certificates with Sensei', cat: 'Belt Exams', pinned: false },
    { src: '/gallery/belt exam.jpeg', title: 'National Championship Certificate Ceremony', cat: 'Belt Exams', pinned: false },
    { src: '/gallery/Tournment6.jpeg', title: 'Post-Match Celebrations', cat: 'Tournaments', pinned: false },
    { src: '/gallery/Tournment7.jpeg', title: 'Team Huddle at the Championship', cat: 'Tournaments', pinned: false },
    { src: '/gallery/Tournment9.jpeg', title: 'Tournament Day — Full Team Line-Up', cat: 'Tournaments', pinned: false },
    { src: '/gallery/Tournment10.jpeg', title: 'State-Level Championship Competitors', cat: 'Tournaments', pinned: false },
    { src: '/gallery/Tournment 11.jpeg', title: 'Victory Thumbs-Up after Tournament', cat: 'Tournaments', pinned: false },
    { src: '/gallery/In Dojo 3.jpeg', title: 'Young Warriors Standing in Seiza', cat: 'In Dojo', pinned: false },
    { src: '/gallery/In dogo.jpeg', title: 'All Belts United — Dojo Group Photo', cat: 'In Dojo', pinned: false },
    { src: '/gallery/beltt.jpg', title: 'Martial Arts Belt Exam Session', cat: 'Belt Exams', pinned: false },
    { src: '/gallery/IMG_1191.JPG.jpeg', title: 'Dojo Family — A Legacy of Discipline', cat: 'In Dojo', pinned: false },
    { src: '/gallery/Training.jpeg', title: 'Training Unit — Team on the Tatami', cat: 'Camps', pinned: false },
    { src: '/gallery/Tournment 12.jpeg', title: 'Senseis and Champions on the Mat', cat: 'Tournaments', pinned: false },
    { src: '/gallery/Tournment 13.jpeg', title: 'Award Ceremony — Certificate Presentation', cat: 'Tournaments', pinned: false },
    { src: '/gallery/Kungial district level championship.jpeg', title: 'Kungial District-Level Championship — Medalists', cat: 'Championships', pinned: false },
    { src: '/gallery/International seminar by john wick.jpeg', title: 'International Seminar — Sensei Jon Wicks', cat: 'Seminars', pinned: false },
]

const categoryOrder = ['Demonstrations', 'Tournaments', 'Belt Exams', 'In Dojo', 'Camps', 'Championships', 'Seminars']

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
                                <div className="gal-item" onClick={() => openLightbox(i)}>
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

            {/* LIGHTBOX WITH NAVIGATION */}
            {currentPhoto && (
                <div className="gal-lightbox" onClick={closeLightbox}>
                    <div className="gal-lightbox__inner" onClick={(e) => e.stopPropagation()}>
                        {/* Close */}
                        <button className="gal-lightbox__close" onClick={closeLightbox} aria-label="Close">
                            <FaTimes />
                        </button>

                        {/* Prev / Next */}
                        <button className="gal-lightbox__nav gal-lightbox__nav--prev" onClick={goPrev} aria-label="Previous">
                            <FaChevronLeft />
                        </button>
                        <button className="gal-lightbox__nav gal-lightbox__nav--next" onClick={goNext} aria-label="Next">
                            <FaChevronRight />
                        </button>

                        {/* Image */}
                        <div className="gal-lightbox__img-wrap">
                            <img src={currentPhoto.src} alt={currentPhoto.title} className="gal-lightbox__img" />
                        </div>

                        {/* Caption + Counter */}
                        <div className="gal-lightbox__caption">
                            <span className="gal-item__cat">{currentPhoto.cat}</span>
                            <p className="gal-lightbox__title">{currentPhoto.title}</p>
                            <span className="gal-lightbox__counter">{lightboxIdx + 1} / {displayedPhotos.length}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
