import { GiBlackBelt } from 'react-icons/gi'

export default function SummerCampInstructor() {
  return (
    <section className="section sensei">
      <div className="glow glow-gold sensei__glow"></div>
      <div className="container">
        <div className="sensei__header">
          <span className="section-label">
            <GiBlackBelt /> Your Instructor
          </span>
          <h2 className="section-title">
            Meet Your <span className="text-gradient">Sensei</span>
          </h2>
        </div>
        <div className="sensei__content glass-card">
          <div className="sensei__avatar">
            <GiBlackBelt />
          </div>
          <div className="sensei__info">
            <h3>Sensei Usha C</h3>
            <p className="sensei__title">President - SKF Karate</p>
            <p className="sensei__bio">
              Sensei Usha C (4th Dan Black Belt & Senior Instructor) leads the SKF Karate
              Summer Camp 2026. Specializing in self-defense, fitness, and Nunchaku, she
              blends traditional discipline with modern techniques to build strength,
              resilience, and confidence in every athlete.
            </p>
            <div className="sensei__stats">
              <div className="sensei__stat">
                <span className="sensei__stat-number">500+</span>
                <span className="sensei__stat-label">Athletes Trained</span>
              </div>
              <div className="sensei__stat">
                <span className="sensei__stat-number">10+</span>
                <span className="sensei__stat-label">Years Experience</span>
              </div>
              <div className="sensei__stat">
                <span className="sensei__stat-number">3</span>
                <span className="sensei__stat-label">Dojo Branches</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
