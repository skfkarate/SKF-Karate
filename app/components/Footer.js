import Link from 'next/link'
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp, FaEnvelope, FaPhoneAlt } from 'react-icons/fa'
import './Footer.css'

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                {/* Main Footer */}
                <div className="footer__main">
                    {/* Brand + Contact */}
                    <div className="footer__brand">
                        <Link href="/" className="footer__logo">
                            <img src="/logo/SKF logo.png" alt="SKF Karate" className="footer__logo-img" />
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
                            <a href="tel:+919019971769" className="footer__contact-item">
                                <FaPhoneAlt className="footer__contact-icon" />
                                <span>+91 90199 71769</span>
                            </a>
                            <a href="mailto:contact@skfkarate.org" className="footer__contact-item">
                                <FaEnvelope className="footer__contact-icon" />
                                <span>contact@skfkarate.org</span>
                            </a>
                        </div>
                    </div>

                    {/* Follow + CTA */}
                    <div className="footer__section">
                        <h4 className="footer__heading">Follow Us</h4>
                        <div className="footer__social">
                            <a href="https://wa.me/919019971769" className="footer__social-icon footer__social-icon--wa" aria-label="WhatsApp"><FaWhatsapp /></a>
                            <a href="#" className="footer__social-icon footer__social-icon--ig" aria-label="Instagram"><FaInstagram /></a>
                            <a href="#" className="footer__social-icon footer__social-icon--fb" aria-label="Facebook"><FaFacebookF /></a>
                            <a href="#" className="footer__social-icon footer__social-icon--yt" aria-label="YouTube"><FaYoutube /></a>
                        </div>
                        <Link href="/summer-camp" className="btn btn-primary footer__cta-btn">
                            Join Summer Camp 2026
                        </Link>
                    </div>
                </div>

                {/* Divider */}
                <div className="footer__divider"></div>

                {/* Bottom Bar */}
                <div className="footer__bottom">
                    <p className="footer__copyright">
                        &copy; {new Date().getFullYear()} Sports Karate-do Fitness &amp; Self Defence Association®. All rights reserved.
                    </p>
                    <p className="footer__credit">
                        Designed &amp; developed with ❤️ for the karate community
                    </p>
                </div>
            </div>
        </footer>
    )
}
