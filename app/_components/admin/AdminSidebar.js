'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  SquareTerminal, Users, Trophy, Settings, LogOut, Code, FileDigit, ShieldAlert, Cpu, Circle
} from "lucide-react"

export default function AdminSidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    const { signOut } = await import('next-auth/react')
    await signOut({ callbackUrl: '/admin/login' })
  }

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard" },
    { label: "Students", href: "/admin/students" },
    { label: "Programs", href: "/admin/programs" },
    { label: "Enrollments", href: "/admin/enrollments" },
    { label: "Results", href: "/admin/results" },
    { label: "Settings", href: "/admin/settings" }
  ]

  return (
    <div style={{
      width: '220px',
      height: '100vh',
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
      </div>

      {/* Navigation Menu */}
      <div style={{ flex: 1, padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          
          return (
            <Link
              key={item.label}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                color: isActive ? '#fff' : '#666',
                textDecoration: 'none',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                fontSize: '0.9rem',
                fontWeight: isActive ? 600 : 400,
                letterSpacing: '0.02em',
                transition: 'color 0.2s',
                position: 'relative'
              }}
              onMouseOver={(e) => {
                if (!isActive) e.currentTarget.style.color = '#ccc'
              }}
              onMouseOut={(e) => {
                if (!isActive) e.currentTarget.style.color = '#666'
              }}
            >
              {isActive && (
                <span style={{ 
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: '4px', height: '4px', background: '#fff', borderRadius: '50%'
                }} />
              )}
              <span style={{ marginLeft: isActive ? '0.75rem' : '0' }}>
                {item.label}
              </span>
            </Link>
          )
        })}
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
