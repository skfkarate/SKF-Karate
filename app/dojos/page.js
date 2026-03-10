import Link from 'next/link'
import { FaMapMarkerAlt, FaClock, FaPhoneAlt, FaArrowRight, FaChild, FaUserFriends, FaUser } from 'react-icons/fa'
import './dojos.css'

export const metadata = {
    title: 'Dojo Directory — Find a Karate Training Centre Near You',
    description: 'Find an SKF Karate dojo near you. 6 training centres across the city with certified Senseis, flexible timings, and programs for Junior, Cadet, and Senior age groups.',
    openGraph: { title: 'SKF Karate Dojo Directory', description: '6 training centres with certified Senseis. Find a dojo near you.' },
    alternates: { canonical: 'https://skfkarate.org/dojos' },
}

const dojos = [
    { name: 'SKF Headquarters Dojo', sensei: 'Sensei Akira', address: 'Main Road, City Center', phone: '+91 000-000-0001', timings: 'Mon-Sat: 6 AM - 8 PM', ages: ['Junior', 'Cadet', 'Senior'], featured: true },
    { name: 'Central Dojo', sensei: 'Sensei Ravi', address: 'Central Avenue, Downtown', phone: '+91 000-000-0002', timings: 'Mon-Sat: 6:30 AM - 7 PM', ages: ['Junior', 'Cadet', 'Senior'] },
    { name: 'East District Dojo', sensei: 'Sensei Meera', address: 'East District, Sector 12', phone: '+91 000-000-0003', timings: 'Mon-Fri: 5:30 AM - 6:30 PM', ages: ['Junior', 'Cadet'] },
    { name: 'North District Dojo', sensei: 'Sensei Arjun', address: 'North District, Block B', phone: '+91 000-000-0004', timings: 'Mon-Sat: 6 AM - 7 PM', ages: ['Cadet', 'Senior'] },
    { name: 'West District Dojo', sensei: 'Sensei Ravi', address: 'West District, MG Road', phone: '+91 000-000-0005', timings: 'Tue-Sun: 6 AM - 6 PM', ages: ['Junior', 'Cadet', 'Senior'] },
    { name: 'South District Dojo', sensei: 'Sensei Karthik', address: 'South District, Ring Road', phone: '+91 000-000-0006', timings: 'Mon-Sat: 5:30 AM - 7 PM', ages: ['Junior', 'Cadet'] },
]

const ageIcon = { Junior: <FaChild />, Cadet: <FaUserFriends />, Senior: <FaUser /> }

export default function DojosPage() {
    return (
        <div className="dojos-page">
            <section className="page-hero">
                <div className="page-hero__bg">
                    <div className="glow glow-blue page-hero__glow-1"></div>
                    <div className="glow glow-gold page-hero__glow-2"></div>
                </div>
                <div className="container page-hero__content">
                    <span className="section-label"><FaMapMarkerAlt /> Dojo Directory</span>
                    <h1 className="page-hero__title">Find Your <span className="text-gradient">Dojo</span></h1>
                    <p className="page-hero__subtitle">Training Centres Under SKF Karate</p>
                </div>
            </section>

            <section className="section">
                <div className="container">
                    <div className="dojos__grid">
                        {dojos.map((d, i) => (
                            <div className={`glass-card dojo-card ${d.featured ? 'dojo-card--featured' : ''}`} key={i}>
                                {d.featured && <div className="dojo-card__badge">Headquarters</div>}
                                <h3>{d.name}</h3>
                                <span className="dojo-card__sensei">Head: {d.sensei}</span>

                                <div className="dojo-card__details">
                                    <div className="dojo-detail"><FaMapMarkerAlt /> {d.address}</div>
                                    <div className="dojo-detail"><FaClock /> {d.timings}</div>
                                    <div className="dojo-detail"><FaPhoneAlt /> {d.phone}</div>
                                </div>

                                <div className="dojo-card__ages">
                                    {d.ages.map((a) => (
                                        <span className="age-tag" key={a}>{ageIcon[a]} {a}</span>
                                    ))}
                                </div>

                                <Link href="/contact" className="btn btn-secondary btn-sm dojo-card__cta">Enquire <FaArrowRight /></Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}
