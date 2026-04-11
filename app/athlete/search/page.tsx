'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function FindProfilePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState([])
  const [hasSearched, setHasSearched] = useState(false)

  async function handleSearch(e) {
    if (e) e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setError('')
    setHasSearched(true)
    
    // Check if looks like SKF ID exactly (e.g. SKF-2025-4872)
    const isSkfId = /^SKF-\d{4}-\d{4}$/i.test(query.trim()) || /^SKF\d+$/i.test(query.trim().replace(/-/g, ''))

    try {
      if (isSkfId) {
        // If it's an exact SKF ID format, jump straight to the profile
        // In reality, we might want to verify it exists first via API
        router.push(`/athlete/${query.trim().toUpperCase()}`)
        return
      }

      // Name search - fetch from API
      const res = await fetch(`/api/athletes/search?q=${encodeURIComponent(query.trim())}`)
      if (!res.ok) throw new Error('Search failed')
      
      const data = await res.json()
      setResults(data.athletes || [])
    } catch (err) {
      console.error(err)
      setError('Could not complete search. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="search-page" style={{ minHeight: '100vh', padding: '8rem 1rem 6rem', background: '#05080f', color: '#fff' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(2rem, 5vw, 3rem)', textTransform: 'uppercase', marginBottom: '1rem', background: 'linear-gradient(90deg, #fff 0%, #ffb703 100%)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
            Find Your Profile
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1.1rem' }}>
            Search by SKF ID or Full Name to view profiles, tournament results, and certificates.
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
            <input 
              type="text" 
              placeholder="e.g. SKF-2024-0042 or 'Arjun Sharma'"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '1.1rem',
                padding: '1rem 1.5rem',
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
              {isLoading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && <div style={{ color: '#ff6b6b', textAlign: 'center', marginBottom: '2rem' }}>{error}</div>}

        {hasSearched && !isLoading && results.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'rgba(255,255,255,0.02)', borderRadius: 20, border: '1px dashed rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}>🔍</div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#ffb703' }}>No Athletes Found</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>Try searching by exact SKF ID or check the spelling of the name.</p>
          </div>
        )}

        {results.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: 2, color: 'rgba(255,255,255,0.4)', marginBottom: '1rem' }}>Search Results</h3>
            {results.map((athlete) => (
              <div 
                key={athlete.registrationNumber}
                onClick={() => router.push(`/athlete/${athlete.registrationNumber}`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.5rem',
                  padding: '1.5rem',
                  background: 'rgba(10,14,25,0.6)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 20,
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseOver={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,183,3,0.3)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseOut={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#ffb703', flexShrink: 0 }}>
                  {athlete.firstName[0]}{athlete.lastName[0]}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 0.25rem', fontFamily: 'var(--font-heading)', textTransform: 'uppercase' }}>
                    {athlete.firstName} {athlete.lastName}
                  </h4>
                  <div style={{ display: 'flex', gap: '1rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', flexWrap: 'wrap' }}>
                    <span style={{ color: '#fff' }}>{athlete.registrationNumber}</span>
                    <span>•</span>
                    <span style={{ textTransform: 'capitalize' }}>{athlete.currentBelt?.replace(/-/g, ' ')} Belt</span>
                    <span>•</span>
                    <span>{athlete.branchName}</span>
                  </div>
                </div>
                
                <div style={{ color: '#ffb703', paddingRight: '0.5rem' }}>
                  →
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
