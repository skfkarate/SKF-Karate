'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FaCamera, FaStar, FaTh } from 'react-icons/fa'
import './gallery.css'

/*
  ── GALLERY DATA ──
  Added new images: belt.jpg, beltexam.jpg, beltt.jpg, tounrmentss.jpg, tournmentss.jpg
*/

const allPhotos = [
    // ═══ Demonstrations ═══
    { src: '/gallery/Karate Demonstration.jpeg', title: 'Synchronized Kicks — Outdoor Demo', cat: 'Demonstrations', pinned: false },
    { src: '/gallery/Karate Demonstration2 starred.jpeg', title: 'Team Pose with Weapons — Demo Day', cat: 'Demonstrations', pinned: true },

    // ═══ Tournaments ═══
    { src: '/gallery/Tournment.jpeg', title: 'All-India Kata Championship — Medal Winners', cat: 'Tournaments', pinned: false },
    { src: '/gallery/Tournment2.jpeg', title: 'Kumite Squad with Judges & Officials', cat: 'Tournaments', pinned: false },
    { src: '/gallery/Tournment3.jpeg', title: 'Team Group Photo at the Arena', cat: 'Tournaments', pinned: false },
    { src: '/gallery/Tournment4.jpeg', title: 'Cheering Before the Final Round', cat: 'Tournaments', pinned: false },
    { src: '/gallery/Tournment5.jpeg', title: 'Young Karatekas Ready for Action', cat: 'Tournaments', pinned: false },
    { src: '/gallery/Tournment6.jpeg', title: 'Post-Match Celebrations', cat: 'Tournaments', pinned: false },
    { src: '/gallery/Tournment7.jpeg', title: 'Team Huddle at the Championship', cat: 'Tournaments', pinned: false },
    { src: '/gallery/Tournment8 starred.jpeg', title: 'A Proud Champion Flashes Her Gold Medal', cat: 'Tournaments', pinned: true },
    { src: '/gallery/Tournment9.jpeg', title: 'Tournament Day — Full Team Line-Up', cat: 'Tournaments', pinned: false },
    { src: '/gallery/Tournment10.jpeg', title: 'State-Level Championship Competitors', cat: 'Tournaments', pinned: false },
    { src: '/gallery/Tournment 11.jpeg', title: 'Victory Thumbs-Up after Tournament', cat: 'Tournaments', pinned: false },
    { src: '/gallery/Tournment 12.jpeg', title: 'Senseis and Champions on the Mat', cat: 'Tournaments', pinned: false },
    { src: '/gallery/Tournment 13.jpeg', title: 'Award Ceremony — Certificate Presentation', cat: 'Tournaments', pinned: false },
    { src: '/gallery/tounrmentss.jpg', title: 'Karateka Competing in a Tournament', cat: 'Tournaments', pinned: false },
    { src: '/gallery/tournmentss.jpg', title: 'Competition Match at a Karate Tournament', cat: 'Tournaments', pinned: false },

    // ═══ Belt Exams / Gradings ═══
    { src: '/gallery/Kungal belt examination.jpeg', title: 'Kungal Kyu Grading — Certificates with Sensei', cat: 'Belt Exams', pinned: false },
    { src: '/gallery/belt exam.jpeg', title: 'National Championship Certificate Ceremony', cat: 'Belt Exams', pinned: false },
    { src: '/gallery/belt.jpg', title: 'Belt Grading Ceremony', cat: 'Belt Exams', pinned: false },
    { src: '/gallery/beltexam.jpg', title: 'Students Participating in Belt Promotion Exam', cat: 'Belt Exams', pinned: false },
    { src: '/gallery/beltt.jpg', title: 'Martial Arts Belt Exam Session', cat: 'Belt Exams', pinned: false },

    // ═══ In Dojo ═══
    { src: '/gallery/In dojo 2 starred.jpeg', title: 'Sensei with Little Karatekas — Smiles at the Dojo', cat: 'In Dojo', pinned: true },
    { src: '/gallery/In Dojo.jpeg', title: 'Senseis Leading Morning Formation', cat: 'In Dojo', pinned: false },
    { src: '/gallery/In Dojo 3.jpeg', title: 'Young Warriors Standing in Seiza', cat: 'In Dojo', pinned: false },
    { src: '/gallery/In dogo.jpeg', title: 'All Belts United — Dojo Group Photo', cat: 'In Dojo', pinned: false },
    { src: '/gallery/IMG_1191.JPG.jpeg', title: 'Dojo Family — A Legacy of Discipline', cat: 'In Dojo', pinned: false },

    // ═══ Training Camps ═══
    { src: '/gallery/Train the Elite - Training Camp starred.jpeg', title: 'Train the Elite Camp — Certificate Ceremony', cat: 'Camps', pinned: true },
    { src: '/gallery/Training.jpeg', title: 'Training Unit — Team on the Tatami', cat: 'Camps', pinned: false },

    // ═══ Championships ═══
    { src: '/gallery/Kungial district level championship.jpeg', title: 'Kungial District-Level Championship — Medalists', cat: 'Championships', pinned: false },

    // ═══ Seminars ═══
    { src: '/gallery/International seminar by john wick.jpeg', title: 'International Seminar — Sensei Jon Wicks', cat: 'Seminars', pinned: false },
]

