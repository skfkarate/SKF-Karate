'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { UserCircle, PlayCircle, Award, CreditCard, LogOut, Calendar, Bell, TrendingUp, Flag, Trophy, Map } from 'lucide-react'
import Image from 'next/image'
import { PORTAL_NAV_ITEMS } from '@/data/constants/navigation'

/** Map icon names (from data) → Lucide components (JSX) */
const ICON_COMPONENTS = { UserCircle, PlayCircle, Award, CreditCard, Calendar, Bell, TrendingUp, Flag, Trophy, Map } as const

const navLinks = PORTAL_NAV_ITEMS.map(item => ({
  ...item,
  icon: ICON_COMPONENTS[item.iconName as keyof typeof ICON_COMPONENTS] || UserCircle,
}))

export default function AthleteHubNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isHovered, setIsHovered] = React.useState(false)

  // Explicitly hide the entire nav layout when on the portal login page
  if (pathname === '/portal/login') return null;

  async function handleLogout() {
    await fetch('/api/auth/portal/logout', { method: 'POST' })
    router.push('/portal/login')
  }

  return (
    <>
      {/* ── DESKTOP: FLOATING GLASS DOCK ── */}
      <motion.nav 
        className="kuroobi-dock-desktop"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={{ width: isHovered ? 240 : 72 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="kuroobi-dock__brand">
          <Image
            src="/logo/SKF logo.png"
            alt="SKF"
            width={36}
            height={36}
            className="kuroobi-dock__logo"
          />
        </div>

        <div className="kuroobi-dock__links">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href

            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`kuroobi-dock__link ${isActive ? 'active' : ''}`}
                title={!isHovered ? link.label : ''}
              >
                <div className="kuroobi-dock__icon-wrapper">
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                  {isActive && <motion.div layoutId="activeDot" className="kuroobi-dock__active-dot" />}
                </div>
                
                <AnimatePresence>
                  {isHovered && (
                    <motion.span 
                      className="kuroobi-dock__link-label"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
                      transition={{ duration: 0.15, delay: 0.05 }}
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </div>

        <div className="kuroobi-dock__footer">
          <button onClick={handleLogout} className="kuroobi-dock__logout" title="Sign Out">
            <LogOut size={18} strokeWidth={1.5} />
            <AnimatePresence>
              {isHovered && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.nav>

      {/* ── MOBILE: CLEAN BOTTOM BAR — icons only, no labels ── */}
      <nav className="kuroobi-dock-mobile">
        {navLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`kuroobi-mobile-link ${isActive ? 'active' : ''}`}
              aria-label={link.label}
            >
              <div className="kuroobi-mobile-link__icon">
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              </div>
            </Link>
          )
        })}
      </nav>
    </>
  )
}
