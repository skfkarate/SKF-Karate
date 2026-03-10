import Link from 'next/link'
import { FaCalendarAlt, FaMapMarkerAlt, FaTrophy, FaArrowRight, FaUsers } from 'react-icons/fa'
import { GiBlackBelt } from 'react-icons/gi'
import './events.css'

export const metadata = {
    title: 'Events & Calendar — Competitions, Gradings & Camps',
    description: 'Upcoming karate competitions, belt grading examinations, training camps, and seminars by SKF Karate. View event dates, locations, and past results.',
    openGraph: { title: 'SKF Karate Events & Calendar', description: 'Upcoming competitions, belt gradings, and training camps.' },
    alternates: { canonical: 'https://skfkarate.org/events' },
}

const upcomingEvents = [
    { date: 'Jul 15, 2026', title: 'Summer Camp 2026', location: 'SKF Headquarters', type: 'Camp', desc: 'Intensive month-long training camp for all levels — White to Black belt.', cta: '/summer-camp' },
    { date: 'Aug 10, 2026', title: 'Kyu Grading Examination', location: 'Central Dojo', type: 'Grading', desc: 'Belt examination for all Kyu grades — White through Brown. Register before Aug 1.' },
    { date: 'Sep 20-21, 2026', title: 'SKF Inter-Dojo Championship', location: 'City Sports Complex', type: 'Tournament', desc: 'Annual championship — Kata and Kumite categories for Junior, Cadet, and Senior divisions.' },
    { date: 'Oct 5, 2026', title: 'Kata Masterclass Seminar', location: 'SKF Headquarters', type: 'Seminar', desc: 'Special seminar by visiting Shihan — advanced kata techniques and bunkai analysis.' },
    { date: 'Dec 14, 2026', title: 'Dan Grading Examination', location: 'Central Dojo', type: 'Grading', desc: 'Black belt examination for Shodan, Nidan, and Sandan candidates.' },
]

const pastEvents = [
    { date: 'Mar 2, 2026', title: 'State Championship 2026', result: 'SKF secured 12 Gold, 8 Silver, 5 Bronze medals' },
    { date: 'Jan 15, 2026', title: 'Kyu Grading — Winter 2026', result: '45 karateka successfully graded to the next level' },
    { date: 'Nov 20, 2025', title: 'Annual SKF Tournament 2025', result: 'Record 200+ participants across all age groups' },
]

const typeBadge = { Camp: 'badge--camp', Grading: 'badge--grading', Tournament: 'badge--tournament', Seminar: 'badge--seminar' }

export default function EventsPage() {
    return (
        <div className="events-page">
            <section className="page-hero">
                <div className="page-hero__bg">
                    <div className="glow glow-red page-hero__glow-1"></div>
                    <div className="glow glow-gold page-hero__glow-2"></div>
                </div>
                <div className="container page-hero__content">
                    <span className="section-label"><FaCalendarAlt /> Events & Calendar</span>
                    <h1 className="page-hero__title">Upcoming <span className="text-gradient">Events</span></h1>
                    <p className="page-hero__subtitle">Competitions, Gradings, Camps & Seminars</p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="events__list">
                        {upcomingEvents.map((e, i) => (
                            <div className="glass-card event-card" key={i}>
                                <div className="event-card__date">
                                    <FaCalendarAlt />
                                    <span>{e.date}</span>
                                </div>
                                <div className="event-card__body">
                                    <div className="event-card__top">
                                        <span className={`event-badge ${typeBadge[e.type]}`}>{e.type}</span>
                                        <h3>{e.title}</h3>
                                    </div>
                                    <p>{e.desc}</p>
                                    <div className="event-card__meta">
                                        <span><FaMapMarkerAlt /> {e.location}</span>
                                        {e.cta && <Link href={e.cta} className="btn btn-primary btn-sm">Learn More <FaArrowRight /></Link>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section past-events">
                <div className="container">
                    <div className="past__header">
                        <span className="section-label"><FaTrophy /> Past Results</span>
                        <h2 className="section-title">Recent <span className="text-gradient">Results</span></h2>
                    </div>
                    <div className="past__grid">
                        {pastEvents.map((e, i) => (
                            <div className="glass-card past-card" key={i}>
                                <span className="past-card__date">{e.date}</span>
                                <h3>{e.title}</h3>
                                <p>{e.result}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