export default function GalleryPage() {
    const [lightbox, setLightbox] = useState(null)
    const [activeCat, setActiveCat] = useState('Starred')

    const pinnedPhotos = allPhotos.filter(p => p.pinned)
    const categoryOrder = ['Demonstrations', 'Tournaments', 'Belt Exams', 'In Dojo', 'Camps', 'Championships', 'Seminars']

    // Filter out categories with no photos
    const availableCategories = categoryOrder.filter(cat => allPhotos.some(p => p.cat === cat))

    const displayedPhotos = activeCat === 'Starred' ? pinnedPhotos : allPhotos.filter(p => p.cat === activeCat)

    return (
        <div className="gallery-page">
            {/* HERO */}
            <section className="page-hero">
                <div className="page-hero__bg">
                    <div className="glow glow-red page-hero__glow-1"></div>
                    <div className="glow glow-gold page-hero__glow-2"></div>
                </div>
                <div className="container page-hero__content">
                    <span className="section-label"><FaCamera /> Gallery</span>
                    <h1 className="page-hero__title">SKF <span className="text-gradient">Gallery</span></h1>
                    <p className="page-hero__subtitle">Moments from the Dojo and Beyond</p>
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
                            <FaStar /> Starred
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

                    {/* HEADER FOR ACTIVE TAB */}
                    <div className="gallery-section-header">
                        {activeCat === 'Starred' ? (
                            <span className="gallery-section-badge gallery-section-badge--star"><FaStar /> Starred</span>
                        ) : (
                            <span className="gallery-section-badge"><FaTh /> {activeCat}</span>
                        )}
                        <span className="gallery-section-count">{displayedPhotos.length} photo{displayedPhotos.length !== 1 ? 's' : ''}</span>
                    </div>

                    {/* GRID */}
                    <div className={activeCat === 'Starred' ? 'pinned-grid' : 'category-grid'}>
                        {displayedPhotos.map((p, i) => (
                            <div className={`gallery__item ${activeCat === 'Starred' ? 'gallery__item--pinned' : ''}`} key={`${activeCat}-${i}`} onClick={() => setLightbox(p)}>
                                <Image
                                    src={p.src}
                                    alt={p.title}
                                    fill
                                    sizes={activeCat === 'Starred' ? "(max-width: 600px) 100vw, (max-width: 992px) 50vw, 33vw" : "(max-width: 600px) 50vw, (max-width: 992px) 33vw, 25vw"}
                                    style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
                                />
                                {p.pinned && <div className={`gallery__pin-badge ${activeCat !== 'Starred' ? 'gallery__pin-badge--small' : ''}`}><FaStar /></div>}
                                <div className="gallery__overlay">
                                    {activeCat === 'Starred' && <span className="gallery__cat">{p.cat}</span>}
                                    <p className="gallery__title">{p.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </section>

            {/* ===== LIGHTBOX ===== */}
            {lightbox && (
                <div className="lightbox" onClick={() => setLightbox(null)}>
                    <div className="lightbox__inner" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox__close" onClick={() => setLightbox(null)}>✕</button>
                        <div className="lightbox__img-wrapper">
                            <Image src={lightbox.src} alt={lightbox.title} fill sizes="90vw" style={{ objectFit: 'contain' }} />
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
