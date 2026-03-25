import { FaPhoneAlt, FaPaperPlane } from 'react-icons/fa'

export default function ContactInfoPanel() {
  return (
    <div className="contact-info">
      <h2 className="section-title">
        Request a <span className="text-gradient">Callback</span>
      </h2>
      <p className="section-subtitle">
        Ready to start your Karate journey? Leave your details with us, and our team will
        reach out to you personally to answer any questions, discuss schedules, and help you
        get started.
      </p>

      <div className="contact-info__cards">
        <div className="glass-card contact-info__card">
          <div className="contact-info__icon">
            <FaPhoneAlt />
          </div>
          <div>
            <h4>Personal Consultation</h4>
            <p>We'll call you directly to understand your goals and recommend the best program.</p>
          </div>
        </div>

        <div className="glass-card contact-info__card">
          <div className="contact-info__icon">
            <FaPaperPlane />
          </div>
          <div>
            <h4>Fast Response</h4>
            <p>Our team is notified instantly, so you won't be kept waiting.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
