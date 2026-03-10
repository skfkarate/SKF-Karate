import Link from 'next/link'
import { FaArrowRight } from 'react-icons/fa'
import { GiBlackBelt } from 'react-icons/gi'
import './grading.css'

export const metadata = {
    title: 'Kyu & Dan Grading — Belt System from White to Black Belt',
    description: 'Complete karate belt grading system at SKF Karate — 10th Kyu (White Belt) to Shodan (Black Belt) and beyond. Grading requirements for each belt level, kata syllabus, Dan grade pathways, and examination schedules.',
    openGraph: { title: 'Karate Belt Grading — Kyu & Dan System', description: 'Complete belt progression from White to Black Belt and Dan grades.' },
    alternates: { canonical: 'https://skfkarate.org/grading' },
}

const belts = [
    { color: '#ffffff', name: 'White Belt', kyu: '10th Kyu', req: 'Beginning — no prior experience required', textDark: true },
    { color: '#ffeb3b', name: 'Yellow Belt', kyu: '9th Kyu', req: 'Basic stances, blocks, and Taikyoku Shodan', textDark: true },
    { color: '#ff9800', name: 'Orange Belt', kyu: '8th Kyu', req: 'Heian Shodan, basic kumite combinations', textDark: true },
    { color: '#4caf50', name: 'Green Belt', kyu: '7th Kyu', req: 'Heian Nidan, controlled ippon kumite' },
    { color: '#2196f3', name: 'Blue Belt', kyu: '6th Kyu', req: 'Heian Sandan, jiyu ippon kumite introduction' },
    { color: '#7b1fa2', name: 'Purple Belt', kyu: '5th Kyu', req: 'Heian Yondan, advanced blocking and counter-attack' },
    { color: '#795548', name: 'Brown Belt (3rd)', kyu: '4th Kyu', req: 'Heian Godan, advanced kumite and conditioning' },
    { color: '#5d4037', name: 'Brown Belt (2nd)', kyu: '3rd Kyu', req: 'Tokui kata selection, competition kumite readiness' },
    { color: '#3e2723', name: 'Brown Belt (1st)', kyu: '2nd Kyu', req: 'Advanced kata, tournament-level jiyu kumite, mentoring junior students' },
    { color: '#1a1a1a', name: 'Black Belt', kyu: '1st Kyu → Shodan', req: 'Mastery of all Heian + Tokui kata, jiyu kumite excellence, minimum 2 years at Brown' },
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

            <section className="section">
                <div className="container">
                    <div className="grading__intro">
                        <h2 className="section-title">The Journey of a <span className="text-gradient">Karateka</span></h2>
                        <p className="section-subtitle">Every black belt was once a white belt who never quit. The Kyu (color belt) system builds your foundation. The Dan (black belt) system deepens your mastery.</p>
                    </div>

                    <div className="belt-chart">
                        {belts.map((b, i) => (
                            <div className="belt-row" key={i}>
                                <div className="belt-row__color" style={{ background: b.color }}>
                                    <span style={b.textDark ? { color: '#111' } : {}}>{b.kyu}</span>
                                </div>
                                <div className="belt-row__info">
                                    <h3>{b.name}</h3>
                                    <p>{b.req}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section dan-section">
                <div className="glow glow-gold dan__glow"></div>
                <div className="container">
                    <div className="dan__header">
                        <span className="section-label"><GiBlackBelt /> Dan Grades</span>
                        <h2 className="section-title">Beyond <span className="text-gradient">Black Belt</span></h2>
                        <p className="section-subtitle" style={{ margin: '0 auto' }}>The Dan system represents a lifelong journey of deepening knowledge, refining technique, and giving back to the art.</p>
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
