import Link from 'next/link'
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp } from 'react-icons/fa'
import './Footer.css'

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer__grid">
                    <div className="footer__brand">
                        <Link href="/" className="footer__logo">
                            <span>SKF</span><span className="text-gradient">KARATE</span>
                        </Link>
                        <p className="footer__tagline">Sports Karate-do Fitness & Self Defence Association®</p>
                        <p className="footer__motto">Nothing is Impossible</p>
                    </div>

                    <div className="footer__col">
                        <h4>About</h4>
                        <ul>
                            <li><Link href="/about">Our Legacy</Link></li>
                            <li><Link href="/senseis">Our Senseis</Link></li>
                            <li><Link href="/dojos">Dojo Directory</Link></li>
                            <li><Link href="/honours">Honours Board</Link></li>
                        </ul>
                    </div>

                    <div className="footer__col">
                        <h4>Training</h4>
                        <ul>
                            <li><Link href="/grading">Kyu & Dan System</Link></li>
                            <li><Link href="/summer-camp">Summer Camp 2026</Link></li>
                            <li><Link href="/events">Events & Calendar</Link></li>
                            <li><Link href="/documents">Rules & Documents</Link></li>
                        </ul>
                    </div>

                    <div className="footer__col">
                        <h4>Community</h4>
                        <ul>
                            <li><Link href="/news">News & Updates</Link></li>
                            <li><Link href="/gallery">Gallery</Link></li>
                            <li><Link href="/contact">Contact Us</Link></li>
                        </ul>
                        <div className="footer__social-icons">
                            <a href="#" className="footer__social-icon" aria-label="Facebook"><FaFacebookF /></a>
                            <a href="#" className="footer__social-icon" aria-label="Instagram"><FaInstagram /></a>
                            <a href="#" className="footer__social-icon" aria-label="YouTube"><FaYoutube /></a>
                            <a href="#" className="footer__social-icon" aria-label="WhatsApp"><FaWhatsapp /></a>
                        </div>
                    </div>
                </div>

                <div className="footer__bottom">
                    <p>&copy; {new Date().getFullYear()} SKF Karate. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    )
}
