import { FaInstagram, FaYoutube, FaWhatsapp, FaFacebookF } from 'react-icons/fa'
import { CONTACT, SOCIAL_LINKS } from '@/data/constants/contact'
import { flattenClassBranches } from '@/lib/classes/catalog'
import { getAllCitiesLive } from '@/lib/server/repositories/classes-live'
import PrefetchLink from '@/components/navigation/PrefetchLink'

export default async function Footer() {
    const cities = await getAllCitiesLive()
    const allBranches = flattenClassBranches(cities)

    return (
        <footer className="ft">

            {/* Watermark */}
            <div className="ft__kanji" aria-hidden="true">武</div>

            <div className="container">

                {/* ── MONUMENT: Big typographic brand statement ── */}
                <div className="ft__monument">
                    <h2 className="ft__monument-type">
                        <span className="ft__monument-skf">SKF</span>
                        <span className="ft__monument-karate">KARATE</span>
                    </h2>
                    <p className="ft__monument-motto">Nothing is Impossible</p>
                </div>

                {/* ── LINK RIVER: Compact horizontal nav ── */}
                <nav className="ft__river" aria-label="Footer navigation">
                    <PrefetchLink href="/classes" className="ft__river-link" pendingClassName="ft__pending-indicator">Classes</PrefetchLink>
                    <PrefetchLink href="/about" className="ft__river-link" pendingClassName="ft__pending-indicator">About</PrefetchLink>
                    <PrefetchLink href="/rankings" className="ft__river-link" pendingClassName="ft__pending-indicator">Rankings</PrefetchLink>
                    <PrefetchLink href="/events" className="ft__river-link" pendingClassName="ft__pending-indicator">Events</PrefetchLink>
                    <PrefetchLink href="/results" className="ft__river-link" pendingClassName="ft__pending-indicator">Results</PrefetchLink>
                    <PrefetchLink href="/gallery" className="ft__river-link" pendingClassName="ft__pending-indicator">Gallery</PrefetchLink>
                    <PrefetchLink href="/grading" className="ft__river-link" pendingClassName="ft__pending-indicator">Belt Grading</PrefetchLink>
                    <PrefetchLink href="/shop" className="ft__river-link" pendingClassName="ft__pending-indicator">Shop</PrefetchLink>
                    <PrefetchLink href="/contact" className="ft__river-link" pendingClassName="ft__pending-indicator">Contact</PrefetchLink>
                    <PrefetchLink href="/portal" className="ft__river-link ft__river-link--portal" pendingClassName="ft__pending-indicator">Athlete Portal</PrefetchLink>
                </nav>

                {/* ── DOJOS: Location chips ── */}
                <div className="ft__dojos">
                    {allBranches.map(branch => (
                        <PrefetchLink
                            key={`${branch.citySlug}-${branch.slug}`}
                            href={`/classes/${branch.citySlug}/${branch.slug}`}
                            className="ft__dojo-chip"
                            showPendingIndicator={false}
                        >
                            <span className="ft__dojo-pulse" />
                            {branch.name}
                        </PrefetchLink>
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
                    <div className="ft__legal-left">
                        <span className="ft__legal-copy">&copy; {new Date().getFullYear()} SKF Karate</span>
                        <span className="ft__legal-dot hide-on-mobile" />
                        <span className="ft__credit">
                            Designed & Engineered by <span className="ft__credit-name">Krishna C</span>
                        </span>
                    </div>
                    <div className="ft__legal-links">
                        <PrefetchLink href="/privacy-policy" pendingClassName="ft__pending-indicator">Privacy</PrefetchLink>
                        <PrefetchLink href="/cookie-policy" pendingClassName="ft__pending-indicator">Cookies</PrefetchLink>
                        <PrefetchLink href="/terms-of-service" pendingClassName="ft__pending-indicator">Terms</PrefetchLink>
                    </div>
                </div>
            </div>
        </footer>
    )
}
