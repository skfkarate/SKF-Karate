import Link from 'next/link'
import { FaMapMarkerAlt, FaClock, FaPhoneAlt, FaArrowRight, FaChild, FaUserFriends, FaUser, FaStar } from 'react-icons/fa'
import { GiBlackBelt, GiJapan } from 'react-icons/gi'
import './dojos.css'

const hqDojo = { 
    name: 'SKF Headquarters Dojo', 
    sensei: 'Sensei Akira', 
    senseiId: 'akira',
    address: '14/1, 2nd Main Rd, M P M Layout, Mallathahalli, Bengaluru 560056', 
    phone: '+91 90199 71726', 
    timings: 'Mon-Sat: 6:00 AM - 8:00 PM', 
    ages: ['Junior', 'Cadet', 'Senior'],
    desc: 'The beating heart of our association. The SKF Headquarters is where champions are forged under the direct supervision of our Chief Instructor. Equipped with world-class WKF-approved tatami mats, elite conditioning equipment, and an atmosphere of pure discipline.'
};

const districtDojos = [
    { id: 'central', name: 'Central Dojo', sensei: 'Sensei Ravi', senseiId: 'ravi', address: 'Central Avenue, Downtown', phone: '+91 000-000-0002', timings: 'Mon-Sat: 6:30 AM - 7 PM', ages: ['Junior', 'Cadet', 'Senior'], color: 'crimson' },
    { id: 'east', name: 'East District Dojo', sensei: 'Sensei Meera', senseiId: 'meera', address: 'East District, Sector 12', phone: '+91 000-000-0003', timings: 'Mon-Fri: 5:30 AM - 6:30 PM', ages: ['Junior', 'Cadet'], color: 'blue' },
    { id: 'north', name: 'North District Dojo', sensei: 'Sensei Arjun', senseiId: 'arjun', address: 'North District, Block B', phone: '+91 000-000-0004', timings: 'Mon-Sat: 6 AM - 7 PM', ages: ['Cadet', 'Senior'], color: 'gold' },
    { id: 'west', name: 'West District Dojo', sensei: 'Sensei Ravi', senseiId: 'ravi', address: 'West District, MG Road', phone: '+91 000-000-0005', timings: 'Tue-Sun: 6 AM - 6 PM', ages: ['Junior', 'Cadet', 'Senior'], color: 'crimson' },
    { id: 'south', name: 'South District Dojo', sensei: 'Sensei Karthik', senseiId: 'karthik', address: 'South District, Ring Road', phone: '+91 000-000-0006', timings: 'Mon-Sat: 5:30 AM - 7 PM', ages: ['Junior', 'Cadet'], color: 'blue' },
]

const ageIcon = { Junior: <FaChild />, Cadet: <FaUserFriends />, Senior: <FaUser /> }

export const metadata = {
  title: 'Find Karate Classes Near Me | SKF Karate Bangalore Dojos',
  description: 'Locate an SKF Karate dojo near you in Bangalore. View our class schedules, facility details, and book your first martial arts session.',
}

