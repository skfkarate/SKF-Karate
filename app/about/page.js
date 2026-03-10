import Link from 'next/link'
import { FaShieldAlt, FaBolt, FaArrowRight, FaMedal, FaUsers, FaGraduationCap, FaGlobe, FaBuilding } from 'react-icons/fa'
import { GiBlackBelt, GiMeditation, GiPunch } from 'react-icons/gi'
import './about.css'

export const metadata = {
    title: 'About SKF Karate — Our Legacy, Values & Leadership',
    description: 'Discover the legacy of SKF Karate — Sports Karate-do Fitness & Self Defence Association®. Our mission, leadership team, three pillars of training (Discipline, Strength, Respect), and affiliations with WKF and national federations.',
    openGraph: { title: 'About SKF Karate — Our Legacy & Values', description: 'Discover the philosophy, leadership, and values behind SKF Karate.' },
    alternates: { canonical: 'https://skfkarate.org/about' },
}

const leadership = [
    { name: 'Shihan Takeshi', role: 'President & Founder', dan: '7th Dan', desc: 'Visionary behind SKF Karate with 30+ years of international Karate-Do experience.' },
    { name: 'Sensei Akira', role: 'Chief Instructor', dan: '5th Dan', desc: 'Leads all technical programs, competition coaching, and Sensei development.' },
    { name: 'Mr. Vijay Kumar', role: 'General Secretary', dan: '', desc: 'Manages operations, event coordination, and federation communications.' },
    { name: 'Ms. Lakshmi Rao', role: 'Treasurer', dan: '', desc: 'Handles financial governance, sponsorships, and membership administration.' },
]

export default function AboutPage() {
    return (
        <div className="about-page">
            <section className="page-hero">
                <div className="page-hero__bg">
                    <div className="glow glow-red page-hero__glow-1"></div>
                    <div className="glow glow-blue page-hero__glow-2"></div>
                </div>
                <div className="container page-hero__content">
                    <span className="section-label">Our Legacy</span>
                    <h1 className="page-hero__title">About <span className="text-gradient">SKF Karate</span></h1>
                    <p className="page-hero__subtitle">Sports Karate-do Fitness & Self Defence Association®</p>
                </div>
            </section>

            {/* Philosophy */}
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

            {/* Association Stats */}
            <section className="section assoc-stats">
                <div className="container">
                    <div className="assoc-stats__grid">
                        <div className="glass-card assoc-stat">
                            <span className="assoc-stat__number">500+</span>
                            <span className="assoc-stat__label">Active Karateka</span>
                        </div>
                        <div className="glass-card assoc-stat">
                            <span className="assoc-stat__number">6</span>
                            <span className="assoc-stat__label">Dojos</span>
                        </div>
                        <div className="glass-card assoc-stat">
                            <span className="assoc-stat__number">20+</span>
                            <span className="assoc-stat__label">Certified Senseis</span>
                        </div>
                        <div className="glass-card assoc-stat">
                            <span className="assoc-stat__number">25+</span>
                            <span className="assoc-stat__label">State & National Champions</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="section values">
                <div className="glow glow-gold values__glow"></div>
                <div className="container">
                    <div className="values__header">
                        <span className="section-label"><FaMedal /> Our Values</span>
                        <h2 className="section-title">Three Pillars of <span className="text-gradient">SKF</span></h2>
                    </div>
                    <div className="values__grid">
                        <div className="glass-card value-card">
                            <div className="value-card__icon"><FaShieldAlt /></div>
                            <h3>Discipline</h3>
                            <p>The foundation of all growth. Every stance, every kata, every bow teaches unwavering self-control and mental focus.</p>
                        </div>
                        <div className="glass-card value-card value-card--accent">
                            <div className="value-card__icon"><FaBolt /></div>
                            <h3>Strength</h3>
                            <p>Physical and mental fortitude built through rigorous training, pushing boundaries, and embracing challenges head-on.</p>
                        </div>
                        <div className="glass-card value-card">
                            <div className="value-card__icon"><FaUsers /></div>
                            <h3>Respect</h3>
                            <p>The core of martial arts. Respect for your Sensei, your opponents, and most importantly, yourself and your journey.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Leadership */}
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

            {/* Affiliations */}
            <section className="section affiliations">
                <div className="container">
                    <div className="affiliations__header">
                        <span className="section-label"><FaGlobe /> Affiliations</span>
                        <h2 className="section-title">Our <span className="text-gradient">Affiliations</span></h2>
                    </div>
                    <div className="affiliations__grid">
                        <div className="glass-card affiliation-card">
                            <FaGlobe className="affiliation-card__icon" />
                            <h4>World Karate Federation</h4>
                            <p>Aligned with WKF rules and competition standards</p>
                        </div>
                        <div className="glass-card affiliation-card">
                            <FaBuilding className="affiliation-card__icon" />
                            <h4>National Karate Federation</h4>
                            <p>Registered member of the National Federation</p>
                        </div>
                        <div className="glass-card affiliation-card">
                            <FaMedal className="affiliation-card__icon" />
                            <h4>State Karate Association</h4>
                            <p>Active participant in state championships and programs</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="section timeline-section">
                <div className="container">
                    <div className="timeline__header">
                        <span className="section-label"><FaGraduationCap /> Our Journey</span>
                        <h2 className="section-title">The SKF <span className="text-gradient">Legacy</span></h2>
                    </div>
                    <div className="timeline">
                        <div className="timeline__item">
                            <div className="timeline__marker"></div>
                            <div className="glass-card timeline__card">
                                <span className="timeline__year">Foundation</span>
                                <h3>SKF Karate Established</h3>
                                <p>Founded with a vision to bring professional, standardized Sports Karate-Do training to aspiring martial artists.</p>
                            </div>
                        </div>
                        <div className="timeline__item">
                            <div className="timeline__marker"></div>
                            <div className="glass-card timeline__card">
                                <span className="timeline__year">Growth</span>
                                <h3>Expanding the Family</h3>
                                <p>Grew to 500+ active karateka with championship-winning programs and dedicated Senseis across 6 dojos.</p>
                            </div>
                        </div>
                        <div className="timeline__item">
                            <div className="timeline__marker"></div>
                            <div className="glass-card timeline__card">
                                <span className="timeline__year">2026</span>
                                <h3>Summer Camp Launch</h3>
                                <p>Launching the most ambitious Summer Camp yet — intensive training, belt progression, and life skills development.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section about-cta">
                <div className="container about-cta__inner">
                    <h2 className="section-title">Ready to Begin?</h2>
                    <p className="section-subtitle" style={{ margin: '0 auto 2rem auto', textAlign: 'center' }}>
                        Whether you are a beginner stepping onto the mat for the first time or an experienced karateka — SKF Karate welcomes you. Oss!
                    </p>
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link href="/summer-camp" className="btn btn-primary">Summer Camp 2026 <FaArrowRight /></Link>
                        <Link href="/contact" className="btn btn-secondary">Contact Us</Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
