'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Award, ChevronRight, Sparkles, ArrowRight } from 'lucide-react'
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

type AthleteSearchResult = {
  registrationNumber: string
  firstName?: string
  lastName?: string
  branchName?: string
  currentBelt?: string
}

type AthleteSearchResponse = {
  results?: AthleteSearchResult[]
  athletes?: AthleteSearchResult[]
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
  const [results, setResults] = useState<AthleteSearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    const saved = window.localStorage.getItem('recentSearches')
    if (!saved) return []

    try {
      return JSON.parse(saved) as string[]
    } catch {
      return []
    }
  })
  const [suggestions, setSuggestions] = useState<AthleteSearchResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)

  // Debounced suggestions fetch
  useEffect(() => {
    const q = query.trim()
    if (!q || q.length < 2) {
      const timer = setTimeout(() => setSuggestions([]), 0)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => {
      fetch(`/api/athletes/search?q=${encodeURIComponent(q)}`)
        .then(res => res.json())
        .then(data => {
          setSuggestions(data.results || data.athletes || [])
        })
        .catch(() => {})
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  function addToRecentSearches(q: string) {
    if (!q) return;
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  async function handleSearch(e?: React.FormEvent, explicitQuery?: string) {
    if (e) e.preventDefault()
    const q = explicitQuery !== undefined ? explicitQuery : query
    if (!q.trim()) return

    setIsLoading(true)
    setError('')
    setHasSearched(true)
    setShowSuggestions(false)
    addToRecentSearches(q.trim())
    
    const isSkfId = /^SKF[-\s]?\d{2,4}[-\s]?\d{2,4}$/i.test(q.trim()) || /^SKF\d+/i.test(q.trim().replace(/[-\s]/g, ''))

    try {
      if (isSkfId) {
        router.push(`/athlete/${q.trim().toUpperCase()}`)
        return
      }

      const res = await fetch(`/api/athletes/search?q=${encodeURIComponent(q.trim())}`)
      if (!res.ok) throw new Error('Search failed')
      
      const data = await res.json() as AthleteSearchResponse
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
        <div className="as-searchbar-container">
          <form onSubmit={(e) => handleSearch(e)} className={`as-searchbar ${inputFocused ? 'as-searchbar--focused' : ''}`}>
            <div className="as-searchbar__icon">
              <Search size={20} />
            </div>
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Enter SKF ID (e.g. SKF-2024-0042) or athlete name..."
              value={query}
              onChange={e => {
                setQuery(e.target.value)
                setShowSuggestions(true)
                setHasSearched(false) // reset search state to show suggestions/recent
              }}
              onFocus={() => {
                setInputFocused(true)
                setShowSuggestions(true)
              }}
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

          {/* Suggestions Dropdown */}
          {inputFocused && showSuggestions && suggestions.length > 0 && (
            <div className="as-suggestions-dropdown">
              {suggestions.slice(0, 5).map((s) => (
                <div 
                  key={s.registrationNumber} 
                  className="as-suggestion-item" 
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevent blur
                    const name = `${s.firstName} ${s.lastName}`;
                    setQuery(name);
                    setShowSuggestions(false);
                    handleSearch(undefined, name);
                  }}
                >
                  <div className="as-suggestion-avatar">
                    {s.firstName?.[0]}{s.lastName?.[0]}
                  </div>
                  <div className="as-suggestion-info">
                    <span className="as-suggestion-name">{s.firstName} {s.lastName}</span>
                    <span className="as-suggestion-id">{s.registrationNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
                Try searching by athlete name and check the spelling. Names are case-insensitive.
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
                {results.map((athlete) => {
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

          {/* ═══ RECENT SEARCHES (shown when no search yet) ═══ */}
          {!hasSearched && query.trim() === '' && recentSearches.length > 0 && (
            <div className="as-featured" style={{ marginTop: '3rem' }}>
              <div className="as-featured__header">
                <Search size={18} className="as-featured__icon" />
                <h3 className="as-featured__heading">Recent Searches</h3>
              </div>
              
              <div className="as-quick-tags" style={{ justifyContent: 'flex-start', marginTop: '1rem' }}>
                {recentSearches.map((s, i) => (
                  <button 
                    key={i} 
                    className="as-quick-tag" 
                    onClick={() => {
                      setQuery(s)
                      handleSearch(undefined, s)
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  )
}
