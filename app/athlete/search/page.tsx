'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, ChevronRight, Sparkles, ArrowRight, X, User } from 'lucide-react'
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
  skfId: string
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

function normalizeSkfLookup(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, '-').replace(/-+/g, '-')
}

function looksLikeSkfLookup(value: string) {
  const normalized = normalizeSkfLookup(value)
  return /^(?=.*\d)[A-Z]{2,}[A-Z0-9-]*$/.test(normalized)
}

function athleteProfileHref(skfId: string) {
  return `/athlete/${encodeURIComponent(normalizeSkfLookup(skfId))}`
}

export default function FindProfilePage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<AthleteSearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsMounted(true)
      const saved = window.localStorage.getItem('recentSearches')
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved) as string[])
        } catch {
          // Ignore malformed local storage from older sessions.
        }
      }
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  function addToRecentSearches(q: string) {
    if (!q) return;
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))
  }

  function removeRecentSearch(e: React.MouseEvent, q: string) {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== q);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  }

  function clearAllRecentSearches() {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  }

  async function handleSearch(e?: React.FormEvent, explicitQuery?: string) {
    if (e) e.preventDefault()
    const q = explicitQuery !== undefined ? explicitQuery : query
    if (!q.trim()) return

    setIsLoading(true)
    setError('')
    setHasSearched(true)
    addToRecentSearches(q.trim())

    const isSkfLookup = looksLikeSkfLookup(q)

    try {
      if (isSkfLookup) {
        router.push(athleteProfileHref(q))
        return
      }

      const res = await fetch(`/api/athletes/search?q=${encodeURIComponent(q.trim())}`)
      if (!res.ok) throw new Error('Search failed')

      const data = await res.json() as AthleteSearchResponse
      setResults(data.results || data.athletes || [])
    } catch {
      setError('Could not complete search. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`as-page ${hasSearched ? 'as-page--searched' : ''}`}>
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
          Search by SKF ID or athlete name to access profiles, tournament history, achievements, and official certifications.
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
              placeholder="Enter SKF ID (e.g. SKF25MP001) or athlete name..."
              value={query}
              onChange={e => {
                setQuery(e.target.value)
                if (!e.target.value.trim()) {
                  setHasSearched(false)
                  setResults([])
                }
              }}
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

          {/* ═══ RECENT SEARCHES (shown when no search yet) ═══ */}
          {isMounted && !hasSearched && query.trim() === '' && recentSearches.length > 0 && (
            <div className="as-recent-searches">
              <div className="as-recent-searches__header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Search size={14} className="as-recent-searches__icon" />
                  <h3 className="as-recent-searches__heading">Recent Searches</h3>
                </div>
                <button
                  type="button"
                  className="as-recent-searches__clear-all"
                  onClick={clearAllRecentSearches}
                >
                  Clear All
                </button>
              </div>

              <div className="as-quick-tags">
                {recentSearches.map((s, i) => (
                  <button
                    key={i}
                    className="as-quick-tag as-quick-tag--removable"
                    onClick={() => {
                      setQuery(s)
                      handleSearch(undefined, s)
                    }}
                  >
                    <span>{s}</span>
                    <div
                      className="as-quick-tag__remove"
                      onClick={(e) => removeRecentSearch(e, s)}
                    >
                      <X size={12} />
                    </div>
                  </button>
                ))}
              </div>
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
                Try searching by SKF ID or athlete name and check the spelling.
              </p>
            </div>
          )}

          {/* Search Results */}
          {hasSearched && results.length > 0 && (
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
                      key={athlete.skfId}
                      className="as-athlete-card"
                      style={{ '--belt-color': belt.color } as React.CSSProperties}
                      onClick={() => router.push(athleteProfileHref(athlete.skfId))}
                    >
                      {/* Avatar */}
                      <div className="as-athlete-card__avatar">
                        <User size={28} />
                      </div>

                      {/* Info */}
                      <div className="as-athlete-card__info">
                        <h4 className="as-athlete-card__name">
                          {athlete.firstName} {athlete.lastName}
                        </h4>
                        <div className="as-athlete-card__meta">
                          <span className="as-athlete-card__meta-item">
                            <MapPin size={14} /> {athlete.branchName}
                          </span>
                          <div
                              className="as-belt-chip"
                              style={{ '--chip-color': belt.color } as React.CSSProperties}
                          >
                              <span className="as-belt-chip__swatch" style={{ background: belt.color }} />
                              <span className="as-belt-chip__label">{belt.label}</span>
                          </div>
                        </div>
                      </div>

                      {/* SKF ID */}
                      <div className="as-athlete-card__id">
                        {athlete.skfId}
                      </div>

                      {/* Arrow */}
                      <div className="as-athlete-card__arrow">
                        <ChevronRight size={24} />
                      </div>
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
