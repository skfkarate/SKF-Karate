'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, User, MapPin, Award, ChevronRight, Trophy, Sparkles, ArrowRight } from 'lucide-react'
import './search.css'

// Belt color mapping for visual indicators
const BELT_COLORS: Record<string, string> = {
  'white': '#f5f5f5',
  'yellow': '#ffd700',
  'orange': '#ff8c00',
  'green': '#2ecc71',
  'blue': '#3498db',
  'purple': '#9b59b6',
  'brown': '#8B4513',
  'black': '#1a1a1a',
  'black-1st-dan': '#1a1a1a',
  'black-2nd-dan': '#1a1a1a',
  'black-3rd-dan': '#1a1a1a',
}

function getBeltDisplay(belt: string) {
  if (!belt) return { label: 'White', color: '#f5f5f5' }
  const lower = belt.toLowerCase()
  const color = BELT_COLORS[lower] || '#f5f5f5'
  const label = lower.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  return { label, color }
}

export default function FindProfilePage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [featuredAthletes, setFeaturedAthletes] = useState<any[]>([])
  const [inputFocused, setInputFocused] = useState(false)

  // Load featured athletes on mount
  useEffect(() => {
    fetch('/api/athletes/search?q=a')
      .then(res => res.json())
      .then(data => {
        const athletes = data.results || data.athletes || []
        setFeaturedAthletes(athletes.slice(0, 4))
      })
      .catch(() => {})
  }, [])

  async function handleSearch(e?: React.FormEvent) {
    if (e) e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    setError('')
    setHasSearched(true)
    
    const isSkfId = /^SKF[-\s]?\d{2,4}[-\s]?\d{2,4}$/i.test(query.trim()) || /^SKF\d+/i.test(query.trim().replace(/[-\s]/g, ''))

    try {
      if (isSkfId) {
        router.push(`/athlete/${query.trim().toUpperCase()}`)
        return
      }

      const res = await fetch(`/api/athletes/search?q=${encodeURIComponent(query.trim())}`)
      if (!res.ok) throw new Error('Search failed')
      
      const data = await res.json()
      setResults(data.results || data.athletes || [])
    } catch (err) {
      console.error(err)
      setError('Could not complete search. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="as-page">
      {/* Ambient Effects */}
      <div className="as-ambient-orb as-ambient-orb--1" />
      <div className="as-ambient-orb as-ambient-orb--2" />
      <div className="as-ambient-orb as-ambient-orb--3" />

      {/* Kanji Watermark */}
      <div className="as-watermark">武道</div>

      {/* ═══ HERO SECTION ═══ */}
      <section className="as-hero">
        <div className="as-hero__badge">
          <Sparkles size={14} /> Athlete Database
        </div>
        
        <h1 className="as-hero__title">
          <span className="as-hero__title-line">Find Your</span>
          <span className="as-hero__title-accent">Profile</span>
        </h1>
        
        <p className="as-hero__subtitle">
          Search by SKF Registration ID or athlete name to access profiles, tournament history, achievements, and official certifications.
        </p>

        {/* ═══ SEARCH BAR ═══ */}
        <form onSubmit={handleSearch} className={`as-searchbar ${inputFocused ? 'as-searchbar--focused' : ''}`}>
          <div className="as-searchbar__icon">
            <Search size={20} />
          </div>
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Enter SKF ID (e.g. SKF-2024-0042) or athlete name..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            className="as-searchbar__input"
            autoComplete="off"
          />
          <button 
            type="submit" 
            disabled={isLoading || !query.trim()}
            className="as-searchbar__btn"
          >
            {isLoading ? (
              <span className="as-spinner" />
            ) : (
              <>Search<ArrowRight size={16} /></>
            )}
          </button>
        </form>

        {/* Quick search suggestions */}
        <div className="as-quick-tags">
          <span className="as-quick-tags__label">Try:</span>
          {['Arvind', 'Krishna', 'SKF-2024-0042', 'Priya'].map(tag => (
            <button 
              key={tag} 
              className="as-quick-tag" 
              onClick={() => { setQuery(tag); setTimeout(() => handleSearch(), 50) }}
            >
              {tag}
            </button>
          ))}
        </div>
      </section>

      {/* ═══ RESULTS SECTION ═══ */}
      <section className="as-results-section">
        <div className="as-results-container">

          {/* Error State */}
          {error && (
            <div className="as-error-card">
              <span>⚠</span> {error}
            </div>
          )}

          {/* No Results State */}
          {hasSearched && !isLoading && results.length === 0 && !error && (
            <div className="as-empty-state">
              <div className="as-empty-state__icon">
                <Search size={40} strokeWidth={1} />
              </div>
              <h3 className="as-empty-state__title">No Athletes Found</h3>
              <p className="as-empty-state__desc">
                Try searching by exact SKF Registration ID or check the spelling of the name. Names are case-insensitive.
              </p>
            </div>
          )}

          {/* Search Results */}
          {results.length > 0 && (
            <div className="as-results">
              <div className="as-results__header">
                <h3 className="as-results__count">
                  {results.length} Athlete{results.length !== 1 ? 's' : ''} Found
                </h3>
              </div>
              
              <div className="as-results__grid">
                {results.map((athlete: any) => {
                  const belt = getBeltDisplay(athlete.currentBelt)
                  return (
                    <div
                      key={athlete.registrationNumber}
                      className="as-athlete-card"
                      onClick={() => router.push(`/athlete/${athlete.registrationNumber}`)}
                    >
                      {/* Belt accent line */}
                      <div className="as-athlete-card__belt-line" style={{ background: belt.color }} />
                      
                      <div className="as-athlete-card__body">
                        {/* Avatar */}
                        <div className="as-athlete-card__avatar" style={{ borderColor: belt.color }}>
                          <span>{athlete.firstName?.[0]}{athlete.lastName?.[0]}</span>
                        </div>

                        {/* Info */}
                        <div className="as-athlete-card__info">
                          <h4 className="as-athlete-card__name">
                            {athlete.firstName} {athlete.lastName}
                          </h4>
                          <span className="as-athlete-card__id">{athlete.registrationNumber}</span>
                          
                          <div className="as-athlete-card__meta">
                            <span className="as-athlete-card__meta-item">
                              <MapPin size={12} /> {athlete.branchName}
                            </span>
                            <span className="as-athlete-card__meta-item">
                              <Award size={12} />
                              <span className="as-belt-dot" style={{ background: belt.color, boxShadow: `0 0 8px ${belt.color}` }} />
                              {belt.label}
                            </span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <div className="as-athlete-card__arrow">
                          <ChevronRight size={20} />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ═══ FEATURED ATHLETES (shown when no search yet) ═══ */}
          {!hasSearched && featuredAthletes.length > 0 && (
            <div className="as-featured">
              <div className="as-featured__header">
                <Trophy size={18} className="as-featured__icon" />
                <h3 className="as-featured__heading">Featured Athletes</h3>
              </div>
              
              <div className="as-featured__grid">
                {featuredAthletes.map((athlete: any) => {
                  const belt = getBeltDisplay(athlete.currentBelt)
                  return (
                    <div
                      key={athlete.registrationNumber}
                      className="as-featured-card"
                      onClick={() => router.push(`/athlete/${athlete.registrationNumber}`)}
                    >
                      <div className="as-featured-card__glow" style={{ background: belt.color }} />
                      
                      <div className="as-featured-card__avatar" style={{ borderColor: belt.color }}>
                        <span>{athlete.firstName?.[0]}{athlete.lastName?.[0]}</span>
                      </div>
                      
                      <h4 className="as-featured-card__name">
                        {athlete.firstName} {athlete.lastName}
                      </h4>
                      
                      <div className="as-featured-card__belt">
                        <span className="as-belt-dot" style={{ background: belt.color, boxShadow: `0 0 6px ${belt.color}` }} />
                        {belt.label}
                      </div>
                      
                      <span className="as-featured-card__branch">{athlete.branchName}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  )
}