export default function DojosPage() {
    return (
        <div className="dojos-page">
            {/* ═══════ IMMERSIVE HERO ═══════ */}
            <section className="page-hero dojos-hero">
                <div className="page-hero__bg"></div>
                <div className="container page-hero__content">
                    <span className="section-label hero-label-pulse"><FaMapMarkerAlt /> The Training Grounds</span>
                    <h1 className="page-hero__title">
                        Find Your <span className="text-gradient">Dojo</span>
                    </h1>
                    <p className="page-hero__subtitle">
                        Every journey requires a starting line. Discover a sanctuary of discipline and strength near you.
                    </p>
                </div>
            </section>

            {/* ═══════ HEADQUARTERS SPOTLIGHT ═══════ */}
            <section className="section hq-section section--tint-cool">
                <div className="container">
                    <div className="hq-card">
                        <div className="hq-card__visual">
                            <div className="hq-image-placeholder">
                                <GiJapan className="hq-bg-icon" />
                                <div className="hq-badge">
                                    <FaStar className="animated-star" /> Global Headquarters
                                </div>
                            </div>
                        </div>

                        <div className="hq-card__content">
                            <span className="hq-label">The Core Sanctuary</span>
                            <h2 className="hq-name">{hqDojo.name}</h2>
                            <p className="hq-desc">{hqDojo.desc}</p>
                            
                            <div className="hq-details-grid">
                                <div className="hq-detail-item">
                                    <FaMapMarkerAlt className="hq-icon text-gold" />
                                    <div>
                                        <strong>Location</strong>
                                        <span>{hqDojo.address}</span>
                                    </div>
                                </div>
                                <div className="hq-detail-item">
                                    <GiBlackBelt className="hq-icon text-crimson" />
                                    <div>
                                        <strong>Led By</strong>
                                        <Link href={`/senseis/${hqDojo.senseiId}`} className="sensei-link">
                                            {hqDojo.sensei} <FaArrowRight className="link-arrow"/>
                                        </Link>
                                    </div>
                                </div>
                                <div className="hq-detail-item">
                                    <FaClock className="hq-icon text-blue" />
                                    <div>
                                        <strong>Training Hours</strong>
                                        <span>{hqDojo.timings}</span>
                                    </div>
                                </div>
                                <div className="hq-detail-item">
                                    <FaPhoneAlt className="hq-icon text-gold" />
                                    <div>
                                        <strong>Direct Helpline</strong>
                                        <span>{hqDojo.phone}</span>
                                    </div>
                                </div>
                            </div>

                                <div className="hq-actions">
                                    <Link href="/timetable/koramangala" className="btn" style={{ background: 'rgba(255,183,3,0.1)', color: 'var(--gold)', border: '1px solid var(--gold)' }}>
                                        View this month's timetable →
                                    </Link>
                                    <Link href="/contact" className="btn btn-primary hq-btn">
                                        Enquire at Headquarters <FaArrowRight />
                                    </Link>
                                </div>
                                <div className="hq-ages" style={{ marginTop: '1rem' }}>
                                    {hqDojo.ages.map((a) => (
                                        <span className="age-pill" key={a}>{ageIcon[a]} {a}</span>
                                    ))}
                                </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ DISTRICT DOJOS GRID ═══════ */}
            <section className="section district-section section--tint-mid">
                <div className="container">
                    <div className="district-header center" style={{margin: '0 auto 4rem auto', textAlign: 'center', maxWidth: '700px'}}>
                        <span className="section-label"><FaMapMarkerAlt /> City-Wide Reach</span>
                        <h2 className="section-title">District <span className="text-gradient">Branches</span></h2>
                        <p className="section-subtitle">
                            Quality training should never be compromised by distance. We maintain uniform standards across all our elite district branches.
                        </p>
                    </div>

                    <div className="district-grid">
                        {districtDojos.map((dojo) => (
                            <div className={`district-card glow-theme-${dojo.color}`} key={dojo.id}>
                                <div className="district-card__header">
                                    <h3>{dojo.name}</h3>
                                    <Link href={`/senseis/${dojo.senseiId}`} className="district-sensei">
                                        Head: <span>{dojo.sensei}</span> <FaArrowRight className="inline-arrow" />
                                    </Link>
                                </div>

                                <div className="district-card__body">
                                    <div className="d-info">
                                        <div className="d-icon-box"><FaMapMarkerAlt /></div>
                                        <span>{dojo.address}</span>
                                    </div>
                                    <div className="d-info">
                                        <div className="d-icon-box"><FaClock /></div>
                                        <span>{dojo.timings}</span>
                                    </div>
                                    <div className="d-info">
                                        <div className="d-icon-box"><FaPhoneAlt /></div>
                                        <span>{dojo.phone}</span>
                                    </div>
                                </div>

                                <div className="district-card__footer" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                                    <div className="district-ages" style={{ width: '100%', marginBottom: '0.5rem' }}>
                                        {dojo.ages.map((a) => (
                                            <span className="mini-pill" key={a} title={a}>{ageIcon[a]}</span>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%', justifyContent: 'space-between' }}>
                                        <Link href={`/timetable/${dojo.id}`} className="btn" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(255,183,3,0.1)', border: '1px solid var(--gold)', color: 'var(--gold)' }}>
                                            Timetable →
                                        </Link>
                                        <Link href="/contact" className="btn btn-outline-dynamic" style={{ fontSize: '0.75rem', padding: '0.5rem 0.75rem' }}>
                                            Join Branch
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
