'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

export default function CertificateSearchPage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch(e) {
    if (e) e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setError('')
    
    try {
      // Name search - fetch from API
      const res = await fetch(`/api/certificates/search?id=${encodeURIComponent(query.trim())}`)
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Certificate not found.')
        } else {
          throw new Error('Search failed')
        }
      }
      
      const data = await res.json()
      if (data.skfId && data.enrollmentId) {
        router.push(`/verify/${data.skfId}/${data.enrollmentId}`)
      } else {
        throw new Error('Invalid certificate data')
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Could not complete search. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="search-page" style={{ minHeight: '100vh', padding: '8rem 1rem 6rem', background: '#05080f', color: '#fff' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3rem)', textTransform: 'uppercase', marginBottom: '1rem', background: 'linear-gradient(90deg, #fff 0%, #ffb703 100%)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
            Verify Certificate
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>
            Enter your Certificate Number to digitally verify and view your authentic SKF Karate award.
          </p>
        </div>

        <form onSubmit={handleSearch} style={{ position: 'relative', marginBottom: '3rem' }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.03)', 
            border: '1px solid rgba(255,183,3,0.3)', 
            borderRadius: 16, 
            padding: '0.5rem',
            display: 'flex',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            transition: 'border-color 0.3s'
          }}>
            <Search size={24} style={{ margin: 'auto 1rem', color: 'rgba(255,183,3,0.8)' }} />
            <input 
              type="text" 
              placeholder="e.g. ach_2_1, CERT-9021..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '1.1rem',
                padding: '1rem 0',
                outline: 'none',
                fontFamily: 'var(--font-body)'
              }}
            />
            <button 
              type="submit" 
              disabled={isLoading || !query.trim()}
              style={{
                background: 'linear-gradient(135deg, #d62828 0%, #c0392b 100%)',
                color: '#fff',
                border: 'none',
                padding: '0 2rem',
                borderRadius: 12,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: 1,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading || !query.trim() ? 0.7 : 1,
                transition: 'all 0.3s'
              }}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
          </div>
        </form>

        {error && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 20, border: '1px dashed rgba(239, 68, 68, 0.2)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.8 }}>❌</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#ef4444' }}>{error}</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Please ensure the certificate number is typed exactly as it appears on the printed copy.</p>
          </div>
        )}
      </div>
    </div>
  )
}
