'use client'

import { useState, useEffect } from 'react'
import { Check, X, RefreshCw, Database, CreditCard, Mail, FileSpreadsheet } from 'lucide-react'

export default function AdminSettingsPage() {
  const [status, setStatus] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkStatus()
  }, [])

  async function checkStatus() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/settings/status')
      const data = await res.json()
      setStatus(data)
    } catch (e) {
      setStatus({ error: true })
    } finally {
      setLoading(false)
    }
  }

  const services = [
    { 
      name: 'Supabase Database', 
      key: 'supabase',
      icon: Database,
      description: 'Primary athlete and hash records.',
      envVars: ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    },
    { 
      name: 'Google Sheets Mirror', 
      key: 'sheets',
      icon: FileSpreadsheet,
      description: 'Secondary operational ledgers.',
      envVars: ['GOOGLE_SERVICE_ACCOUNT_EMAIL', 'GOOGLE_PRIVATE_KEY', 'GOOGLE_SHEET_ID']
    },
    { 
      name: 'Razorpay Gateway', 
      key: 'razorpay',
      icon: CreditCard,
      description: 'Online fee gateway.',
      envVars: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET']
    },
    { 
      name: 'Resend Email API', 
      key: 'resend',
      icon: Mail,
      description: 'Broadcast and transactional comms.',
      envVars: ['RESEND_API_KEY']
    },
  ]

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000',
      color: '#fff',
      paddingBottom: '4rem',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      
      {/* Header */}
      <div style={{ 
        borderBottom: '1px solid #111', 
        padding: '2rem 2.5rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-end',
        marginBottom: '2rem'
      }}>
        <div>
          <p style={{ color: '#666', fontSize: '0.8rem', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '1rem', textTransform: 'uppercase' }}>
            Configuration
          </p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 400, margin: 0, letterSpacing: '-0.03em' }}>
            System Environment
          </h1>
        </div>
        <button
          onClick={checkStatus}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#111',
            color: '#fff',
            border: '1px solid #333',
            cursor: loading ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, fontSize: '0.9rem',
            borderRadius: '4px'
          }}
        >
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          {loading ? 'Pinging...' : 'Verify Connections'}
        </button>
      </div>

      <div style={{ padding: '0 2.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
          {services.map(svc => {
            const Icon = svc.icon
            const isConnected = status[svc.key] === true
            const isUnknown = status[svc.key] === undefined
            const bdColor = isConnected ? '#333' : (isUnknown ? '#222' : '#ff003c')
            
            return (
              <div key={svc.key} style={{
                background: '#050505',
                border: `1px solid ${bdColor}`,
                padding: '2rem', display: 'flex', alignItems: 'flex-start', gap: '1.5rem',
                borderRadius: '4px'
              }}>
                <div style={{
                  width: 48, height: 48,
                  background: '#111',
                  border: `1px solid ${bdColor}`,
                  borderRadius: '4px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Icon size={20} color={isConnected ? '#fff' : '#666'} />
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 500, color: '#fff', fontSize: '1.1rem', letterSpacing: '-0.01em' }}>{svc.name}</span>
                    {loading ? (
                      <span style={{ fontSize: '0.7rem', color: '#666', fontFamily: 'monospace' }}>PINGING</span>
                    ) : isConnected ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', fontWeight: 600, color: '#fff', background: '#111', border: '1px solid #333', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                        <Check size={12} /> OK
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', fontWeight: 600, color: '#fff', background: '#300', border: '1px solid #ff003c', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                        <X size={12} /> FAIL
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#888', margin: 0, marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    {svc.description}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {svc.envVars.map(v => (
                      <code key={v} style={{
                        fontSize: '0.7rem', padding: '0.3rem 0.6rem', background: '#000',
                        border: '1px solid #222', color: '#888', borderRadius: '4px'
                      }}>
                        {v}
                      </code>
                    ))}
                  </div>
                </div>
                
              </div>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
