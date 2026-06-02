'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { UserCircle, PlayCircle, Award, CreditCard, LogOut, Calendar, Bell, TrendingUp, Flag, Trophy, Map, X, Menu, ChevronLeft, Loader2, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { PORTAL_NAV_ITEMS } from '@/data/constants/navigation'

/** Map icon names (from data) → Lucide components (JSX) */
const ICON_COMPONENTS = { UserCircle, PlayCircle, Award, CreditCard, Calendar, Bell, TrendingUp, Flag, Trophy, Map } as const

const navLinks = PORTAL_NAV_ITEMS.map(item => ({
  ...item,
  icon: ICON_COMPONENTS[item.iconName as keyof typeof ICON_COMPONENTS] || UserCircle,
}))

/* ── Scroll Direction Hook ── */
function useScrollDirection() {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    let idleTimer: ReturnType<typeof setTimeout>
    let rafId = 0
    let hiddenSnapshot = false

    const setHiddenIfChanged = (nextHidden: boolean) => {
      if (hiddenSnapshot === nextHidden) return
      hiddenSnapshot = nextHidden
      setHidden(nextHidden)
    }

    const syncScroll = () => {
      rafId = 0
      const currentY = window.scrollY
      const delta = currentY - lastY

      if (delta > 8 && currentY > 80) {
        setHiddenIfChanged(true)       // scrolling down -> hide
      } else if (delta < -4) {
        setHiddenIfChanged(false)      // scrolling up -> show
      }

      lastY = currentY

      // Show again after 1.2s idle
      clearTimeout(idleTimer)
      idleTimer = setTimeout(() => setHiddenIfChanged(false), 1200)
    }

    const onScroll = () => {
      if (rafId) return
      rafId = window.requestAnimationFrame(syncScroll)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
      clearTimeout(idleTimer)
    }
  }, [])

  return hidden
}

type AthleteHubNavProps = {
  isBlackBeltCandidate?: boolean
  currentSession?: PortalSessionView | null
  currentAthlete?: PortalAthleteView | null
}

type PortalSessionView = {
  skfId?: string | null
  name?: string | null
  parentPhone?: string | null
}

type PortalAthleteView = {
  photoUrl?: string | null
}

type PortalSiblingView = {
  skfId: string
  name?: string | null
  firstName?: string | null
  photoUrl?: string | null
}

function PortalAvatar({
  photoUrl,
  alt,
}: {
  photoUrl?: string | null
  alt: string
}) {
  const [loaded, setLoaded] = useState(false)

  if (photoUrl) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: '50%' }}>
        {!loaded && (
          <div 
            style={{ 
              position: 'absolute', inset: 0, 
              background: 'rgba(255, 255, 255, 0.15)', 
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' 
            }} 
          />
        )}
        <Image
          src={photoUrl}
          alt={alt}
          fill
          sizes="40px"
          priority
          style={{ 
            objectFit: 'cover', 
            opacity: loaded ? 1 : 0, 
            transition: 'opacity 0.3s ease' 
          }}
          onLoad={() => setLoaded(true)}
        />
      </div>
    )
  }

  return <UserCircle size={20} />
}

