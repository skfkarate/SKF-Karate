import {
  FaArrowRight,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaPen,
  FaPhoneAlt,
  FaSpinner,
  FaTag,
  FaUser,
} from 'react-icons/fa'

export default function ContactFormCard({
  emailRef,
  errorMsg,
  formData,
  onEmailChange,
  onFieldChange,
  onPhoneChange,
  onReset,
  onSubmit,
  status,
}) {
  return (
    <div className="contact-glass-pane contact-glass-pane--prime">
      <h3 className="contact-form-title">Request a Callback</h3>

      {status === 'success' ? (
        <div className="contact-success">
          <FaCheckCircle className="contact-success-icon" />
          <h4 className="contact-success-title">Message Sent!</h4>
          <p className="contact-success-text">Thank you for reaching out. Our team will get back to you shortly.</p>
          <button className="btn btn-primary" onClick={onReset}>
            Send Another Message
          </button>
        </div>
      ) : (
        <form className="contact-form" onSubmit={onSubmit}>
          <input
            type="text"
            name="website"
            value={formData.website}
            onChange={onFieldChange}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ display: 'none' }}
          />

          <div className="contact-form-row">
            <div className="contact-form-group">
              <label className="contact-label" htmlFor="contact-name">Full Name *</label>
              <div className="contact-input-wrap">
                <FaUser className="contact-input-icon" />
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onFieldChange}
                  placeholder="Your name"
                  className="contact-input"
                  required
                />
              </div>
            </div>

            <div className="contact-form-group">
              <label className="contact-label" htmlFor="contact-email">Email</label>
              <div className="contact-input-wrap">
                <FaEnvelope className="contact-input-icon" />
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  ref={emailRef}
                  value={formData.email}
                  onChange={onEmailChange}
                  placeholder="your@gmail.com"
                  className="contact-input"
                />
              </div>
            </div>
          </div>

          <div className="contact-form-row">
            <div className="contact-form-group">
              <label className="contact-label" htmlFor="contact-phone">Phone *</label>
              <div className="contact-input-wrap">
                <FaPhoneAlt className="contact-input-icon" />
                <input
                  id="contact-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={onPhoneChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="contact-input"
                  required
                  maxLength={16}
                />
              </div>
            </div>

            <div className="contact-form-group">
              <label className="contact-label" htmlFor="contact-preferredTime">Preferred Time</label>
              <div className="contact-input-wrap">
                <FaClock className="contact-input-icon" />
                <input
                  id="contact-preferredTime"
                  type="text"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={onFieldChange}
                  placeholder="e.g. 5 PM, Any evening"
                  className="contact-input"
                />
              </div>
            </div>
          </div>

          <div className="contact-form-group">
            <label className="contact-label" htmlFor="contact-interest">Interest</label>
            <div className="contact-input-wrap">
              <FaTag className="contact-input-icon" />
              <select
                id="contact-interest"
                name="interest"
                value={formData.interest}
                onChange={onFieldChange}
                className="contact-input contact-select"
              >
                <option>Regular Classes</option>
                <option>Private Training</option>
                <option>General Inquiry</option>
              </select>
            </div>
          </div>

          <div className="contact-form-group">
            <label className="contact-label" htmlFor="contact-message">Your Message (Optional)</label>
            <div className="contact-input-wrap">
              <FaPen className="contact-input-icon contact-input-icon--top" />
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={onFieldChange}
                placeholder="Let us know what you'd like to discuss..."
                className="contact-input"
              ></textarea>
            </div>
          </div>

          {status === 'error' && (
            <div className="contact-error">
                {errorMsg}
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={status === 'loading'}>
            {status === 'loading' ? (
              <>
                <FaSpinner className="contact-spinner" /> Sending...
              </>
            ) : (
              <>
                Request Callback <FaArrowRight />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
