import Link from 'next/link'
import { FaCalendarAlt, FaMapMarkerAlt, FaTrophy, FaArrowRight, FaUsers } from 'react-icons/fa'
import { GiBlackBelt } from 'react-icons/gi'
import { getAllTournaments } from '../../lib/data/tournaments'
import './events.css'
const academyEvents = [
    { date: 'April 01, 2026', title: 'Summer Camp 2026', location: 'M P Sports Club,', type: 'Camp', desc: 'Intensive 2 months long training camp for all levels - Beginner to Advanced', cta: '/summer-camp' },
    { date: 'In May', title: 'Kyu Grading Examination', location: 'M P Sports Club', type: 'Grading', desc: 'Belt examination for all Kyu grades — White to Yellow.' },
    { date: 'In May', title: 'Tournament', location: 'Herohalli', type: 'Tournament', desc: 'Tournament for all Kyu grades — White to Yellow.' },
    { date: 'In June', title: 'Bring your Buddy', location: 'M P Sports Club', type: 'Fun Day', desc: 'Bring your friend to the dojo and show them what you love!' },
    { date: 'Oct 5, 2026', title: 'Kata Masterclass Seminar', location: 'SKF Headquarters', type: 'Seminar', desc: 'Special seminar by visiting Shihan — advanced kata techniques and bunkai analysis.' },
    { date: 'Dec 14, 2026', title: 'Dan Grading Examination', location: 'Central Dojo', type: 'Grading', desc: 'Black belt examination for Shodan, Nidan, and Sandan candidates.' },
]

const typeBadge = { Camp: 'badge--camp', Grading: 'badge--grading', Tournament: 'badge--tournament', Seminar: 'badge--seminar' }

export default function EventsPage() {
    const tournaments = getAllTournaments()
    const today = new Date()
    const upcomingTournamentCards = tournaments
        .filter((event) => new Date(event.date) >= today)
        .slice(0, 3)
        .map((event) => ({
            date: new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
            title: event.name,
            location: `${event.venue}, ${event.city}`,
            type: 'Tournament',
            desc: event.description,
            cta: `/results/${event.slug}`,
        }))

    const pastEvents = tournaments
        .filter((event) => new Date(event.date) < today)
        .slice(0, 3)
        .map((event) => ({
            date: new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            title: event.name,
            result: `SKF medals: ${event.medals.gold} Gold, ${event.medals.silver} Silver, ${event.medals.bronze} Bronze`,
        }))

    const upcomingEvents = [...academyEvents, ...upcomingTournamentCards]

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
