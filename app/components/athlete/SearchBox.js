'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { normaliseRegistrationNumber, isValidRegistrationNumber } from '../../../lib/utils/registration';

export default function SearchBox({ defaultValue = '', autoFocus = true }) {
  const router = useRouter();
  const [inputVal, setInputVal] = useState(defaultValue);
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const doSearch = async (query) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/athletes/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setResults(data.results || []);
      setIsOpen(data.results && data.results.length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setInputVal(val);
    setSelectedIdx(-1);

    // Debounced search
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 250);
  };

  const navigateToAthlete = (regNum) => {
    setIsOpen(false);
    setInputVal(regNum);
    router.push(`/athlete/${regNum}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedIdx >= 0 && results[selectedIdx]) {
      navigateToAthlete(results[selectedIdx].registrationNumber);
      return;
    }
    if (!inputVal.trim()) return;

    // If it looks like a registration number, navigate directly
    const normalised = normaliseRegistrationNumber(inputVal);
    if (isValidRegistrationNumber(normalised)) {
      navigateToAthlete(normalised);
      return;
    }

    // If there are results, go to the first one
    if (results.length > 0) {
      navigateToAthlete(results[0].registrationNumber);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const beltColorMap = {
    'white': '#ffffff', 'yellow': '#FFD700', 'orange': '#FF8C00', 'green': '#22c55e',
    'blue': '#3b82f6', 'brown': '#8B4513', 'black-1st-dan': '#111', 'black-2nd-dan': '#111',
    'black-3rd-dan': '#111', 'black-4th-dan': '#111', 'black-5th-dan': '#111',
  };

  return (
    <div className="profile-search-container" ref={wrapperRef}>
      <form onSubmit={handleSubmit} className="relative group">
        <label htmlFor="registration-search" className="sr-only">
          Search by name or registration number
        </label>

        <div className="profile-search-input-wrapper">
          {/* Search Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="profile-search-icon h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          <input
            id="registration-search"
            type="text"
            value={inputVal}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder="Search by name or SKF number..."
            autoFocus={autoFocus}
            autoComplete="off"
            aria-label="Search by name or registration number"
            className="profile-search-input"
          />

          <button
            type="submit"
            className="profile-search-btn"
            aria-label="Search"
          >
            <span className="hidden sm:inline">Search</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </form>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="profile-search-dropdown">
          {results.map((s, idx) => (
            <button
              key={s.registrationNumber}
              type="button"
              onClick={() => navigateToAthlete(s.registrationNumber)}
              onMouseEnter={() => setSelectedIdx(idx)}
              className={`profile-search-result ${selectedIdx === idx ? 'selected' : ''}`}
            >
              {/* Avatar */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border border-[rgba(255,255,255,0.1)] shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] flex-shrink-0"
                style={{ background: 'rgba(20,33,61,0.8)' }}
              >
                <span className="text-brand-red">{s.firstName?.charAt(0)}{s.lastName?.charAt(0)}</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold tracking-wide text-sm truncate">
                  {s.firstName} {s.lastName}
                </p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-gray-500 text-xs font-mono tracking-wider">{s.registrationNumber}</span>
                  <span className="text-[rgba(255,255,255,0.1)]">&bull;</span>
                  <span className="text-gray-500 text-xs">{s.branchName}</span>
                </div>
              </div>

              {/* Belt indicator */}
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-[rgba(255,255,255,0.1)] shadow-[0_0_8px_rgba(0,0,0,0.3)]"
                style={{ backgroundColor: beltColorMap[s.currentBelt] || '#555' }}
                title={s.currentBelt?.replace(/-/g, ' ')}
              />
            </button>
          ))}
        </div>
      )}

      {/* Loading Only */}
      {loading && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="w-3 h-3 border-2 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Searching...</p>
        </div>
      )}
    </div>
  );
}
