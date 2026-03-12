'use client'

import { useState } from 'react'
import { FaCamera, FaStar, FaTh } from 'react-icons/fa'
import './gallery.css'

/*
  ── SMART REORDERED GALLERY DATA ──
  Pinned photos and high-impact visual shots (medals, action) at the top.
*/
const allPhotos = [
    // ═══ Top Priority (Starred / Hero) ═══
    { src: '/gallery/Tournment8 starred.jpeg', title: 'A Proud Champion Flashes Her Gold Medal', cat: 'Tournaments', pinned: true },
    { src: '/gallery/Karate Demonstration2 starred.jpeg', title: 'Team Pose with Weapons — Demo Day', cat: 'Demonstrations', pinned: true },
    { src: '/gallery/In dojo 2 starred.jpeg', title: 'Sensei with Little Karatekas — Smiles at the Dojo', cat: 'In Dojo', pinned: true },
    { src: '/gallery/Train the Elite - Training Camp starred.jpeg', title: 'Train the Elite Camp — Certificate Ceremony', cat: 'Camps', pinned: true },
    { src: '/gallery/tounrmentss.jpg', title: 'Karateka Competing in a Tournament', cat: 'Tournaments', pinned: false },
    { src: '/gallery/tournmentss.jpg', title: 'Competition Match at a Karate Tournament', cat: 'Tournaments', pinned: false },
    { src: '/gallery/beltexam.jpg', title: 'Students Participating in Belt Promotion Exam', cat: 'Belt Exams', pinned: false },
    
    // ═══ Remainder Sorted Logically ═══
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

export default function GalleryPage() {
    const [lightbox, setLightbox] = useState(null)
    const [activeCat, setActiveCat] = useState('Starred')

    const pinnedPhotos = allPhotos.filter(p => p.pinned)
    const categoryOrder = ['Demonstrations', 'Tournaments', 'Belt Exams', 'In Dojo', 'Camps', 'Championships', 'Seminars']
    const availableCategories = categoryOrder.filter(cat => allPhotos.some(p => p.cat === cat))

    // For "Starred", we actually just want to show the top pinned hits, but it might be better to show All photos prioritizing pinned 
    // Wait, the original code filtered strictly by p.pinned. We will stick to that or let Starred mean "Highlighted"
    const displayedPhotos = activeCat === 'Starred' ? allPhotos : allPhotos.filter(p => p.cat === activeCat)

    return (
        <div className="gallery-page">
            <section className="page-hero gallery-hero">
                <div className="container page-hero__content">
                    <span className="section-label"><FaCamera /> Media</span>
                    <h1 className="page-hero__title">Our <span className="text-gradient">Gallery</span></h1>
                    <p className="page-hero__subtitle">Moments from the Dojo, Tournaments, and Championships</p>
                </div>
            </section>

            <section className="section gallery-content-section">
                <div className="container">

                    {/* TABS */}
                    <div className="gallery-tabs">
                        <button
                            className={`gallery-tab ${activeCat === 'Starred' ? 'active gallery-tab--star' : ''}`}
                            onClick={() => setActiveCat('Starred')}
                        >
                            <FaStar /> All Highlights
                        </button>
                        {availableCategories.map(cat => (
                            <button
                                key={cat}
                                className={`gallery-tab ${activeCat === cat ? 'active' : ''}`}
                                onClick={() => setActiveCat(cat)}
                            >
                                <FaTh /> {cat}
                            </button>
                        ))}
                    </div>

                    <div className="gallery-section-header">
                        {activeCat === 'Starred' ? (
                            <span className="gallery-section-badge gallery-section-badge--star"><FaStar /> All Highlights</span>
                        ) : (
                            <span className="gallery-section-badge"><FaTh /> {activeCat}</span>
                        )}
                        <span className="gallery-section-count">{displayedPhotos.length} photo{displayedPhotos.length !== 1 ? 's' : ''}</span>
                    </div>

                    {/* CSS MASONRY GRID */}
                    <div className="masonry-grid">
                        {displayedPhotos.map((p, i) => (
                            <div className="gallery__item" key={`${activeCat}-${i}`} onClick={() => setLightbox(p)}>
                                {/* Using native intrisic img tags inside the Masonry Columns for zero cropping */}
                                <img
                                    src={p.src}
                                    alt={p.title}
                                    className="gallery__item-img"
                                    loading="lazy"
                                />
                                {p.pinned && <div className="gallery__pin-badge"><FaStar /></div>}
                                <div className="gallery__overlay">
                                    <span className="gallery__cat">{p.cat}</span>
                                    <p className="gallery__title">{p.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* ===== ULTRA PREMIUM LIGHTBOX ===== */}
            {lightbox && (
                <div className="lightbox" onClick={() => setLightbox(null)}>
                    <div className="lightbox__inner" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox__close" onClick={() => setLightbox(null)}>✕</button>
                        <div className="lightbox__img-wrapper">
                            <img src={lightbox.src} alt={lightbox.title} className="lightbox__img" />
                        </div>
                        <div className="lightbox__caption">
                            <span className="gallery__cat">{lightbox.cat}</span>
                            <p className="lightbox__title">{lightbox.title}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
