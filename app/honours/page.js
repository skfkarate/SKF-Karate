import { FaAward, FaMedal, FaStar, FaTrophy } from 'react-icons/fa'
import { GiPodium } from 'react-icons/gi'

import './honours.css'

const champions = [
  { name: 'Arun Kumar', achievement: 'National Kumite Champion — Senior', year: '2025', cat: 'kumite' },
  { name: 'Divya Sharma', achievement: 'National Kata Champion — Cadet', year: '2025', cat: 'kata' },
  { name: 'Raj Patel', achievement: 'State Kumite Champion (5x consecutive)', year: '2021–2025', cat: 'kumite' },
  { name: 'Sneha Nair', achievement: 'National Team Selection — Kata', year: '2026', cat: 'kata' },
  { name: 'Vikram Singh', achievement: 'National Team Selection — Kumite', year: '2026', cat: 'kumite' },
  { name: 'Ananya Reddy', achievement: 'State Kata Champion — Junior', year: '2025', cat: 'kata' },
]

const awards = [
  { title: 'Karateka of the Year — Senior', recipient: 'Arun Kumar', year: '2025' },
  { title: 'Karateka of the Year — Junior', recipient: 'Ananya Reddy', year: '2025' },
  { title: 'Best Sensei Award', recipient: 'Sensei Ravi', year: '2025' },
  { title: 'Best Dojo — Overall', recipient: 'SKF Headquarters', year: '2025' },
  { title: 'Most Improved Karateka', recipient: 'Kiran Mehta', year: '2025' },
  { title: 'Spirit of Karate-Do Award', recipient: 'Sensei Meera', year: '2025' },
]

const milestones = [
  { text: '5100+ active students trained', icon: <FaStar /> },
  { text: '12 Gold at State Championship 2026', icon: <FaMedal /> },
  { text: '4 athletes selected for National Squad', icon: <GiPodium /> },
  { text: '300+ champions produced at state & national level', icon: <FaTrophy /> },
]

export default function HonoursPage() {
  return (
    <div className="honours-page">
      <section className="page-hero">
        <div className="page-hero__bg">
          <div className="glow glow-gold page-hero__glow-1" />
          <div className="glow glow-red page-hero__glow-2" />
        </div>
        <div className="container page-hero__content">
          <span className="section-label">
            <FaTrophy /> Honours
          </span>
          <h1 className="page-hero__title">
            Honours <span className="text-gradient">Board</span>
          </h1>
          <p className="page-hero__subtitle">Celebrating Excellence in Karate-Do</p>
        </div>
      </section>

      <section className="section milestones-section">
        <div className="container">
          <div className="milestones__grid">
            {milestones.map((milestone) => (
              <div className="glass-card milestone-card" key={milestone.text}>
                <div className="milestone-card__icon">{milestone.icon}</div>
                <p>{milestone.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="glow glow-gold champions__glow" />
        <div className="container">
          <div className="champions__header">
            <span className="section-label">
              <FaMedal /> Champions
            </span>
            <h2 className="section-title">
              Our <span className="text-gradient">Champions</span>
            </h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              State, National, and International achievers who carry the SKF banner with pride.
            </p>
          </div>
          <div className="champions__grid">
            {champions.map((champion) => (
              <div className="glass-card champion-card" key={`${champion.name}-${champion.year}`}>
                <div className={`champion-card__badge champion-card__badge--${champion.cat}`}>
                  {champion.cat}
                </div>
                <h3>{champion.name}</h3>
                <p>{champion.achievement}</p>
                <span className="champion-card__year">{champion.year}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section awards-section">
        <div className="container">
          <div className="awards__header">
            <span className="section-label">
              <FaAward /> Annual Awards
            </span>
            <h2 className="section-title">
              Year-End <span className="text-gradient">Awards 2025</span>
            </h2>
          </div>
          <div className="awards__grid">
            {awards.map((award) => (
              <div className="glass-card award-card" key={`${award.title}-${award.recipient}`}>
                <FaTrophy className="award-card__icon" />
                <h4>{award.title}</h4>
                <p className="award-card__recipient">{award.recipient}</p>
                <span className="award-card__year">{award.year}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
