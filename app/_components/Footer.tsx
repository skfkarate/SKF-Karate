import Link from 'next/link'
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp, FaEnvelope, FaPhoneAlt, FaArrowRight, FaMapMarkerAlt } from 'react-icons/fa'
import Image from 'next/image'
import { CONTACT, SOCIAL_LINKS } from '@/data/constants/contact'
import { FOOTER_QUICK_LINKS } from '@/data/constants/navigation'


export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">

                
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
                            {FOOTER_QUICK_LINKS.map(link => (
                                <Link key={link.label} href={link.href!} className="footer__link">{link.label}</Link>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="footer__section">
                        <h4 className="footer__heading">Contact Us</h4>
                        <div className="footer__contact-list">
                            <a href={`tel:${CONTACT.PHONE_RAW}`} className="footer__contact-item">
                                <FaPhoneAlt className="footer__contact-icon" />
                                <span>{CONTACT.PHONE}</span>
                            </a>
                            <a href={`https://wa.me/${CONTACT.PHONE_RAW}`} className="footer__contact-item" target="_blank" rel="noopener noreferrer">
                                <FaWhatsapp className="footer__contact-icon" />
                                <span>WhatsApp Us</span>
                            </a>
                            <div className="footer__contact-item">
                                <FaEnvelope className="footer__contact-icon" />
                                <span>{CONTACT.EMAIL}</span>
                            </div>
                            <div className="footer__contact-item footer__contact-item--address">
                                <FaMapMarkerAlt className="footer__contact-icon" />
                                <span>
                                    {CONTACT.ADDRESS.line1}<br />
                                    {CONTACT.ADDRESS.line2}<br />
                                    {CONTACT.ADDRESS.line3}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Follow + CTA */}
                    <div className="footer__section footer__section--right">
                        <h4 className="footer__heading">Follow Us</h4>
                        <div className="footer__social">
                            <a href={`https://wa.me/${CONTACT.PHONE_RAW}`} className="footer__social-icon footer__social-icon--wa" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
                            <a href={SOCIAL_LINKS.INSTAGRAM} className="footer__social-icon footer__social-icon--ig" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                            <a href={SOCIAL_LINKS.FACEBOOK} className="footer__social-icon footer__social-icon--fb" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                            <a href={SOCIAL_LINKS.YOUTUBE} className="footer__social-icon footer__social-icon--yt" aria-label="YouTube" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
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
