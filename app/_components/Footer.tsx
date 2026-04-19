import Link from 'next/link'
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp, FaEnvelope, FaPhoneAlt, FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa'
import Image from 'next/image'
import SponsorGrid from '@/components/SponsorGrid'

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                {/* Partners */}
                <div style={{ marginBottom: '4rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <p style={{ color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.8rem', marginBottom: '1rem' }}>Our Partners</p>
                        <SponsorGrid tierFilter="Bronze" layout="flex" />
                    </div>
                </div>
                
                <div className="footer__main">
                    {/* Brand */}
                    <div className="footer__brand">
                        <Link href="/" className="footer__logo">
                            <Image src="/logo/SKF logo.png" alt="SKF Karate" width={60} height={60} className="footer__logo-img" />
                            <div className="footer__logo-text">
                                <span>SKF</span> <span className="text-gradient">KARATE</span>
                            </div>
                        </Link>
                        <p className="footer__tagline">Sports Karate-do Fitness &amp; Self Defence Association®</p>
                        <p className="footer__motto">&ldquo;Nothing is Impossible&rdquo;</p>
                    </div>

                    {/* Quick Links */}
                    <div className="footer__section">
                        <h4 className="footer__heading">Quick Links</h4>
                        <div className="footer__links-list">
                            <Link href="/classes" className="footer__link">Classes</Link>
                            <Link href="/about" className="footer__link">About SKF</Link>
                            <Link href="/rankings" className="footer__link">Rankings</Link>
                            <Link href="/events" className="footer__link">Events</Link>
                            <Link href="/results" className="footer__link">Results</Link>
                            <Link href="/grading" className="footer__link">Belt Grading</Link>
                            <Link href="/gallery" className="footer__link">Gallery</Link>
                            <Link href="/contact" className="footer__link">Contact</Link>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="footer__section">
                        <h4 className="footer__heading">Contact Us</h4>
                        <div className="footer__contact-list">
                            <a href="tel:+919019971726" className="footer__contact-item">
                                <FaPhoneAlt className="footer__contact-icon" />
                                <span>+91 90199 71726</span>
                            </a>
                            <a href="https://wa.me/919019971726" className="footer__contact-item" target="_blank" rel="noopener noreferrer">
                                <FaWhatsapp className="footer__contact-icon" />
                                <span>WhatsApp Us</span>
                            </a>
                            <div className="footer__contact-item">
                                <FaEnvelope className="footer__contact-icon" />
                                <span>contact@skfkarate.org</span>
                            </div>
                            <div className="footer__contact-item footer__contact-item--address">
                                <FaMapMarkerAlt className="footer__contact-icon" />
                                <span>
                                    No.24, 12th Cross, Vigneshwara Nagar,<br />
                                    Sunkadakatte, Vishwaneedam Post,<br />
                                    Bengaluru - 560091
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Follow + CTA */}
                    <div className="footer__section footer__section--right">
                        <h4 className="footer__heading">Follow Us</h4>
                        <div className="footer__social">
                            <a href="https://wa.me/919019971726" className="footer__social-icon footer__social-icon--wa" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
                            <a href="https://www.instagram.com/skf_karate/" className="footer__social-icon footer__social-icon--ig" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                            <a href="https://www.facebook.com/share/1DG1UZ3vKp/?mibextid=wwXIfr" className="footer__social-icon footer__social-icon--fb" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                            <a href="https://www.youtube.com/@skfkarate" className="footer__social-icon footer__social-icon--yt" aria-label="YouTube" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
                        </div>
                        <div className="footer__cta-group">
                            <Link href="/classes" className="footer__cta footer__cta--outline">
                                <FaMapMarkerAlt />
                                <span>Find Classes</span>
                                <FaArrowRight className="footer__cta-arrow" />
                            </Link>
                            <Link href="/contact" className="footer__cta footer__cta--primary">
                                <FaPhoneAlt />
                                <span>Get in Touch</span>
                                <FaArrowRight className="footer__cta-arrow" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="footer__divider"></div>

                {/* Bottom Bar */}
                <div className="footer__bottom">
                    <p className="footer__copyright">
                        &copy; {new Date().getFullYear()} Sports Karate-do Fitness &amp; Self Defence Association®. All rights reserved.
                    </p>
                    <div className="footer__legal-links">
                        <Link href="/privacy-policy" className="footer__legal-link">Privacy Policy</Link>
                        <Link href="/cookie-policy" className="footer__legal-link">Cookie Policy</Link>
                        <Link href="/terms-of-service" className="footer__legal-link">Terms of Service</Link>
                    </div>
                    <p className="footer__credit">
                        Designed &amp; developed with ❤️ for the karate community
                    </p>
                </div>
            </div>
        </footer>
    )
}
