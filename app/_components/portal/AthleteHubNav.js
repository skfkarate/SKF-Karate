'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { UserCircle, PlayCircle, Award, CreditCard, LogOut, ChevronRight, Menu, Calendar, Bell, TrendingUp, Flag, Trophy } from 'lucide-react'
import Image from 'next/image'

const navLinks = [
  { href: '/portal/dashboard', label: 'Identity', icon: UserCircle },
  { href: '/portal/grading', label: 'Grading', icon: TrendingUp },
  { href: '/portal/trophy-room', label: 'Trophy Room', icon: Trophy },
  { href: '/portal/events', label: 'Events', icon: Flag },
  { href: '/portal/videos', label: 'Home Practice', icon: PlayCircle },
  { href: '/portal/fees', label: 'Treasury', icon: CreditCard },
  { href: '/portal/timetable', label: 'Timetable', icon: Calendar },
  { href: '/portal/notices', label: 'Notices', icon: Bell },
]

export default function AthleteHubNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
        animate={{ width: isHovered ? 240 : 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="kuroobi-dock__brand">
          <Image
            src="/logo/SKF logo.png"
            alt="SKF"
            width={38}
            height={38}
            className="kuroobi-dock__logo"
          />
          <AnimatePresence>
            {isHovered && (
              <motion.div 
                className="kuroobi-dock__brand-text"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                SKF INITIATE
              </motion.div>
            )}
          </AnimatePresence>
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
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                  {isActive && <motion.div layoutId="activeDot" className="kuroobi-dock__active-dot" />}
                </div>
                
                <AnimatePresence>
                  {isHovered && (
                    <motion.span 
                      className="kuroobi-dock__link-label"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10, transition: { duration: 0.1 } }}
                      transition={{ duration: 0.2, delay: 0.05 }}
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
          <button onClick={handleLogout} className="kuroobi-dock__logout" title="Exit">
            <LogOut size={20} strokeWidth={1.5} />
            <AnimatePresence>
              {isHovered && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  Exit Dojo
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.nav>

      {/* ── MOBILE: FLOATING BOTTOM DOCK ── */}
      <nav className="kuroobi-dock-mobile">
        {navLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href

          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`kuroobi-mobile-link ${isActive ? 'active' : ''}`}
            >
              <motion.div 
                className="kuroobi-mobile-link__icon"
                animate={{ y: isActive ? -4 : 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              </motion.div>
              {isActive && (
                <motion.span layoutId="mobileActiveLabel" className="kuroobi-mobile-link__label">
                  {link.label}
                </motion.span>
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
