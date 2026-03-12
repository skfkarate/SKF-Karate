import Link from 'next/link'
import { FaArrowRight, FaAward } from 'react-icons/fa'
import { GiBlackBelt } from 'react-icons/gi'
import './grading.css'



const kyuBelts = [
    { kyu: '9th Kyu', belt: 'Yellow Belt', color: '#FFD166' },
    { kyu: '8th Kyu', belt: 'Orange Belt', color: '#F77F00' },
    { kyu: '7th Kyu', belt: 'Green II Belt', color: '#52B788' },
    { kyu: '6th Kyu', belt: 'Green I Belt', color: '#2D6A4F' },
    { kyu: '5th Kyu', belt: 'Blue Belt', color: '#118AB2' },
    { kyu: '4th Kyu', belt: 'Purple Belt', color: '#9D4EDD' },
    { kyu: '3rd Kyu', belt: 'Brown III Belt', color: '#D4A373' },
    { kyu: '2nd Kyu', belt: 'Brown II Belt', color: '#A98467' },
    { kyu: '1st Kyu', belt: 'Brown I Belt', color: '#6B3E2E' },
]

const danGrades = [
    { dan: 'Shodan (1st Dan)', years: '3+ years training', focus: 'Mastery of fundamentals, teaching basics' },
    { dan: 'Nidan (2nd Dan)', years: '5+ years', focus: 'Technical refinement, dojo leadership' },
    { dan: 'Sandan (3rd Dan)', years: '8+ years', focus: 'Advanced bunkai, competition coaching' },
    { dan: 'Yondan (4th Dan)', years: '12+ years', focus: 'Sensei level — independent dojo operation' },
    { dan: 'Godan (5th Dan)', years: '17+ years', focus: 'Shihan eligibility — master instructor' },
]

export default function GradingPage() {
    return (
        <div className="grading-page">
            {/* ===== HERO ===== */}
            <section className="page-hero">
                <div className="page-hero__bg">
                    <div className="glow glow-gold page-hero__glow-1"></div>
                    <div className="glow glow-red page-hero__glow-2"></div>
                </div>
                <div className="container page-hero__content">
                    <span className="section-label"><GiBlackBelt /> Belt System</span>
                    <h1 className="page-hero__title">Kyu & Dan <span className="text-gradient">Grading</span></h1>
                    <p className="page-hero__subtitle">The Path from White Belt to Black Belt and Beyond</p>
                </div>
            </section>

            {/* ===== KYU SYSTEM ===== */}
            <section className="section kyu-section">
                <div className="glow glow-blue kyu-section__glow"></div>
                <div className="container">
                    <div className="kyu-header">
                        <h2 className="section-title">The Journey of a <span className="text-gradient">Karateka</span></h2>
                        <p className="section-subtitle">
                            Every black belt was once a white belt who never quit. The Kyu (color belt) system builds your foundation. The Dan (black belt) system deepens your mastery.
                        </p>
                    </div>

                    <div className="kyu-timeline">
                        {kyuBelts.map((rank, index) => (
                            <div
                                key={rank.kyu}
                                className="kyu-card"
                                style={{ '--belt-color': rank.color, '--delay': `${index * 0.06}s` }}
                            >
                                <div className="kyu-card__accent"></div>
                                <div className="kyu-card__icon">
                                    <GiBlackBelt />
                                </div>
                                <div className="kyu-card__info">
                                    <h3 className="kyu-card__level">{rank.kyu}</h3>
                                    <span className="kyu-card__belt">{rank.belt}</span>
                                </div>
                                <div className="kyu-card__number">
                                    {9 - index}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== DAN GRADES ===== */}
            <section className="section dan-section">
                <div className="glow glow-gold dan__glow"></div>
                <div className="container">
                    <div className="kyu-header">
                        <span className="section-label"><GiBlackBelt /> Dan Grades</span>
                        <h2 className="section-title">Beyond <span className="text-gradient">Black Belt</span></h2>
                        <p className="section-subtitle">The Dan system represents a lifelong journey of deepening knowledge, refining technique, and giving back to the art.</p>
                    </div>

                    <div className="dan__grid">
                        {danGrades.map((d, i) => (
                            <div className="glass-card dan-card" key={i}>
                                <h3>{d.dan}</h3>
                                <span className="dan-card__years">{d.years}</span>
                                <p>{d.focus}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA ===== */}
            <section className="section grading-cta">
                <div className="container">
                    <div className="glass-card grading-cta__inner">
                        <h2 className="section-title">Ready for Your Next Belt?</h2>
                        <p className="section-subtitle" style={{ margin: '0 auto 2rem auto', textAlign: 'center' }}>
                            Check the events calendar for the next grading date and register with your Sensei.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Link href="/events" className="btn btn-primary">View Grading Dates <FaArrowRight /></Link>
                            <Link href="/contact" className="btn btn-secondary">Contact Us</Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
