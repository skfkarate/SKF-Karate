'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut } from "lucide-react"
import { ADMIN_NAV_GROUPS } from '@/data/constants/navigation'

export default function AdminSidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    const { signOut } = await import('next-auth/react')
    await signOut({ callbackUrl: '/admin/login' })
  }

  return (
    <div style={{
      width: '280px',
      height: '100dvh',
      background: '#050505',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      borderRight: '1px solid #111'
    }}>
      
      {/* Brand Header */}
      <div style={{ padding: '2.5rem 2rem', borderBottom: '1px solid #111' }}>
        <h2 style={{ 
          fontSize: '1rem', 
          fontWeight: 600, 
          margin: 0, 
          color: '#fff', 
          fontFamily: 'monospace',
          letterSpacing: '0.1em',
          textTransform: 'uppercase'
        }}>
          SKF_ADMIN
        </h2>
        <p style={{ margin: '0.9rem 0 0', color: '#6f6f6f', fontSize: '0.82rem', lineHeight: 1.5 }}>
          Structured around live operations, not isolated screens.
        </p>
      </div>

      {/* Navigation Menu */}
      <div style={{ flex: 1, padding: '1.5rem 1rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div
              style={{
                padding: '0 1rem 0.5rem',
                color: '#6a6a6a',
                fontSize: '0.72rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
              }}
            >
              {group.label}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    style={{
                      display: 'block',
                      padding: '0.85rem 1rem',
                      color: isActive ? '#fff' : '#8a8a8a',
                      textDecoration: 'none',
                      fontFamily: 'system-ui, -apple-system, sans-serif',
                      border: `1px solid ${isActive ? '#2a2a2a' : 'transparent'}`,
                      borderRadius: '12px',
                      background: isActive ? '#0d0d0d' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = '#090909'
                        e.currentTarget.style.borderColor = '#171717'
                        e.currentTarget.style.color = '#f4f4f4'
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.borderColor = 'transparent'
                        e.currentTarget.style.color = '#8a8a8a'
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.93rem', fontWeight: isActive ? 600 : 500, letterSpacing: '0.01em' }}>
                        {item.label}
                      </span>
                      {isActive ? (
                        <span style={{ width: '6px', height: '6px', borderRadius: '999px', background: '#fff', flexShrink: 0 }} />
                      ) : null}
                    </div>
                    {item.description ? (
                      <div style={{ marginTop: '0.3rem', fontSize: '0.76rem', color: isActive ? '#8d8d8d' : '#666', lineHeight: 1.45 }}>
                        {item.description}
                      </div>
                    ) : null}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer / User Area */}
      <div style={{ padding: '2rem', borderTop: '1px solid #111' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            width: '100%',
            padding: '0',
            background: 'transparent',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '0.9rem',
            textAlign: 'left',
            transition: 'color 0.2s'
          }}
          onMouseOver={e => e.currentTarget.style.color = '#fff'}
          onMouseOut={e => e.currentTarget.style.color = '#666'}
        >
          <LogOut size={16} />
          End Session
        </button>
      </div>
    </div>
  )
}
