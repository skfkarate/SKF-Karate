import Link from 'next/link'
import { FaArrowRight, FaBuilding, FaGlobe, FaInfoCircle } from 'react-icons/fa'
import { GiBlackBelt, GiMeditation, GiPunch } from 'react-icons/gi'
import './about.css'

const leadership = [
    { name: 'Renshi Dr. Channegowda UC', role: 'Founder', dan: '7th Dan', desc: 'Technical Director — The visionary leader and technical backbone of SKF Karate.' },
    { name: 'Sensei Usha C', role: 'President', dan: '4th Dan', desc: 'Senior Instructor — Leading the association with dedication and conducting specialized training programs.' },
    { name: 'Sensei Someshekhar', role: 'Vice President', dan: '4th Dan', desc: 'Branch Head — Managing branch operations and overseeing senior athlete development.' },
    { name: 'Sensei Rakesh', role: 'General Secretary', dan: '4th Dan', desc: 'Branch Head — Coordinating administrative affairs and leading branch training initiatives.' },
    { name: 'Latha', role: 'Treasurer', dan: '', desc: 'Managing financial governance and supporting the association\'s growth.' },
]

export default function AboutPage() {
    return (
        <div className="about-page">
            {/* ═══════ CINEMATIC HERO ═══════ */}
            <section className="abt-hero">
                <div className="abt-hero__bg">
                    <div className="abt-hero__glow abt-hero__glow--1"></div>
                    <div className="abt-hero__glow abt-hero__glow--2"></div>
                </div>
                <div className="container abt-hero__content">
                    <img src="/logo/SKF%20logo.png" alt="SKF Logo" className="abt-hero__logo" />
                    <h1 className="abt-hero__title">About <span className="abt-text-grad">SKF Karate</span></h1>
                    <p className="abt-hero__subtitle">Sports Karate-do Fitness & Self Defence Association®</p>
                </div>
            </section>

            {/* ═══════ PHILOSOPHY ═══════ */}
            <section className="section philosophy">
                <div className="container philosophy__grid">
                    <div className="philosophy__text">
                        <span className="section-label"><GiMeditation /> Our Philosophy</span>
                        <h2 className="section-title">Forging Champions <br />On & Off the Mat</h2>
                        <p className="section-subtitle">
                            SKF Karate stands as an elite institution dedicated to the mastery of
                            Sports Karate-Do, physical fitness, and practical self-defence. Built on a
                            foundation of standardized, professional training protocols, we forge champions
                            both on the mat and in life.
                        </p>
                        <p className="philosophy__text-secondary">
                            Our Senseis bring decades of competition and coaching experience, ensuring
                            every karateka receives world-class guidance tailored to their potential.
                        </p>
                        <Link href="/contact" className="btn btn-primary philosophy__cta">
                            Begin Your Journey <FaArrowRight />
                        </Link>
                    </div>
                    <div className="philosophy__visual">
                        <div className="philosophy__card glass-card">
                            <GiPunch className="philosophy__icon" />
                            <h3>Nothing is Impossible</h3>
                            <p>Our founding motto drives every session, every belt earned, every champion made.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ LEADERSHIP ═══════ */}
            <section className="section leadership">
                <div className="container">
                    <div className="leadership__header">
                        <span className="section-label"><FaBuilding /> Leadership</span>
                        <h2 className="section-title">Executive <span className="text-gradient">Committee</span></h2>
                    </div>
                    <div className="leadership__grid">
                        {leadership.map((l, i) => (
                            <div className="glass-card leader-card" key={i}>
                                <div className="leader-card__avatar"><GiBlackBelt /></div>
                                <h3>{l.name}</h3>
                                <span className="leader-card__role">{l.role}</span>
                                {l.dan && <span className="leader-card__dan">{l.dan}</span>}
                                <p>{l.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════ AFFILIATIONS ═══════ */}
            <section className="section affiliations">
                <div className="container">
                    <div className="affiliations__header">
                        <span className="section-label"><FaGlobe /> Affiliations</span>
                        <h2 className="section-title">Our <span className="text-gradient">Affiliations</span></h2>
                    </div>
                    <div className="affiliations__hierarchy">
                        <div className="glass-card affiliation-card affiliation-card--primary">
                            <img src="/affliciation/akska.png" alt="AKSKA Logo" className="affiliation-card__logo" />
                            <h4>Akhila Karnataka Sports Karate Association</h4>
                        </div>
                        
                        <div className="affiliation-tree__branches">
                            <div className="glass-card affiliation-card">
                                <img src="/affliciation/wkf.png" alt="WKF Logo" className="affiliation-card__logo" />
                                <h4>World Karate Federation</h4>
                            </div>
                            
                            <div className="glass-card affiliation-card">
                                <img src="/affliciation/kio.png" alt="KIO Logo" className="affiliation-card__logo" />
                                <h4>Karate India Organisation</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ CTA ═══════ */}
            <section className="section about-cta">
                <div className="container about-cta__inner">
                    <h2 className="section-title">Ready to Begin?</h2>
                    <p className="section-subtitle about-cta__subtitle">
                        Whether you are a beginner stepping onto the mat for the first time or an experienced karateka — SKF Karate welcomes you. Oss!
                    </p>
                    <div className="about-cta__buttons">
                        <Link href="/contact" className="btn btn-primary">Get in Touch <FaArrowRight /></Link>
                        <Link href="/athlete" className="btn btn-secondary">Find Your Profile</Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
