import Link from 'next/link'
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp, FaEnvelope, FaPhoneAlt, FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa'
import Image from 'next/image'
import './Footer.css'

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                {/* Main Footer */}
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

                    {/* Contact */}
                    <div className="footer__section">
                        <h4 className="footer__heading">Contact Us</h4>
                        <div className="footer__contact-list">
                            <a href="tel:+919019971726" className="footer__contact-item">
                                <FaPhoneAlt className="footer__contact-icon" />
                                <span>+91 90199 71726</span>
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
                            <a href="/home" className="footer__social-icon footer__social-icon--yt" aria-label="YouTube" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
                        </div>
                        <div className="footer__cta-group">
                            <Link href="/contact" className="footer__cta footer__cta--outline">
                                <FaPhoneAlt />
                                <span>Request a Call</span>
                                <FaArrowRight className="footer__cta-arrow" />
                            </Link>
                            <Link href="/summer-camp" className="footer__cta footer__cta--primary">
                                <span>Join Summer Camp 2026</span>
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
                        <Link href="/terms" className="footer__legal-link">Terms & Conditions</Link>
                    </div>
                    <p className="footer__credit">
                        Designed &amp; developed with ❤️ for the karate community
                    </p>
                </div>
            </div>
        </footer>
    )
}
