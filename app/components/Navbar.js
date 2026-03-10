'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaBars, FaTimes, FaChevronDown } from 'react-icons/fa'
import './Navbar.css'

const navStructure = [
    { label: 'Home', href: '/' },
    {
        label: 'About',
        children: [
            { label: 'Our Legacy', href: '/about' },
            { label: 'Our Senseis', href: '/senseis' },
            { label: 'Dojo Directory', href: '/dojos' },
        ],
    },
    {
        label: 'Training',
        children: [
            { label: 'Kyu & Dan System', href: '/grading' },
            { label: 'Summer Camp 2026', href: '/summer-camp' },
            { label: 'Rules & Documents', href: '/documents' },
        ],
    },
    {
        label: 'Community',
        children: [
            { label: 'Events & Calendar', href: '/events' },
            { label: 'News & Updates', href: '/news' },
            { label: 'Gallery', href: '/gallery' },
            { label: 'Honours Board', href: '/honours' },
        ],
    },
    { label: 'Contact', href: '/contact' },
]

function DropdownItem({ item, pathname, onNavigate }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const isChildActive = item.children?.some((c) => pathname === c.href)

    useEffect(() => {
        const close = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', close)
        return () => document.removeEventListener('mousedown', close)
    }, [])

    if (!item.children) {
        return (
            <Link
                href={item.href}
                className={`nav__link ${pathname === item.href ? 'nav__link--active' : ''}`}
                onClick={onNavigate}
            >
                {item.label}
            </Link>
        )
    }

    return (
        <div className={`nav__dropdown ${open ? 'nav__dropdown--open' : ''}`} ref={ref}>
            <button
                className={`nav__link nav__dropdown-trigger ${isChildActive ? 'nav__link--active' : ''}`}
                onClick={() => setOpen(!open)}
            >
                {item.label} <FaChevronDown className="nav__chevron" />
            </button>
            <div className="nav__dropdown-menu">
                {item.children.map((child) => (
                    <Link
                        key={child.href}
                        href={child.href}
                        className={`nav__dropdown-link ${pathname === child.href ? 'nav__dropdown-link--active' : ''}`}
                        onClick={() => { setOpen(false); onNavigate?.() }}
                    >
                        {child.label}
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [mobileDropdown, setMobileDropdown] = useState(null)
    const pathname = usePathname()

    useEffect(() => { setMenuOpen(false); setMobileDropdown(null) }, [pathname])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        document.body.style.overflow = menuOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [menuOpen])

    return (
        <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
            <div className="container nav__inner">
                <Link href="/" className="nav__brand">
                    <img src="/logo/SKF logo.png" alt="SKF Karate" className="nav__brand-logo" />
                    <span className="nav__brand-name">SKF</span>
                    <span className="nav__brand-accent">KARATE</span>
                </Link>

                {/* Desktop nav */}
                <nav className="nav__links nav__links--desktop">
                    {navStructure.map((item) => (
                        <DropdownItem key={item.label} item={item} pathname={pathname} />
                    ))}
                </nav>

                {/* Mobile overlay */}
                <nav className={`nav__links nav__links--mobile ${menuOpen ? 'nav__links--open' : ''}`}>
                    {navStructure.map((item) =>
                        item.children ? (
                            <div key={item.label} className="nav__mobile-group">
                                <button
                                    className={`nav__link nav__mobile-trigger ${item.children.some((c) => pathname === c.href) ? 'nav__link--active' : ''
                                        }`}
                                    onClick={() => setMobileDropdown(mobileDropdown === item.label ? null : item.label)}
                                >
                                    {item.label}
                                    <FaChevronDown className={`nav__chevron ${mobileDropdown === item.label ? 'nav__chevron--open' : ''}`} />
                                </button>
                                {mobileDropdown === item.label && (
                                    <div className="nav__mobile-sub">
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className={`nav__mobile-sub-link ${pathname === child.href ? 'nav__dropdown-link--active' : ''}`}
                                                onClick={() => setMenuOpen(false)}
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`nav__link ${pathname === item.href ? 'nav__link--active' : ''}`}
                                onClick={() => setMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        )
                    )}
                    <Link href="/contact" className="btn btn-primary nav__cta-mobile" onClick={() => setMenuOpen(false)}>
                        Enroll Now
                    </Link>
                </nav>

                <div className="nav__right">
                    <Link href="/summer-camp" className="btn btn-primary nav__cta">Summer Camp 2026</Link>
                    <button className="nav__toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
                        {menuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </div>
        </header>
    )
}
