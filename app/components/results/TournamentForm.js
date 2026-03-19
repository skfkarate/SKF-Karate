'use client'

/**
 * Shared Tournament Form — used by both /admin/results/new and /admin/results/[id]/edit
 */

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa'
import TournamentCard from './TournamentCard'
import MedalTally from './MedalTally'
import {
  TOURNAMENT_LEVELS, TOURNAMENT_LEVEL_LABELS,
  EVENT_CATEGORIES, EVENT_CATEGORY_LABELS,
  AGE_GROUPS, AGE_GROUP_LABELS,
  BRANCHES, BELTS,
} from '../../../lib/types/tournament'
import '../../admin/results/admin-results.css'

const AUTOSAVE_INTERVAL = 30000

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

const emptyWinner = {
  studentName: '',
  registrationNumber: '',
  branchName: 'Sunkadakatte',
  belt: 'White Belt',
  medal: 'gold',
  position: 1,
  category: 'kata-individual',
  ageGroup: 'sub-junior',
  weightCategory: '',
  photoUrl: '',
}

export default function TournamentForm({ tournament, isEdit = false }) {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState(0)
  const [isDirty, setIsDirty] = useState(false)
  const [errors, setErrors] = useState({})
  const [showWinnerModal, setShowWinnerModal] = useState(false)
  const [editingWinnerIndex, setEditingWinnerIndex] = useState(null)
  const [currentWinner, setCurrentWinner] = useState({ ...emptyWinner })
  const [notification, setNotification] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [form, setForm] = useState(() => {
    if (tournament) {
      return { ...tournament }
    }
    // Try to load from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tournament_draft')
      if (saved) {
        try { return JSON.parse(saved) } catch { /* ignore */ }
      }
    }
    return {
      name: '',
      shortName: '',
      slug: '',
      level: 'district',
      affiliatedBody: '',
      date: '',
      endDate: '',
      venue: '',
      city: '',
      state: 'Karnataka',
      description: '',
      coverImageUrl: '',
      totalParticipants: 0,
      skfParticipants: 0,
      isPublished: false,
      isFeatured: false,
      winners: [],
      medals: { gold: 0, silver: 0, bronze: 0 },
    }
  })

  // Auto-generate slug from name
  const handleNameChange = (name) => {
    setForm(prev => ({
      ...prev,
      name,
      slug: slugify(name),
    }))
    setIsDirty(true)
  }

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }))
  }

  // Recalculate medals when winners change
  const recalcMedals = useCallback((winners) => {
    return {
      gold: winners.filter(w => w.medal === 'gold').length,
      silver: winners.filter(w => w.medal === 'silver').length,
      bronze: winners.filter(w => w.medal === 'bronze').length,
    }
  }, [])

  // Auto-save to localStorage
  useEffect(() => {
    if (!isEdit) {
      const timer = setInterval(() => {
        if (isDirty) {
          localStorage.setItem('tournament_draft', JSON.stringify(form))
        }
      }, AUTOSAVE_INTERVAL)
      return () => clearInterval(timer)
    }
  }, [form, isDirty, isEdit])

  // Winner modal
  const openAddWinner = () => {
    setCurrentWinner({ ...emptyWinner })
    setEditingWinnerIndex(null)
    setShowWinnerModal(true)
  }

  const openEditWinner = (index) => {
    setCurrentWinner({ ...form.winners[index] })
    setEditingWinnerIndex(index)
    setShowWinnerModal(true)
  }

  const saveWinner = () => {
    if (!currentWinner.studentName.trim()) {
      alert('Student name is required')
      return
    }

    // Auto-sync medal and position
    const medalPositionMap = { gold: 1, silver: 2, bronze: 3 }
    const winner = {
      ...currentWinner,
      position: medalPositionMap[currentWinner.medal],
      id: currentWinner.id || `w_${Date.now()}`,
    }

    let newWinners
    if (editingWinnerIndex !== null) {
      newWinners = [...form.winners]
      newWinners[editingWinnerIndex] = winner
    } else {
      newWinners = [...form.winners, winner]
    }

    setForm(prev => ({
      ...prev,
      winners: newWinners,
      medals: recalcMedals(newWinners),
    }))
    setIsDirty(true)
    setShowWinnerModal(false)
  }

  const removeWinner = (index) => {
    const newWinners = form.winners.filter((_, i) => i !== index)
    setForm(prev => ({
      ...prev,
      winners: newWinners,
      medals: recalcMedals(newWinners),
    }))
    setIsDirty(true)
  }

  // Validation
  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Tournament name is required'
    if (!form.shortName.trim()) errs.shortName = 'Short name is required'
    if (!form.slug.trim()) errs.slug = 'Slug is required'
    if (!form.date) errs.date = 'Start date is required'
    if (!form.venue.trim()) errs.venue = 'Venue is required'
    if (!form.city.trim()) errs.city = 'City is required'
    if (!form.state.trim()) errs.state = 'State is required'
    if (!form.description.trim()) errs.description = 'Description is required'
    if (form.description.length > 300) errs.description = 'Description must be under 300 characters'
    if (!form.totalParticipants || form.totalParticipants < 1) errs.totalParticipants = 'Must be at least 1'
    if (!form.skfParticipants || form.skfParticipants < 1) errs.skfParticipants = 'Must be at least 1'
    if (form.isPublished && form.winners.length === 0) errs.winners = 'At least one winner required before publishing'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) {
      // Scroll to first error
      setActiveTab(0)
      setTimeout(() => {
        const firstError = document.querySelector('.admin-form__error')
        if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 100)
      return
    }

    // TODO: Call this after saving a winner when the points system is ready
    // await awardPointsForAchievement({
    //   studentRegistrationNumber: winner.registrationNumber,
    //   achievementType: 'tournament_medal',
    //   medalType: winner.medal,
    //   tournamentLevel: tournament.level,
    //   tournamentId: tournament.id
    // })

    setIsSaving(true)

    try {
      const response = await fetch(
        isEdit ? `/api/admin/results/${tournament.id}` : '/api/admin/results',
        {
          method: isEdit ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...form,
            medals: recalcMedals(form.winners),
          }),
        }
      )

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || 'Could not save the tournament.')
      }

      if (!isEdit) {
        localStorage.removeItem('tournament_draft')
      }

      setNotification(isEdit ? 'Tournament updated successfully!' : 'Tournament created successfully!')
      setTimeout(() => {
        router.push('/admin/results')
        router.refresh()
      }, 800)
    } catch (error) {
      setNotification(error.message || 'Could not save the tournament.')
    } finally {
      setIsSaving(false)
    }
  }

  const tabs = ['Basic Info', 'Winners', 'Publish Settings', 'Preview']

  return (
    <div className="admin-form">
      <div className="container">
        {notification && (
          <div className="admin-notification">{notification}</div>
        )}

        <div className="admin-form__header">
          <h1 className="admin-form__title">
            {isEdit ? 'Edit Tournament' : 'Log Tournament'}
          </h1>
          {isDirty && <span className="admin-form__unsaved">● Unsaved changes</span>}
        </div>

        <div className="admin-form__tabs">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              className={`admin-form__tab ${activeTab === i ? 'admin-form__tab--active' : ''}`}
              onClick={() => setActiveTab(i)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab 1: Basic Info */}
        {activeTab === 0 && (
          <div>
            <div className="admin-form__group">
              <label className="admin-form__label admin-form__label--required">Tournament Name</label>
              <input
                className="admin-form__input"
                value={form.name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="e.g. SKF State Karate Championship 2024"
              />
              {errors.name && <div className="admin-form__error">{errors.name}</div>}
            </div>

            <div className="admin-form__row">
              <div className="admin-form__group">
                <label className="admin-form__label admin-form__label--required">Short Name</label>
                <input
                  className="admin-form__input"
                  value={form.shortName}
                  onChange={e => updateField('shortName', e.target.value)}
                  placeholder="e.g. State Championship 2024"
                />
                {errors.shortName && <div className="admin-form__error">{errors.shortName}</div>}
              </div>
              <div className="admin-form__group">
                <label className="admin-form__label admin-form__label--required">Slug</label>
                <input
                  className="admin-form__input"
                  value={form.slug}
                  onChange={e => updateField('slug', e.target.value)}
                />
                <div className="admin-form__slug-preview">
                  Preview: skfkarate.org/results/{form.slug || '...'}
                </div>
                {errors.slug && <div className="admin-form__error">{errors.slug}</div>}
              </div>
            </div>

            <div className="admin-form__row">
              <div className="admin-form__group">
                <label className="admin-form__label admin-form__label--required">Level</label>
                <select
                  className="admin-form__form-select"
                  value={form.level}
                  onChange={e => updateField('level', e.target.value)}
                >
                  {TOURNAMENT_LEVELS.map(l => (
                    <option key={l} value={l}>{TOURNAMENT_LEVEL_LABELS[l]}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form__group">
                <label className="admin-form__label">Affiliated Body</label>
                <input
                  className="admin-form__input"
                  value={form.affiliatedBody || ''}
                  onChange={e => updateField('affiliatedBody', e.target.value)}
                  placeholder="e.g. WKF, KIO, AKSKA"
                />
              </div>
            </div>

            <div className="admin-form__row">
              <div className="admin-form__group">
                <label className="admin-form__label admin-form__label--required">Start Date</label>
                <input
                  type="date"
                  className="admin-form__input"
                  value={form.date}
                  onChange={e => updateField('date', e.target.value)}
                />
                {errors.date && <div className="admin-form__error">{errors.date}</div>}
              </div>
              <div className="admin-form__group">
                <label className="admin-form__label">End Date</label>
                <input
                  type="date"
                  className="admin-form__input"
                  value={form.endDate || ''}
                  onChange={e => updateField('endDate', e.target.value)}
                />
              </div>
            </div>

            <div className="admin-form__group">
              <label className="admin-form__label admin-form__label--required">Venue</label>
              <input
                className="admin-form__input"
                value={form.venue}
                onChange={e => updateField('venue', e.target.value)}
                placeholder="e.g. Kanteerava Indoor Stadium"
              />
              {errors.venue && <div className="admin-form__error">{errors.venue}</div>}
            </div>

            <div className="admin-form__row">
              <div className="admin-form__group">
                <label className="admin-form__label admin-form__label--required">City</label>
                <input
                  className="admin-form__input"
                  value={form.city}
                  onChange={e => updateField('city', e.target.value)}
                  placeholder="e.g. Bengaluru"
                />
                {errors.city && <div className="admin-form__error">{errors.city}</div>}
              </div>
              <div className="admin-form__group">
                <label className="admin-form__label admin-form__label--required">State</label>
                <input
                  className="admin-form__input"
                  value={form.state}
                  onChange={e => updateField('state', e.target.value)}
                />
                {errors.state && <div className="admin-form__error">{errors.state}</div>}
              </div>
            </div>

            <div className="admin-form__group">
              <label className="admin-form__label admin-form__label--required">Description</label>
              <textarea
                className="admin-form__textarea"
                value={form.description}
                onChange={e => updateField('description', e.target.value)}
                maxLength={300}
                placeholder="2-3 sentence summary of the tournament"
              />
              <div className="admin-form__char-count">
                {form.description.length}/300
              </div>
              {errors.description && <div className="admin-form__error">{errors.description}</div>}
            </div>

            <div className="admin-form__group">
              <label className="admin-form__label">Cover Image URL</label>
              <input
                className="admin-form__input"
                value={form.coverImageUrl || ''}
                onChange={e => updateField('coverImageUrl', e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="admin-form__row">
              <div className="admin-form__group">
                <label className="admin-form__label admin-form__label--required">Total Participants</label>
                <input
                  type="number"
                  className="admin-form__input"
                  value={form.totalParticipants}
                  onChange={e => updateField('totalParticipants', Number(e.target.value))}
                  min={1}
                />
                {errors.totalParticipants && <div className="admin-form__error">{errors.totalParticipants}</div>}
              </div>
              <div className="admin-form__group">
                <label className="admin-form__label admin-form__label--required">SKF Participants</label>
                <input
                  type="number"
                  className="admin-form__input"
                  value={form.skfParticipants}
                  onChange={e => updateField('skfParticipants', Number(e.target.value))}
                  min={1}
                />
                {errors.skfParticipants && <div className="admin-form__error">{errors.skfParticipants}</div>}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Winners */}
        {activeTab === 1 && (
          <div>
            <button className="btn btn-secondary" onClick={openAddWinner}>
              <FaPlus /> Add Winner
            </button>
            {errors.winners && <div className="admin-form__error" style={{ marginTop: '0.5rem' }}>{errors.winners}</div>}

            <div className="admin-form__winners-list">
              {form.winners.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', marginTop: '1.5rem' }}>No winners added yet.</p>
              ) : (
                form.winners.map((w, i) => (
                  <div key={w.id || i} className="admin-form__winner-row">
                    <div className="admin-form__winner-info">
                      <span style={{ fontWeight: 600, color: 'var(--text-white)' }}>{w.studentName}</span>
                      <span>{w.branchName}</span>
                      <span className={`achievement-badge achievement-badge--${w.medal}`}>{w.medal}</span>
                      <span>{EVENT_CATEGORY_LABELS[w.category]}</span>
                    </div>
                    <div className="admin-form__winner-actions">
                      <button className="admin-table__action-btn" onClick={() => openEditWinner(i)} aria-label="Edit winner">
                        <FaEdit />
                      </button>
                      <button className="admin-table__action-btn admin-table__action-btn--danger" onClick={() => removeWinner(i)} aria-label="Delete winner">
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Publish Settings */}
        {activeTab === 2 && (
          <div>
            <div className="admin-form__toggle-group">
              <button
                className={`admin-form__toggle ${form.isPublished ? 'admin-form__toggle--on' : 'admin-form__toggle--off'}`}
                onClick={() => updateField('isPublished', !form.isPublished)}
                aria-label="Toggle published"
              >
                <span className="admin-form__toggle-knob"></span>
              </button>
              <span className="admin-form__toggle-label">Published</span>
            </div>
            <div className="admin-form__toggle-group">
              <button
                className={`admin-form__toggle ${form.isFeatured ? 'admin-form__toggle--on' : 'admin-form__toggle--off'}`}
                onClick={() => updateField('isFeatured', !form.isFeatured)}
                aria-label="Toggle featured"
              >
                <span className="admin-form__toggle-knob"></span>
              </button>
              <span className="admin-form__toggle-label">Featured</span>
            </div>
          </div>
        )}

        {/* Tab 4: Preview */}
        {activeTab === 3 && (
          <div>
            <h3 style={{ marginBottom: '1.5rem', fontFamily: 'var(--font-heading)' }}>Card Preview</h3>
            <div style={{ maxWidth: 400 }}>
              <TournamentCard tournament={{
                ...form,
                id: form.id || 'preview',
                slug: form.slug || 'preview',
                medals: form.medals || { gold: 0, silver: 0, bronze: 0 },
                winners: form.winners || [],
              }} />
            </div>
            <h3 style={{ margin: '2.5rem 0 1.5rem', fontFamily: 'var(--font-heading)' }}>Medal Tally Preview</h3>
            <MedalTally medals={form.medals || { gold: 0, silver: 0, bronze: 0 }} />
            {form.isPublished && form.slug && (
              <a
                href={`/results/${form.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
                style={{ marginTop: '2rem', display: 'inline-flex' }}
              >
                View Live Page ↗
              </a>
            )}
          </div>
        )}

        {/* Submit */}
        <div className="admin-form__actions">
          <button className="btn btn-primary" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Saving...' : isEdit ? 'Update Tournament' : 'Save Tournament'}
          </button>
          <button className="btn btn-secondary" onClick={() => router.push('/admin/results')}>
            Cancel
          </button>
        </div>
      </div>

      {/* Winner Modal */}
      {showWinnerModal && (
        <div className="admin-modal-overlay" onClick={() => setShowWinnerModal(false)}>
          <div className="admin-modal" style={{ maxWidth: 550, textAlign: 'left' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0 }}>{editingWinnerIndex !== null ? 'Edit Winner' : 'Add Winner'}</h3>
              <button
                className="admin-table__action-btn"
                onClick={() => setShowWinnerModal(false)}
                aria-label="Close"
              >
                <FaTimes />
              </button>
            </div>

            <div className="admin-form__group">
              <label className="admin-form__label admin-form__label--required">Student Name</label>
              <input
                className="admin-form__input"
                value={currentWinner.studentName}
                onChange={e => setCurrentWinner(prev => ({ ...prev, studentName: e.target.value }))}
              />
            </div>

            <div className="admin-form__group">
              <label className="admin-form__label">Registration Number</label>
              <input
                className="admin-form__input"
                value={currentWinner.registrationNumber || ''}
                onChange={e => setCurrentWinner(prev => ({ ...prev, registrationNumber: e.target.value }))}
              />
            </div>

            <div className="admin-form__row">
              <div className="admin-form__group">
                <label className="admin-form__label admin-form__label--required">Branch</label>
                <select
                  className="admin-form__form-select"
                  value={currentWinner.branchName}
                  onChange={e => setCurrentWinner(prev => ({ ...prev, branchName: e.target.value }))}
                >
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="admin-form__group">
                <label className="admin-form__label admin-form__label--required">Belt</label>
                <select
                  className="admin-form__form-select"
                  value={currentWinner.belt}
                  onChange={e => setCurrentWinner(prev => ({ ...prev, belt: e.target.value }))}
                >
                  {BELTS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="admin-form__row">
              <div className="admin-form__group">
                <label className="admin-form__label admin-form__label--required">Medal</label>
                <select
                  className="admin-form__form-select"
                  value={currentWinner.medal}
                  onChange={e => {
                    const medal = e.target.value
                    const posMap = { gold: 1, silver: 2, bronze: 3 }
                    setCurrentWinner(prev => ({ ...prev, medal, position: posMap[medal] }))
                  }}
                >
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="bronze">Bronze</option>
                </select>
              </div>
              <div className="admin-form__group">
                <label className="admin-form__label admin-form__label--required">Position</label>
                <select
                  className="admin-form__form-select"
                  value={currentWinner.position}
                  disabled
                >
                  <option value={1}>1st</option>
                  <option value={2}>2nd</option>
                  <option value={3}>3rd</option>
                </select>
                <div className="admin-form__slug-preview">Auto-set from medal</div>
              </div>
            </div>

            <div className="admin-form__row">
              <div className="admin-form__group">
                <label className="admin-form__label admin-form__label--required">Event Category</label>
                <select
                  className="admin-form__form-select"
                  value={currentWinner.category}
                  onChange={e => setCurrentWinner(prev => ({ ...prev, category: e.target.value }))}
                >
                  {EVENT_CATEGORIES.map(c => (
                    <option key={c} value={c}>{EVENT_CATEGORY_LABELS[c]}</option>
                  ))}
                </select>
              </div>
              <div className="admin-form__group">
                <label className="admin-form__label admin-form__label--required">Age Group</label>
                <select
                  className="admin-form__form-select"
                  value={currentWinner.ageGroup}
                  onChange={e => setCurrentWinner(prev => ({ ...prev, ageGroup: e.target.value }))}
                >
                  {AGE_GROUPS.map(a => (
                    <option key={a} value={a}>{AGE_GROUP_LABELS[a]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="admin-form__group">
              <label className="admin-form__label">Weight Category</label>
              <input
                className="admin-form__input"
                value={currentWinner.weightCategory || ''}
                onChange={e => setCurrentWinner(prev => ({ ...prev, weightCategory: e.target.value }))}
                placeholder="e.g. Under 55kg (optional for kata)"
              />
            </div>

            <div className="admin-form__group">
              <label className="admin-form__label">Winner Photo URL</label>
              <input
                className="admin-form__input"
                value={currentWinner.photoUrl || ''}
                onChange={e => setCurrentWinner(prev => ({ ...prev, photoUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-primary" onClick={saveWinner}>
                {editingWinnerIndex !== null ? 'Update Winner' : 'Add Winner'}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowWinnerModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
