'use client'

import { useState } from 'react'
import { FaCamera, FaTimes } from 'react-icons/fa'
import './gallery.css'

const categories = ['All', 'Competitions', 'Gradings', 'Camps', 'Events']

const photos = [
    { cat: 'Competitions', title: 'State Championship 2026 — Kata Finals', color: '#d62828' },
    { cat: 'Competitions', title: 'Inter-Dojo Tournament — Kumite Action', color: '#c62828' },
    { cat: 'Gradings', title: 'Belt Grading Ceremony — New Black Belts', color: '#ffb703' },
    { cat: 'Gradings', title: 'Kyu Examination — Orange Belt Class', color: '#ffa000' },
    { cat: 'Camps', title: 'Summer Camp 2025 — Morning Kata Session', color: '#14213d' },
    { cat: 'Camps', title: 'Summer Camp 2025 — Sparring Drills', color: '#1b2d4f' },
    { cat: 'Events', title: 'Annual Awards Night 2025', color: '#4a148c' },
    { cat: 'Events', title: 'Dojo Grand Opening — West District', color: '#1a237e' },
    { cat: 'Competitions', title: 'National Team Selection Trials', color: '#bf360c' },
    { cat: 'Gradings', title: 'Dan Grading — Nidan Candidates', color: '#e65100' },
    { cat: 'Camps', title: 'Intensive Camp — Fitness Conditioning', color: '#0d47a1' },
    { cat: 'Events', title: 'Community Karate Demonstration', color: '#311b92' },
]

export default function GalleryPage() {
    const [filter, setFilter] = useState('All')
    const filtered = filter === 'All' ? photos : photos.filter((p) => p.cat === filter)

    return (
        <div className="gallery-page">
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

            <section className="section">
                <div className="container">
                    <div className="gallery__filters">
                        {categories.map((c) => (
                            <button
                                key={c}
                                className={`gallery__filter ${filter === c ? 'gallery__filter--active' : ''}`}
                                onClick={() => setFilter(c)}
                            >
                                {c}
                            </button>
                        ))}
                    </div>

                    <div className="gallery__grid">
                        {filtered.map((p, i) => (
                            <div className="gallery__item" key={i} style={{ background: p.color }}>
                                <div className="gallery__overlay">
                                    <span className="gallery__cat">{p.cat}</span>
                                    <p className="gallery__title">{p.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <p className="gallery__note">
                        Replace these placeholders with your real event photos. Each card represents where an image will appear.
                    </p>
                </div>
            </section>
        </div>
    )
}