export default function AthleteHubNav({ isBlackBeltCandidate = false, currentSession, currentAthlete }: AthleteHubNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)     // Desktop dock hover
  const [menuOpen, setMenuOpen] = useState(false)  // Mobile overlay
  const scrollHidden = useScrollDirection()
  
  const [siblings, setSiblings] = useState<PortalSiblingView[]>([])
  const [isSwitching, setIsSwitching] = useState<string | null>(null)
  const [topSwitcherOpen, setTopSwitcherOpen] = useState(false)

  const [backHovered, setBackHovered] = useState(false)
  const [backHintActive, setBackHintActive] = useState(false)

  const isLoginPage = pathname === '/portal/login'
  const isBackToHome = true
  const backText = 'Home Page'

  useEffect(() => {
    const triggerHint = () => {
      setBackHintActive(true)
      setTimeout(() => {
        setBackHintActive(false)
      }, 2500)
    }

    const initialTimer = setTimeout(triggerHint, 4000)
    const interval = setInterval(triggerHint, 25000)

    return () => {
      clearTimeout(initialTimer)
      clearInterval(interval)
    }
  }, [])


  // Filter links: only show Black Belt link to assigned Black Belt candidates.
  const visibleNavLinks = useMemo(() => navLinks.filter(link => {
    if (link.href === '/portal/blackbelt') {
      return isBlackBeltCandidate
    }
    return true
  }), [isBlackBeltCandidate])

  useEffect(() => {
    setMenuOpen(false)
    setTopSwitcherOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen || isLoginPage) return

    const id = window.setTimeout(() => {
      for (const link of visibleNavLinks) {
        const isDisabled = 'disabled' in link ? link.disabled : false
        if (!isDisabled) {
          router.prefetch(link.href)
        }
      }
    }, 0)

    return () => window.clearTimeout(id)
  }, [isLoginPage, menuOpen, router, visibleNavLinks])

  useEffect(() => {
    if (isLoginPage || !currentSession?.skfId) return

    const controller = new AbortController()
    fetch('/api/auth/portal/siblings', { signal: controller.signal })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSiblings(data.data)
        }
      })
      .catch(error => {
        if (error?.name !== 'AbortError') {
          console.error(error)
        }
      })

    return () => controller.abort()
  }, [currentSession?.skfId, isLoginPage])

  async function handleSwitchProfile(skfId: string) {
    if (isSwitching) return
    setIsSwitching(skfId)
    try {
      const res = await fetch('/api/auth/portal/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetSkfId: skfId })
      })
      if (res.ok) {
        window.location.reload()
      } else {
        setIsSwitching(null)
      }
    } catch {
      setIsSwitching(null)
    }
  }

  async function handleLogout() {
    setMenuOpen(false)
    await fetch('/api/auth/portal/logout', { method: 'POST' })
    router.push('/portal/login')
  }

  function handleBack() {
    router.push('/')
  }

  function handleNavClick() {
    setMenuOpen(false)
  }

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      {/* ══════════ DESKTOP: FLOATING GLASS DOCK (unchanged) ══════════ */}
      {!isLoginPage && (
        <nav
          className={`kuroobi-dock-desktop ${isHovered ? 'is-hovered' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="kuroobi-dock__brand">
            <Image
              src="/icons/icon-192.png"
              alt="SKF"
              width={36}
              height={36}
              className="kuroobi-dock__logo"
            />
          </div>

          <div className="kuroobi-dock__links">
            {visibleNavLinks.map((link) => {
              const Icon = link.icon
              const isActive = pathname === link.href
              const isDisabled = 'disabled' in link ? link.disabled : false

              if (isDisabled) {
                return (
                  <div 
                    key={link.href} 
                    className="kuroobi-dock__link"
                    title={!isHovered ? link.label : ''}
                    style={{ opacity: 0.4, cursor: 'not-allowed' }}
                  >
                    <div className="kuroobi-dock__icon-wrapper">
                      <Icon size={20} strokeWidth={1.5} />
                    </div>
                    <span className="kuroobi-dock__link-label">{link.label}</span>
                  </div>
                )
              }

              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`kuroobi-dock__link ${isActive ? 'active' : ''}`}
                  title={!isHovered ? link.label : ''}
                >
                  <div className="kuroobi-dock__icon-wrapper">
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                    {isActive && <div className="kuroobi-dock__active-dot" />}
                  </div>
                  <span className="kuroobi-dock__link-label">{link.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="kuroobi-dock__footer">

            <button onClick={handleLogout} className="kuroobi-dock__logout" title="Sign Out">
              <LogOut size={18} strokeWidth={1.5} />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>
      )}

      {/* ══════════ BACK BUTTON (RESPONSIVE & DYNAMIC POSITIONING) ══════════ */}
      <button
        className={`kuroobi-back ${backHovered || backHintActive ? 'expanded' : ''} ${isBackToHome ? 'back-home' : ''} ${(scrollHidden && !menuOpen) ? 'back-hidden' : ''} ${isHovered && !isLoginPage ? 'dock-shifted' : ''}`}
        onClick={handleBack}
        onMouseEnter={() => setBackHovered(true)}
        onMouseLeave={() => setBackHovered(false)}
        aria-label={isLoginPage ? 'Back to website' : 'Go back'}
        style={{ display: menuOpen ? 'none' : undefined }}
      >
        <div className="kuroobi-back-inner">
          <ChevronLeft size={20} strokeWidth={2.2} className="kuroobi-back-icon" />
          <span className="kuroobi-back-text">{backText}</span>
        </div>
      </button>

      {/* ══════════ TOP RIGHT: FAMILY PROFILE SWITCHER ══════════ */}
      {!isLoginPage && currentSession && siblings.length > 0 && (
        <div className={`kuroobi-top-switcher ${scrollHidden && !menuOpen ? 'hidden' : ''}`}>
          <button 
            className="kuroobi-top-switcher-button"
            onClick={() => setTopSwitcherOpen(!topSwitcherOpen)}
            style={{ cursor: 'pointer' }}
          >
            <div className="kuroobi-top-switcher-avatar">
              <PortalAvatar
                photoUrl={currentAthlete?.photoUrl}
                alt={`${currentSession?.name || 'Active athlete'} profile photo`}
              />
            </div>
            <div className="kuroobi-top-switcher-info">
              <span className="kuroobi-top-switcher-name">{currentSession?.name || 'You'}</span>
              <span className="kuroobi-top-switcher-role">{currentSession?.skfId}</span>
            </div>
            <ChevronDown 
              size={16} 
              strokeWidth={2} 
              className="kuroobi-top-switcher-caret"
              style={{ transform: topSwitcherOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>

          {topSwitcherOpen && (
            <>
              <div
                className="kuroobi-top-switcher-overlay"
                onClick={() => setTopSwitcherOpen(false)}
                style={{ position: 'fixed', inset: 0, zIndex: -1 }}
              />
              <div className="kuroobi-dock__sibling-menu top-right-mode">
                <div className="sibling-menu-header">Family Accounts</div>
                <div className="sibling-list">
                  <div className="sibling-item active">
                    <div className="sibling-avatar">
                      <PortalAvatar
                        photoUrl={currentAthlete?.photoUrl}
                        alt={`${currentSession?.name || 'Active athlete'} profile photo`}
                      />
                    </div>
                    <div className="sibling-info">
                      <span className="sibling-name">{currentSession?.name || 'You'}</span>
                      <span className="sibling-id">{currentSession?.skfId}</span>
                    </div>
                    <div className="sibling-current-badge">Active</div>
                  </div>
                  {siblings.map(sibling => (
                    <button
                      key={sibling.skfId}
                      className="sibling-item glass-item"
                      onClick={() => {
                        handleSwitchProfile(sibling.skfId)
                      }}
                      disabled={!!isSwitching}
                    >
                      <div className="sibling-avatar">
                        <PortalAvatar
                          photoUrl={sibling.photoUrl}
                          alt={`${sibling.name || sibling.firstName || sibling.skfId} profile photo`}
                        />
                      </div>
                      <div className="sibling-info">
                        <span className="sibling-name">{sibling.name || sibling.firstName}</span>
                        <span className="sibling-id">{sibling.skfId}</span>
                      </div>
                      {isSwitching === sibling.skfId && (
                        <Loader2 size={16} className="spinner" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════ MOBILE: FAB BUTTON ══════════ */}
      {!isLoginPage && (
        <button
          className={`kuroobi-fab ${(scrollHidden && !menuOpen) ? 'fab-hidden' : ''}`}
          onClick={() => setMenuOpen(prev => !prev)}
          aria-label={menuOpen ? 'Close menu' : 'Open navigation'}
          style={{ animation: menuOpen ? 'none' : undefined }}
        >
          <span className="kuroobi-fab__icon" aria-hidden="true">
            {menuOpen ? <X size={24} strokeWidth={2.5} /> : <Menu size={24} strokeWidth={2.5} />}
          </span>
        </button>
      )}

      {/* ══════════ MOBILE: FULLSCREEN OVERLAY MENU ══════════ */}
      {!isLoginPage && (
          <div
            className={`kuroobi-overlay ${menuOpen ? 'is-open' : ''}`}
            aria-hidden={!menuOpen}
          >
            {/* Brand Header */}
            <div className="kuroobi-overlay__brand">
              <Image
                src="/icons/icon-192.png"
                alt="SKF"
                width={36}
                height={36}
                className="kuroobi-overlay__brand-logo"
              />
              <span className="kuroobi-overlay__brand-text">Athlete Quarter</span>
            </div>

            {/* Navigation Links */}
            <div className="kuroobi-overlay__links">
              {visibleNavLinks.map((link) => {
                const Icon = link.icon
                const isActive = pathname === link.href
                const isDisabled = 'disabled' in link ? link.disabled : false

                if (isDisabled) {
                  return (
                    <div
                      key={link.href}
                      className="kuroobi-overlay__link"
                      style={{ opacity: 0.4, cursor: 'not-allowed' }}
                    >
                      <div className="kuroobi-overlay__link-icon">
                        <Icon size={18} strokeWidth={1.5} />
                      </div>
                      {link.label}
                    </div>
                  )
                }

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`kuroobi-overlay__link ${isActive ? 'kuroobi-overlay__link--active' : ''}`}
                    onClick={handleNavClick}
                    tabIndex={menuOpen ? undefined : -1}
                  >
                    <div className="kuroobi-overlay__link-icon">
                      <Icon size={18} strokeWidth={isActive ? 2.5 : 1.5} />
                    </div>
                    {link.label}
                  </Link>
                )
              })}
            </div>

            {/* Divider + Switcher + Sign Out */}
            <div className="kuroobi-overlay__divider" />

            {siblings.length > 0 && (
              <div className="kuroobi-overlay__switcher">
                <div className="sibling-menu-header">Family Accounts</div>
                <div className="sibling-list">
                  <div className="sibling-item active">
                    <div className="sibling-avatar">
                      <PortalAvatar
                        photoUrl={currentAthlete?.photoUrl}
                        alt={`${currentSession?.name || 'Active athlete'} profile photo`}
                      />
                    </div>
                    <div className="sibling-info">
                      <span className="sibling-name">{currentSession?.name || 'You'}</span>
                      <span className="sibling-id">{currentSession?.skfId}</span>
                    </div>
                    <div className="sibling-current-badge">Active</div>
                  </div>
                  {siblings.map(sibling => (
                    <button 
                      key={sibling.skfId}
                      className="sibling-item"
                      onClick={() => handleSwitchProfile(sibling.skfId)}
                      disabled={!!isSwitching}
                      tabIndex={menuOpen ? undefined : -1}
                    >
                      <div className="sibling-avatar">
                        <PortalAvatar
                          photoUrl={sibling.photoUrl}
                          alt={`${sibling.name || sibling.firstName || sibling.skfId} profile photo`}
                        />
                      </div>
                      <div className="sibling-info">
                        <span className="sibling-name">{sibling.name || sibling.firstName}</span>
                        <span className="sibling-id">{sibling.skfId}</span>
                      </div>
                      {isSwitching === sibling.skfId && (
                        <Loader2 size={16} className="spinner" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              className="kuroobi-overlay__signout"
              onClick={handleLogout}
              tabIndex={menuOpen ? undefined : -1}
            >
              <LogOut size={18} strokeWidth={1.5} />
              Sign Out
            </button>
          </div>
      )}
    </>
  )
}
