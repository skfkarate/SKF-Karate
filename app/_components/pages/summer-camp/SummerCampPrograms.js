import Link from 'next/link'
import { FaArrowRight, FaFire, FaShieldAlt } from 'react-icons/fa'
import { GiBlackBelt, GiNunchaku } from 'react-icons/gi'

const programs = [
  {
    title: 'Month 1',
    level: 'Self Defense Training',
    price: '₹1,500',
    period: '/mo',
    buttonClassName: 'btn btn-secondary program-card__btn',
    buttonCopy: 'Enroll Month 1',
    features: [
      '<strong>For kids:</strong> Cool reflex & evasion games',
      '<strong>For parents:</strong> Screen-free discipline building',
      'Practical self-defense techniques',
      'Situational awareness / Bully prevention',
      'Certified completion certificate',
    ],
    Icon: FaShieldAlt,
    cardClassName: '',
  },
  {
    title: 'Full Camp',
    level: 'Both Months (1 Month Free!)',
    price: '₹1,500',
    priceOld: '₹2,500',
    period: '/total',
    buttonClassName: 'btn btn-primary program-card__btn',
    buttonCopy: 'Enroll Full Camp',
    features: [
      'Month 1: Self Defense (Discipline & Focus)',
      'Month 2: Nunchaku (Coordination & Agility)',
      'Comprehensive fitness & stamina building',
      'Mastery of a predefined Nunchaku sequence',
      'Certified completion certificate',
    ],
    Icon: GiBlackBelt,
    cardClassName: 'program-card--featured program-card--offer',
    badge: 'First 10 Slots',
    withArrow: true,
  },
  {
    title: 'Month 2',
    level: 'Nunchaku Weapon Training',
    price: '₹1,500',
    period: '/mo',
    buttonClassName: 'btn btn-secondary program-card__btn',
    buttonCopy: 'Enroll Month 2',
    features: [
      '<strong>For kids:</strong> Learn movie-style strikes',
      '<strong>For parents:</strong> Safe, foam training weapons',
      'Nunchaku basics, grips, and safety',
      'Hand-eye coordination drills',
      'Certified completion certificate',
    ],
    Icon: GiNunchaku,
    cardClassName: '',
  },
]

export default function SummerCampPrograms() {
  return (
    <section className="section programs" id="pricing">
      <div className="container">
        <div className="programs__header">
          <span className="section-label">
            <GiBlackBelt /> Camp Structure
          </span>
          <h2 className="section-title">
            Training Plans &amp; <span className="text-gradient">Pricing</span>
          </h2>
          <p className="section-subtitle programs__subtitle">
            Choose a single month of specialized training or get the ultimate experience by
            enrolling for both.
          </p>
        </div>

        <div className="offer-banner glass-card">
          <div className="offer-banner__glow"></div>
          <div className="offer-banner__content">
            <div className="offer-banner__badge">1+1 Free Offer</div>
            <h3>
              <FaFire className="offer-banner__icon" /> First 10 Enrollments Special
            </h3>
            <p>
              Enroll for the Full Camp and get <strong>1 Month FREE!</strong>
              <br />
              Pay only <strong className="text-gold">₹1,500</strong> instead of{' '}
              <span className="price-strike">₹2,500</span>.
            </p>
          </div>
        </div>

        <div className="programs__grid">
          {programs.map((program) => (
            <div
              key={program.title}
              className={`glass-card program-card ${program.cardClassName}`.trim()}
            >
              {program.badge ? <div className="program-card__badge">{program.badge}</div> : null}

              <div className="program-card__header">
                <div className="program-card__icon">
                  <program.Icon />
                </div>
                <h3>{program.title}</h3>
                <p className="program-card__level">{program.level}</p>
                <div className="program-card__price">
                  {program.priceOld ? (
                    <span className="program-card__price-old">{program.priceOld}</span>
                  ) : null}
                  {program.price}
                  <span>{program.period}</span>
                </div>
              </div>

              <ul className="program-card__features">
                {program.features.map((feature) => (
                  <li
                    key={feature}
                    dangerouslySetInnerHTML={{ __html: feature }}
                  />
                ))}
              </ul>

              <Link href="/contact" className={program.buttonClassName}>
                {program.buttonCopy}
                {program.withArrow ? <FaArrowRight /> : null}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
