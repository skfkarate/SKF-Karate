import '../legal.css'

export const metadata = {
  title: 'Cookie Policy | SKF Karate',
  description: 'Cookie Policy for Sports Karate-do Fitness & Self Defence Association®',
}

export default function CookiePolicy() {
  return (
    <div className="privacy-page">
      <div className="privacy-orb privacy-orb--1" />
      <div className="privacy-orb privacy-orb--2" />

      <section className="privacy-hero">
        <div className="container">
          <span className="section-label">Legal Documentation</span>
          <h1 className="privacy-hero__title">
            Cookie <span className="text-gradient">Policy</span>
          </h1>
        </div>
      </section>

      <div className="privacy-container">
        <div className="privacy-glass-card">
          
          <section className="privacy-section">
            <h2 className="privacy-section__title">1. Essential Infrastructure</h2>
            <p className="privacy-text">
              These technical cookies are strictly necessary for the platform to function. Without them, we cannot provide secure access to the Athlete Portal or handle your session state.
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item">
                <span className="privacy-strong">skf_student_token:</span> Secure JWT for portal authentication.
              </li>
              <li className="privacy-list-item">
                <span className="privacy-strong">skf_session:</span> Temporary identifier for current session security.
              </li>
              <li className="privacy-list-item">
                <span className="privacy-strong">skf_consent:</span> Records your privacy and cookie preferences.
              </li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section__title">2. Analytics & Performance</h2>
            <p className="privacy-text">
              We utilize performance measurement tools to understand how our community interacts with the site. These cookies only activate if you provide explicit consent via our preference banner.
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item">
                <span className="privacy-strong">Google Analytics:</span> Identifies returning visitors and session duration to help us optimize page speeds and content relevance.
              </li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section__title">3. Preference Management</h2>
            <p className="privacy-text">
              You maintain full control over your digital footprint. You can reset your cookie choices at any time by clearing your browser cache or adjusting the settings in your modern browser's privacy dashboard.
            </p>
          </section>

          <div className="privacy-footer">
            <p className="privacy-updated">Document Revision: March 2026</p>
          </div>

        </div>
      </div>
    </div>
  )
}
