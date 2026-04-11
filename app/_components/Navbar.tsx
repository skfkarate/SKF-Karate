'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { FaBars, FaTimes, FaChevronDown, FaShoppingCart } from 'react-icons/fa'
import { useCart } from '@/lib/shop/cartState'

interface NavChild {
    label: string
    href: string
    disabled?: boolean
}

interface NavItem {
    label: string
    href?: string
    disabled?: boolean
    children?: NavChild[]
}

const navStructure: NavItem[] = [
    {
        label: 'About SKF',
        children: [
            { label: 'Our Legacy', href: '/about' },
            { label: 'Our Senseis', href: '/senseis' },
            { label: 'Our Dojos', href: '/dojos' },
        ],
    },
    {
        label: 'Training',
        children: [
            { label: 'Belt Grading', href: '/grading' },
            { label: 'Summer Camp 2026', href: '/summer-camp' },
        ],
    },
    {
        label: 'Events',
        children: [
            { label: 'Events & Calendar', href: '/events' },
            { label: 'Results & History', href: '/results' },
            { label: 'Gallery', href: '/gallery' },
        ],
    },
    {
        label: 'Athletes',
        children: [
            { label: 'Athlete Profile', href: '/athlete' },
            { label: 'Verify Certificate', href: '/verify' },
            { label: 'Honours Board', href: '/honours' },
        ],
    },
    { label: 'Rankings', href: '/rankings' },
    { label: 'Contact', href: '/contact' },
]

function DropdownItem({ item, pathname, onNavigate }: { item: NavItem; pathname: string | null; onNavigate?: () => void }) {
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
    const isChildActive = item.children?.some((c) => pathname === c.href)

    useEffect(() => {
        const close = (e: any) => { if (ref.current && !(ref.current as any).contains(e.target)) setOpen(false) }
        document.addEventListener('mousedown', close)
        return () => document.removeEventListener('mousedown', close)
    }, [])

    if (!item.children) {
        if (item.disabled) {
            return (
                <Link
                    href="/coming-soon"
                    className="nav__link nav__link--disabled"
                    title="Coming Soon"
                    onClick={onNavigate}
                >
                    {item.label}
                </Link>
            )
        }
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
                {item.children!.map((child) =>
                    child.disabled ? (
                        <Link
                            key={child.href}
                            href="/coming-soon"
                            className="nav__dropdown-link nav__dropdown-link--disabled"
                            title="Coming Soon"
                            onClick={() => { setOpen(false); onNavigate?.() }}
                        >
                            {child.label}
                            <span className="nav__coming-soon">Soon</span>
                        </Link>
                    ) : (
                        <Link
                            key={child.href}
                            href={child.href}
                            className={`nav__dropdown-link ${pathname === child.href ? 'nav__dropdown-link--active' : ''}`}
                            onClick={() => { setOpen(false); onNavigate?.() }}
                        >
                            {child.label}
                        </Link>
                    )
                )}
            </div>
        </div>
    )
}

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [mobileDropdown, setMobileDropdown] = useState<string | null>(null)
    const pathname = usePathname()
    const { cartTotalCount } = useCart()

    useEffect(() => { setMenuOpen(false); setMobileDropdown(null) }, [pathname])

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60)
        window.addEventListener('scroll', onScroll, { passive: true })
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
                    <Image src="/logo/SKF logo.png" alt="SKF Karate" width={50} height={50} className="nav__brand-logo" />
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
                                        {item.children.map((child) =>
                                            child.disabled ? (
                                                <Link
                                                    key={child.href}
                                                    href="/coming-soon"
                                                    className="nav__mobile-sub-link nav__mobile-sub-link--disabled"
                                                    onClick={() => setMenuOpen(false)}
                                                >
                                                    {child.label}
                                                    <span className="nav__coming-soon">Soon</span>
                                                </Link>
                                            ) : (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    className={`nav__mobile-sub-link ${pathname === child.href ? 'nav__dropdown-link--active' : ''}`}
                                                    onClick={() => setMenuOpen(false)}
                                                >
                                                    {child.label}
                                                </Link>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : item.disabled ? (
                            <Link
                                key={item.label}
                                href="/coming-soon"
                                className="nav__link nav__link--disabled"
                                onClick={() => setMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
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
                    <Link href="/summer-camp" className="btn btn-primary nav__cta-mobile" onClick={() => setMenuOpen(false)}>
                        Summer Camp 2026
                    </Link>
                </nav>

                <div className="nav__right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/shop/cart" style={{ position: 'relative', color: '#fff', fontSize: '1.2rem', display: 'flex', alignItems: 'center' }} aria-label="Cart">
                        <FaShoppingCart />
                        {cartTotalCount > 0 && (
                            <span style={{ position: 'absolute', top: '-8px', right: '-12px', background: '#dc3545', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '50px', fontWeight: 'bold' }}>
                                {cartTotalCount}
                            </span>
                        )}
                    </Link>
                    <Link href="/summer-camp" className="btn btn-primary nav__cta">Summer Camp 2026</Link>
                    <button className="nav__toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
                        {menuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </div>
        </header>
    )
}
