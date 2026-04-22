import '../legal.css'

export const metadata = {
  title: 'Terms of Service | SKF Karate',
  description: 'Terms of Service and conditions for SKF Karate.',
}

export default function TermsConditions() {
  return (
    <div className="privacy-page">
      <div className="privacy-orb privacy-orb--1" />
      <div className="privacy-orb privacy-orb--2" />

      <section className="privacy-hero">
        <div className="container">
          <span className="section-label">Legal Documentation</span>
          <h1 className="privacy-hero__title">
            Terms of <span className="text-gradient">Service</span>
          </h1>
        </div>
      </section>

      <div className="privacy-container">
        <div className="privacy-glass-card">
          
          <section className="privacy-section">
            <h2 className="privacy-section__title">1. Acceptance of Terms</h2>
            <p className="privacy-text">
              By accessing the Sports Karate-do Fitness (SKF) platform and enrolling in our programs, you acknowledge and agree to be bound by these Terms of Service. These terms govern your use of our digital portal, physical training facilities, and participation in association events.
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section__title">2. Training & Liability Waiver</h2>
            <p className="privacy-text">
              Karate is a contact-based martial art involving physical exertion and inherent risks. By participating:
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item">
                <span className="privacy-strong">Assumption of Risk:</span> Athletes and guardians acknowledge the risk of injury during training, grading, and tournaments.
              </li>
              <li className="privacy-list-item">
                <span className="privacy-strong">Liability Release:</span> SKF Karate, its affiliates, and certified instructors are released from liability for injuries sustained during association activities.
              </li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section__title">3. Financial & Refund Policy</h2>
            <p className="privacy-text">
              Transparency in association fees is paramount. All financial transactions must be processed via our secure digital payment gateways.
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item">
                <span className="privacy-strong">Non-Refundable Fees:</span> Grading fees and tournament registrations are non-refundable once the bracket or examination schedule is finalized.
              </li>
              <li className="privacy-list-item">
                <span className="privacy-strong">Tuition:</span> Monthly tuition fees must be cleared before the 5th of each month to maintain active enrollment.
              </li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section__title">4. Code of Conduct</h2>
            <p className="privacy-text">
              The DoJo is a sacred space for discipline. Athletes are expected to maintain the highest standards of respect and sportsmanship. Instructors maintain the absolute authority to dismiss any student whose behavior compromises the safety or dignity of the academy.
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
