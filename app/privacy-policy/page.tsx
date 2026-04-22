import '../legal.css'

export const metadata = {
  title: 'Privacy Policy | SKF Karate',
  description: 'Privacy Policy for Sports Karate-do Fitness & Self Defence Association®',
}

export default function PrivacyPolicy() {
  return (
    <div className="privacy-page">
      {/* Ambient effects */}
      <div className="privacy-orb privacy-orb--1" />
      <div className="privacy-orb privacy-orb--2" />

      {/* HERO */}
      <section className="privacy-hero">
        <div className="container">
          <span className="section-label">Legal Documentation</span>
          <h1 className="privacy-hero__title">
            Privacy <span className="text-gradient">Policy</span>
          </h1>
        </div>
      </section>

      {/* CONTENT */}
      <div className="privacy-container">
        <div className="privacy-glass-card">
          
          <section className="privacy-section">
            <h2 className="privacy-section__title">1. Information We Collect</h2>
            <p className="privacy-text">
              We collect information you provide directly to us when you interact with our platform. This includes personal identifiers provided during registration, form submissions, or direct inquiries.
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item">Name and Contact Information</li>
              <li className="privacy-list-item">Enrollment and Belt Progression Data</li>
              <li className="privacy-list-item">Payment and Transaction Records</li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section__title">2. How We Use Your Information</h2>
            <p className="privacy-text">
              Our primary goal is to provide a seamless training and administrative experience. We use your data to manage class schedules, track student progress, and facilitate secure communications regarding events and association updates.
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section__title">3. Infrastructure & Partners</h2>
            <p className="privacy-text">
              We utilize enterprise-grade infrastructure to ensure your data remains secure. Your information is processed through the following trusted platforms:
            </p>
            <ul className="privacy-list">
              <li className="privacy-list-item">
                <span className="privacy-strong">Supabase:</span> Manages authenticated access, student records, and encrypted rankings.
              </li>
              <li className="privacy-list-item">
                <span className="privacy-strong">Google Cloud:</span> Used for backend automation and real-time timetable synchronization.
              </li>
              <li className="privacy-list-item">
                <span className="privacy-strong">Razorpay:</span> Handles all financial transactions with end-to-end encryption. We do not store card details.
              </li>
            </ul>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section__title">4. Data Sovereignty</h2>
            <p className="privacy-text">
              We do not sell, trade, or distribute your personal data to third-party marketing entities. Your data exists solely for the purpose of your association with Sports Karate-do Fitness.
            </p>
          </section>

          <section className="privacy-section">
            <h2 className="privacy-section__title">5. Contact Legal</h2>
            <p className="privacy-text">
              For any clarifications regarding our data practices or to request data deletion, please reach out to our administrative team:
            </p>
            <div className="privacy-text" style={{ marginTop: '1rem', color: '#fff', fontWeight: 600 }}>
              Email: contact@skfkarate.org<br/>
              Phone: +91 90199 71726
            </div>
          </section>

          <div className="privacy-footer">
            <p className="privacy-updated">Document Revision: March 2026</p>
          </div>

        </div>
      </div>
    </div>
  )
}
