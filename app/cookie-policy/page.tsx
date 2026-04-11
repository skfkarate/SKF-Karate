export const metadata = {
  title: 'Cookie Policy | SKF Karate',
  description: 'Cookie Policy for Sports Karate-do Fitness & Self Defence Association®',
}

export default function CookiePolicy() {
  return (
    <div className="page-wrapper">
      <div className="page-hero" style={{ minHeight: '40vh' }}>
        <div className="page-hero__bg">
          <div className="glow glow-red page-hero__glow-1"></div>
          <div className="glow glow-blue page-hero__glow-2"></div>
        </div>
        <div className="page-hero__content container">
          <span className="section-label">Legal</span>
          <h1 className="page-hero__title">Cookie <span className="text-gradient">Policy</span></h1>
        </div>
      </div>

      <section className="section" style={{ paddingTop: '4rem', paddingBottom: '7rem' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', color: 'var(--text-light)', lineHeight: '1.8' }}>
          
          <h2 style={{ color: 'white', marginTop: '2rem', marginBottom: '1rem' }}>1. Essential Cookies</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            These cookies are required for the platform to operate correctly.<br/>
            • <b>skf_student_token:</b> A secure JSON Web Token used to authenticate students accessing the portal.<br/>
            • <b>skf_cookie_consent:</b> Used to remember your cookie preferences.
          </p>

          <h2 style={{ color: 'white', marginTop: '2rem', marginBottom: '1rem' }}>2. Analytics Cookies</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            If you provide consent, we use Google Analytics to measure site traffic and optimize our platform.<br/>
            • <b>_ga, _ga_*:</b> These cookies are set by Google Analytics to distinguish users and track session state.
          </p>

          <h2 style={{ color: 'white', marginTop: '2rem', marginBottom: '1rem' }}>3. Managing Preferences</h2>
          <p style={{ marginBottom: '1.5rem' }}>
            You can customize your cookie preferences at any time by clearing your browser cache or clicking "Customize Cookies" at the bottom of the screen (re-displays the banner when the "skf_cookie_consent" cookie is cleared).
          </p>

          <p style={{ marginTop: '3rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Last updated: March 2026
          </p>
        </div>
      </section>
    </div>
  )
}
