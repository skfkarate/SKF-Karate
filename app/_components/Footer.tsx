import Link from 'next/link'
import { FaInstagram, FaYoutube, FaWhatsapp, FaFacebookF } from 'react-icons/fa'
import Image from 'next/image'
import { CONTACT, SOCIAL_LINKS } from '@/data/constants/contact'
import { getAllCities } from '@/lib/classesData'

export default function Footer() {
    const cities = getAllCities()
    const allBranches = cities.flatMap(c => c.branches)

    return (
        <footer className="ft">
            {/* Animated accent line */}
            <div className="ft__accent" />

            {/* Watermark */}
            <div className="ft__kanji" aria-hidden="true">武</div>

            <div className="container">

                {/* ── MONUMENT: Big typographic brand statement ── */}
                <div className="ft__monument">
                    <Link href="/" className="ft__monument-logo">
                        <Image src="/logo/SKF logo.png" alt="SKF" width={44} height={44} className="ft__monument-img" />
                    </Link>
                    <h2 className="ft__monument-type">
                        <span className="ft__monument-skf">SKF</span>
                        <span className="ft__monument-karate">KARATE</span>
                    </h2>
                    <p className="ft__monument-motto">Nothing is Impossible</p>
                </div>

                {/* ── LINK RIVER: Compact horizontal nav ── */}
                <nav className="ft__river" aria-label="Footer navigation">
                    <Link href="/classes" className="ft__river-link">Classes</Link>
                    <Link href="/about" className="ft__river-link">About</Link>
                    <Link href="/rankings" className="ft__river-link">Rankings</Link>
                    <Link href="/events" className="ft__river-link">Events</Link>
                    <Link href="/results" className="ft__river-link">Results</Link>
                    <Link href="/gallery" className="ft__river-link">Gallery</Link>
                    <Link href="/grading" className="ft__river-link">Belt Grading</Link>
                    <Link href="/shop" className="ft__river-link">Shop</Link>
                    <Link href="/contact" className="ft__river-link">Contact</Link>
                    <Link href="/portal" className="ft__river-link ft__river-link--portal">Athlete Portal</Link>
                </nav>

                {/* ── DOJOS: Location chips ── */}
                <div className="ft__dojos">
                    {allBranches.map(branch => (
                        <Link
                            key={branch.slug}
                            href={`/classes/${cities.find(c => c.branches.includes(branch))?.slug || 'bangalore'}/${branch.slug}`}
                            className="ft__dojo-chip"
                        >
                            <span className="ft__dojo-pulse" />
                            {branch.name}
                        </Link>
                    ))}
                </div>

                {/* ── CONTACT + SOCIAL: Single elegant row ── */}
                <div className="ft__connect">
                    <div className="ft__connect-info">
                        <a href={`tel:${CONTACT.PHONE_RAW}`} className="ft__connect-item">{CONTACT.PHONE}</a>
                        <span className="ft__connect-dot" />
                        <a href={`mailto:${CONTACT.EMAIL}`} className="ft__connect-item">{CONTACT.EMAIL}</a>
                        <span className="ft__connect-dot" />
                        <span className="ft__connect-item ft__connect-item--addr">{CONTACT.HQ_ADDRESS}</span>
                    </div>
                    <div className="ft__socials">
                        <a href={SOCIAL_LINKS.INSTAGRAM} className="ft__soc ft__soc--ig" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><FaInstagram /></a>
                        <a href={SOCIAL_LINKS.YOUTUBE} className="ft__soc ft__soc--yt" aria-label="YouTube" target="_blank" rel="noopener noreferrer"><FaYoutube /></a>
                        <a href={SOCIAL_LINKS.FACEBOOK} className="ft__soc ft__soc--fb" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><FaFacebookF /></a>
                        <a href={`https://wa.me/${CONTACT.PHONE_RAW}`} className="ft__soc ft__soc--wa" aria-label="WhatsApp" target="_blank" rel="noopener noreferrer"><FaWhatsapp /></a>
                    </div>
                </div>

                {/* ── LEGAL BAR ── */}
                <div className="ft__legal-bar">
                    <span className="ft__legal-copy">&copy; {new Date().getFullYear()} SKF Karate</span>
                    <div className="ft__legal-links">
                        <Link href="/privacy-policy">Privacy</Link>
                        <Link href="/cookie-policy">Cookies</Link>
                        <Link href="/terms-of-service">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
