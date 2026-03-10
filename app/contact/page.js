'use client'

import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaPaperPlane } from 'react-icons/fa'
import './contact.css'

export default function ContactPage() {
    return (
        <div className="contact-page">
            <section className="page-hero">
                <div className="page-hero__bg">
                    <div className="glow glow-gold page-hero__glow-1"></div>
                    <div className="glow glow-blue page-hero__glow-2"></div>
                </div>
                <div className="container page-hero__content">
                    <span className="section-label"><FaEnvelope /> Get in Touch</span>
                    <h1 className="page-hero__title">Contact <span className="text-gradient">SKF Karate</span></h1>
                    <p className="page-hero__subtitle">Sports Karate-do Fitness & Self Defence Association®</p>
                </div>
            </section>

            <section className="section contact-main">
                <div className="container contact-main__grid">
                    <div className="contact-info">
                        <h2 className="section-title">Take the First <span className="text-gradient">Step</span></h2>
                        <p className="section-subtitle">
                            Ready to enroll in our Summer Camp or join regular sessions? Reach out and our team
                            will get back to you with class schedules, fee details, and everything you need.
                        </p>

                        <div className="contact-info__cards">
                            <div className="glass-card contact-info__card">
                                <div className="contact-info__icon"><FaMapMarkerAlt /></div>
                                <div><h4>Dojo Location</h4><p>SKF Karate Main Headquarters<br />City Center</p></div>
                            </div>
                            <div className="glass-card contact-info__card">
                                <div className="contact-info__icon"><FaPhoneAlt /></div>
                                <div><h4>Call Us</h4><p>+91 (000) 000-0000</p></div>
                            </div>
                            <div className="glass-card contact-info__card">
                                <div className="contact-info__icon"><FaEnvelope /></div>
                                <div><h4>Email</h4><p>info@skfkarate.org</p></div>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card contact-form-wrapper">
                        <h3>Send Us a Message</h3>
                        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" placeholder="Your name" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input type="email" placeholder="your@email.com" className="form-input" />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input type="tel" placeholder="+91 000 000 0000" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label>Interest</label>
                                    <select className="form-input">
                                        <option>Summer Camp 2026</option>
                                        <option>Regular Classes</option>
                                        <option>Private Training</option>
                                        <option>General Inquiry</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Message</label>
                                <textarea rows="5" placeholder="How can we help you?" className="form-input"></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary contact-form__submit">
                                Send Message <FaPaperPlane />
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    )
}
