import Link from 'next/link'
import Image from 'next/image'
import {
    FaMapMarkerAlt,
    FaArrowRight,
    FaUsers,
    FaFistRaised,
    FaWhatsapp,
    FaClock,
    FaStar,
    FaSchool,
} from 'react-icons/fa'
import { getAllCities } from '@/lib/classesData'
import './obsidian.css' // Import the unified Obsidian styling instead of classes.css

export const metadata = {
    title: 'Karate Classes Across Karnataka | SKF',
    description: 'Find SKF Karate classes in Bangalore, Kunigal, Tumkur, and Udupi.',
}

export default function ClassesPage() {
    const cities = getAllCities()

    // Aggregate stats
    const totalBranches = cities.reduce((sum, c) => sum + c.branches.length, 0)
    const totalSchools = cities.reduce((sum, c) => sum + c.schools.length, 0)
    const totalCities = cities.length

    return (
        <div className="obs-page">
            {/* Ambient Watermark & Orbs */}
            <div className="obs-orb obs-orb--1" />
            <div className="obs-orb obs-orb--2" />
            <div className="obs-orb obs-orb--3" />
            <div className="obs-watermark">道場</div>

            {/* HERO */}
            <section className="obs-hero">
                <div className="obs-hero__badge">
                    <div className="obs-hero__badge-dot" /> SKF TRAINING NETWORK
                </div>
                <h1 className="obs-hero__title">
                    <span className="obs-hero__line1">FIND YOUR</span>
                    <span className="obs-hero__line2">DOJO</span>
                </h1>
                <p className="obs-hero__sub">
                    World-class WKF karate training across Karnataka. Group classes, personal training, and elite school programs.
                </p>

                {/* Hero Stats */}
                <div className="obs-hstats">
                    <div className="obs-hstat">
                        <span className="obs-hstat__val">{totalCities}</span>
                        <span className="obs-hstat__lbl">Cities</span>
                    </div>
                    <div className="obs-hstat">
                        <span className="obs-hstat__val">{totalBranches}</span>
                        <span className="obs-hstat__lbl">Branches</span>
                    </div>
                    <div className="obs-hstat">
                        <span className="obs-hstat__val">{totalSchools}</span>
                        <span className="obs-hstat__lbl">Schools</span>
                    </div>
                </div>
            </section>

            {/* CITY GRID (Bento Cards) */}
            <section className="obs-section">
                <div className="obs-sec-head">
                    <div className="obs-sec-head__bar" />
                    <h2>LOCATIONS</h2>
                </div>
                
                <div className="obs-grid">
                    {cities.map((city, i) => {
                        const branchCount = city.branches.length
                        const schoolCount = city.schools.length
                        const hasHQ = city.branches.some(b => b.isHQ)

                        const href = branchCount === 1 && schoolCount === 0
                            ? `/classes/${city.slug}/${city.branches[0].slug}`
                            : `/classes/${city.slug}`

                        return (
                            <Link key={city.slug} href={href} className="obs-card">
                                <div className="obs-card__img-wrap">
                                    <Image 
                                        src={city.photo} 
                                        alt={city.name} 
                                        fill 
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="obs-card__img" 
                                    />
                                    <div className="obs-card__img-overlay" />
                                    
                                    <div className="obs-card__badges">
                                        {hasHQ && <span className="obs-badge obs-badge--hq"><FaStar size={10}/> HQ</span>}
                                        <span className="obs-badge"><FaMapMarkerAlt size={10}/> {branchCount} {branchCount === 1 ? 'Branch' : 'Branches'}</span>
                                        {schoolCount > 0 && <span className="obs-badge"><FaSchool size={10}/> {schoolCount} Schools</span>}
                                    </div>
                                </div>
                                <div className="obs-card__content">
                                    <span className="obs-card__state">{city.state}</span>
                                    <h3 className="obs-card__name">{city.name}</h3>
                                    <div className="obs-card__meta">
                                        <FaClock size={12}/> {city.branches[0]?.classTime || "View Schedule"}
                                    </div>
                                    
                                    <div className="obs-card__explore">
                                        EXPLORE DOJO <FaArrowRight size={12}/>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="obs-section obs-cta-wrapper">
                <div className="obs-cta-grid">
                    <div className="obs-cta-card">
                        <div className="obs-cta-card__icon"><FaUsers size={24}/></div>
                        <h3 className="obs-cta-card__title">Personal Training</h3>
                        <p className="obs-cta-card__text">One-on-one coaching with certified black belt instructors. Tailored to your goals — technique, competition prep, fitness, or self-defence.</p>
                        <Link href="/contact?subject=Personal%20Training" className="obs-cta-btn">
                            Enquire Now <FaArrowRight size={12}/>
                        </Link>
                    </div>

                    <div className="obs-cta-card obs-cta-card--prime">
                        <div className="obs-cta-card__glow" />
                        <div className="obs-cta-card__icon obs-cta-card__icon--prime"><FaFistRaised size={24}/></div>
                        <h3 className="obs-cta-card__title">Free Trial Class</h3>
                        <p className="obs-cta-card__text">Never tried karate? Start with a free trial at any of our branches. No experience needed — all ages welcome.</p>
                        <div className="obs-cta-card__actions">
                            <Link href="/contact?subject=Free%20Trial%20Class" className="obs-cta-btn obs-cta-btn--prime">
                                Book Free Trial <FaArrowRight size={12}/>
                            </Link>
                            <a href="https://wa.me/919019971726?text=Hi,%20I'm%20interested%20in%20a%20free%20trial%20karate%20class" target="_blank" rel="noopener noreferrer" className="obs-cta-wa">
                                <FaWhatsapp size={16}/> WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
