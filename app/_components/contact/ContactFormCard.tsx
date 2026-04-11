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
    <div className="glass-card contact-form-wrapper">
      <h3>Schedule Your Call</h3>

      {status === 'success' ? (
        <div className="contact-form__success">
          <FaCheckCircle className="contact-form__success-icon" />
          <h4>Message Sent!</h4>
          <p>Thank you for reaching out. Our team will get back to you shortly.</p>
          <button className="btn btn-secondary" onClick={onReset}>
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

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contact-name">Full Name *</label>
              <div className="form-input-wrapper">
                <FaUser className="form-icon" />
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={onFieldChange}
                  placeholder="Your name"
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contact-email">Email</label>
              <div className="form-input-wrapper">
                <FaEnvelope className="form-icon" />
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  ref={emailRef}
                  value={formData.email}
                  onChange={onEmailChange}
                  placeholder="your@gmail.com"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="contact-phone">Phone *</label>
              <div className="form-input-wrapper">
                <FaPhoneAlt className="form-icon" />
                <input
                  id="contact-phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={onPhoneChange}
                  placeholder="+91 XXXXX XXXXX"
                  className="form-input"
                  required
                  maxLength={16}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="contact-preferredTime">Preferred Time (Optional)</label>
              <div className="form-input-wrapper">
                <FaClock className="form-icon" />
                <input
                  id="contact-preferredTime"
                  type="text"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={onFieldChange}
                  placeholder="e.g. 5 PM, Any evening"
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="contact-interest">Interest</label>
            <div className="form-input-wrapper">
              <FaTag className="form-icon" />
              <select
                id="contact-interest"
                name="interest"
                value={formData.interest}
                onChange={onFieldChange}
                className="form-input"
              >
                <option>Summer Camp 2026</option>
                <option>Regular Classes</option>
                <option>Private Training</option>
                <option>General Inquiry</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="contact-message">Any specific questions? (Optional)</label>
            <div className="form-input-wrapper form-input-wrapper--textarea">
              <FaPen className="form-icon form-icon--textarea" />
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                value={formData.message}
                onChange={onFieldChange}
                placeholder="Let us know what you'd like to discuss on the call..."
                className="form-input"
              ></textarea>
            </div>
          </div>

          {status === 'error' ? <p className="contact-form__error">{errorMsg}</p> : null}

          <button type="submit" className="btn btn-primary contact-form__submit" disabled={status === 'loading'}>
            {status === 'loading' ? (
              <>
                <FaSpinner className="spin" /> Requesting Call...
              </>
            ) : (
              <>
                Request Callback <FaArrowRight className="btn-icon-right" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}
