'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { FaBars, FaTimes, FaSearch, FaChartLine, FaShoppingCart, FaCalendarAlt } from 'react-icons/fa'
import { useCart } from '@/lib/shop/cartState'
import { useTrialModal } from './TrialModalContext'

/* ── WKF-style drawer menu structure ── */
interface MenuItem {
    label: string
    href?: string
    children?: MenuItem[]
}

const menuItems: MenuItem[] = [
    {
        label: 'Events',
        children: [
            { label: 'Upcoming Events', href: '/events' },
            { label: 'Results', href: '/results' },
        ],
    },
    {
        label: 'Rankings & Honours',
        children: [
            { label: 'Official Rankings', href: '/rankings' },
            { label: 'Honours Board', href: '/honours' },
        ],
    },
    {
        label: 'Classes',
        children: [
            { label: 'Find a Class', href: '/classes' },
            { label: 'Summer Camp 2026', href: '/summer-camp' },
        ],
    },
    { label: 'Gallery', href: '/gallery' },
    {
        label: 'About',
        children: [
            { label: 'About SKF', href: '/about' },
            { label: 'Contact & FAQ', href: '/contact' },
            { label: 'News', href: '/news' },
        ],
    },
    { label: 'Shop', href: '/shop' },
    {
        label: 'Athlete Zone',
        children: [
            { label: 'Athlete Portal', href: '/portal' },
            { label: 'Belt Grading', href: '/grading' },
            { label: 'Search Athletes', href: '/athlete/search' },
            { label: 'Verify Certificate', href: '/verify' },
        ],
    },
]

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())
    const pathname = usePathname()
    const { cartTotalCount } = useCart()
    const { openModal } = useTrialModal()

    // Close drawer on route change
    useEffect(() => { setDrawerOpen(false); setExpandedMenus(new Set()) }, [pathname])

    // Scroll detection
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // Lock body scroll when drawer is open
    useEffect(() => {
        document.body.style.overflow = drawerOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [drawerOpen])

    const toggleSubmenu = (label: string) => {
        setExpandedMenus(prev => {
            const next = new Set(prev)
            if (next.has(label)) {
                next.delete(label)
            } else {
                next.add(label)
            }
            return next
        })
    }

    return (
        <>
            <header className={`nav ${scrolled ? 'nav--scrolled' : ''}`}>
                <div className="container nav__inner">
                    {/* ── Brand ── */}
                    <Link href="/" className="nav__brand">
                        <div className="nav__brand-stack">
                            <Image src="/logo/SKF logo.png" alt="SKF Karate" width={42} height={42} className="nav__brand-logo" />
                            <span className="nav__brand-text">
                                <span className="nav__brand-name">SKF</span>
                                <span className="nav__brand-accent">KARATE</span>
                            </span>
                        </div>
                    </Link>

                    {/* ── Desktop: Main text links ── */}
                    <nav className="nav__center">
                        <Link
                            href="/classes"
                            className={`nav__link ${pathname?.startsWith('/classes') ? 'nav__link--active' : ''}`}
                        >
                            Classes
                        </Link>
                        <Link
                            href="/about"
                            className={`nav__link ${pathname?.startsWith('/about') ? 'nav__link--active' : ''}`}
                        >
                            About
                        </Link>
                    </nav>

                    {/* ── Right side ── */}
                    <div className="nav__right">
                        <button onClick={() => openModal()} className="btn btn-primary nav__cta">
                            Book Free Trial
                        </button>

                        {cartTotalCount > 0 && (
                            <Link href="/shop/cart" className="nav__icon" aria-label="Cart">
                                <FaShoppingCart />
                                <span className="nav__icon-badge">{cartTotalCount}</span>
                            </Link>
                        )}

                        <Link href="/events" className={`nav__icon ${pathname?.startsWith('/events') || pathname?.startsWith('/results') ? 'nav__icon--active' : ''}`} aria-label="Events" title="Events">
                            <FaCalendarAlt />
                        </Link>
                        <Link href="/rankings" className={`nav__icon ${pathname?.startsWith('/rankings') ? 'nav__icon--active' : ''}`} aria-label="Rankings" title="Rankings">
                            <FaChartLine />
                        </Link>
                        <Link href="/athlete" className={`nav__icon ${pathname?.startsWith('/athlete') ? 'nav__icon--active' : ''}`} aria-label="Search" title="Search Athletes">
                            <FaSearch />
                        </Link>

                        <button
                            className="nav__hamburger"
                            onClick={() => setDrawerOpen(!drawerOpen)}
                            aria-label="Menu"
                            aria-expanded={drawerOpen}
                        >
                            {drawerOpen ? <FaTimes /> : <FaBars />}
                        </button>
                    </div>
                </div>
            </header>

            {/* ── Drawer overlay ── */}
            <div
                className={`drawer-overlay ${drawerOpen ? 'drawer-overlay--open' : ''}`}
                onClick={() => setDrawerOpen(false)}
                aria-hidden="true"
            />

            {/* ── WKF-style right-side drawer ── */}
            <aside className={`drawer ${drawerOpen ? 'drawer--open' : ''}`} aria-label="Navigation menu">
                <div className="drawer__header">
                    <button
                        className="drawer__close"
                        onClick={() => setDrawerOpen(false)}
                        aria-label="Close menu"
                    >
                        <FaTimes />
                    </button>
                </div>

                <nav className="drawer__nav">
                    {menuItems.map((item) => (
                        <div key={item.label} className="wkf-menu-item">
                            {item.children ? (
                                <>
                                    <button
                                        className={`wkf-menu-link ${expandedMenus.has(item.label) ? 'wkf-menu-link--expanded' : ''}`}
                                        onClick={() => toggleSubmenu(item.label)}
                                    >
                                        <span>{item.label}</span>
                                        <span className="wkf-menu-arrow">▸</span>
                                    </button>
                                    <div className={`wkf-submenu ${expandedMenus.has(item.label) ? 'wkf-submenu--open' : ''}`}>
                                        <div>
                                            {item.children.map(child => (
                                                <Link
                                                    key={child.href}
                                                    href={child.href!}
                                                    className={`wkf-submenu-link ${pathname === child.href ? 'wkf-submenu-link--active' : ''}`}
                                                    onClick={() => setDrawerOpen(false)}
                                                >
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <Link
                                    href={item.href!}
                                    className={`wkf-menu-link ${pathname === item.href || pathname?.startsWith(item.href + '/') ? 'wkf-menu-link--active' : ''}`}
                                    onClick={() => setDrawerOpen(false)}
                                >
                                    <span>{item.label}</span>
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="drawer__footer">
                    <div className="drawer__socials">
                        <a href="https://www.facebook.com/skfkarate" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        </a>
                        <a href="https://www.instagram.com/skfkarate" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                        </a>
                        <a href="https://www.youtube.com/@skfkarate" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                        </a>
                        <a href="https://wa.me/919019971726" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                        </a>
                    </div>

                    <button
                        className="btn btn-primary drawer__cta"
                        onClick={() => { setDrawerOpen(false); openModal() }}
                    >
                        Book Free Trial
                    </button>
                </div>
            </aside>

            {/* ── Mobile sticky CTA bar ── */}
            <div className="mobile-sticky-cta">
                <button onClick={() => openModal()} className="btn btn-primary mobile-sticky-cta__btn">
                    Book Free Trial
                </button>
            </div>
        </>
    )
}
