import Image from 'next/image'
import { FaShieldAlt, FaUsers } from 'react-icons/fa'
import { GiNunchaku } from 'react-icons/gi'

const benefits = [
  {
    title: 'Screen-Free Growth',
    copy: 'Swap smartphones for smart moves. We build focus, respect, and physical fitness in a highly disciplined environment.',
    image: '/summer-camp/screen-free-growth.png',
    alt: 'Kids training karate with focus and discipline',
    Icon: FaShieldAlt,
    iconClassName: '',
    imageOverlayClassName: '',
    cardClassName: '',
  },
  {
    title: 'Real Ninja Skills',
    copy: 'Master the Nunchaku, learn cool self-defense strikes, and earn your certified summer camp belt!',
    image: '/summer-camp/real-ninja-skills.png',
    alt: 'Nunchaku weapon training',
    Icon: GiNunchaku,
    iconClassName: 'benefit-card__icon-badge--crimson',
    imageClassName: 'benefit-card__img-ninja',
    imageOverlayClassName: 'benefit-card__image-overlay--crimson',
    cardClassName: 'benefit-card--highlight',
  },
  {
    title: 'Safe & Supervised',
    copy: '10+ years experienced Senseis ensuring a 100% safe, injury-free, and encouraging mat experience.',
    image: '/summer-camp/safe-supervised.png',
    alt: 'Sensei supervising athlete training',
    Icon: FaUsers,
    iconClassName: '',
    imageOverlayClassName: '',
    cardClassName: '',
  },
]

export default function SummerCampBenefits() {
  return (
    <section className="section benefits">
      <div className="container">
        <div className="benefits__grid">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className={`benefit-card ${benefit.cardClassName}`.trim()}
            >
              <div className="benefit-card__image">
                <Image
                  src={benefit.image}
                  alt={benefit.alt}
                  fill
                  className={benefit.imageClassName}
                  style={{ objectFit: 'cover' }}
                />
                <div
                  className={`benefit-card__image-overlay ${benefit.imageOverlayClassName}`.trim()}
                ></div>
              </div>
              <div className={`benefit-card__icon-badge ${benefit.iconClassName}`.trim()}>
                <benefit.Icon />
              </div>
              <div className="benefit-card__content">
                <h4>{benefit.title}</h4>
                <p>{benefit.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
