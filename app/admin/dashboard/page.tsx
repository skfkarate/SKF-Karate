'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activePrograms: 0,
    pendingCerts: 0,
    revenue: 0 
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        const studRes = await fetch('/api/admin/students')
        const studData = await studRes.json()

        const progRes = await fetch('/api/admin/programs')
        const progData = await progRes.json()

        const enrRes = await fetch('/api/admin/enrollments')
        const enrData = await enrRes.json()

        setStats({
          totalStudents: studData.students?.length || 0,
          activePrograms: progData.programs?.length || 0,
          pendingCerts: enrData.enrollments?.filter(e => e.status !== 'completed').length || 0,
          revenue: 145000 // Placeholder
        })
      } catch (e) {
        console.error('Dashboard load error:', e)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  const statCards = [
    { label: 'Total Athletes', value: stats.totalStudents },
    { label: 'Active Programs', value: stats.activePrograms },
    { label: 'Pending Clearances', value: stats.pendingCerts },
    { label: 'Revenue (INR)', value: stats.revenue.toLocaleString() },
  ]

  const quickLinks = [
    { title: 'Student Database', href: '/admin/students' },
    { title: 'Certificate Approvals', href: '/admin/enrollments' },
    { title: 'Tournament Results', href: '/admin/results' },
    { title: 'System Configuration', href: '/admin/settings' },
  ]

  return (
    <div style={{ 
      padding: '2rem', 
      minHeight: '100vh', 
      background: '#000',
      color: '#fff',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Header */}
      <div style={{ marginBottom: '3rem' }}>
        <p style={{ 
          fontSize: '0.8rem', 
          color: '#666', 
          fontFamily: 'monospace', 
          textTransform: 'uppercase', 
          letterSpacing: '0.1em',
          marginBottom: '1rem' 
        }}>
          Overview
        </p>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: 400, 
          margin: 0, 
          color: '#fff', 
          letterSpacing: '-0.03em' 
        }}>
          System Dashboard
        </h1>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
        {statCards.map((card) => (
          <div key={card.label} style={{
            padding: '2rem',
            border: '1px solid #111',
            background: '#050505',
          }}>
            <p style={{ 
              fontSize: '0.75rem', 
              color: '#666', 
              fontFamily: 'monospace', 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em', 
              margin: '0 0 1rem 0' 
            }}>
              {card.label}
            </p>
            <p style={{ 
              fontSize: '2.5rem', 
              fontWeight: 300, 
              color: '#fff', 
              margin: 0, 
              letterSpacing: '-0.05em' 
            }}>
              {loading ? '—' : card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 400, 
          color: '#fff', 
          marginBottom: '2rem',
          letterSpacing: '-0.02em',
          borderBottom: '1px solid #111',
          paddingBottom: '1rem'
        }}>
          Quick Access
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {quickLinks.map((item, i) => (
            <Link
              key={item.title}
              href={item.href}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem 0',
                borderBottom: '1px solid #111',
                color: '#fff',
                textDecoration: 'none',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#888'
                e.currentTarget.querySelector('svg').style.transform = 'translate(4px, -4px)'
                e.currentTarget.querySelector('svg').style.opacity = '1'
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#fff'
                e.currentTarget.querySelector('svg').style.transform = 'translate(0, 0)'
                e.currentTarget.querySelector('svg').style.opacity = '0.5'
              }}
            >
              <h3 style={{ 
                fontSize: '1.1rem', 
                fontWeight: 400, 
                margin: 0,
                letterSpacing: '-0.01em'
              }}>
                {item.title}
              </h3>
              <ArrowUpRight size={20} color="#fff" style={{ opacity: 0.5, transition: 'all 0.2s ease-out' }} />
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
