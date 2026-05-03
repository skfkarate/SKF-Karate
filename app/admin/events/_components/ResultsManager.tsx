'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { getApiErrorMessage } from '@/app/admin/_utils/apiErrors'
import { BELTS } from '@/data/constants/belts'
import {
  AGE_GROUP_LABELS,
  AGE_GROUPS,
  EVENT_CATEGORIES,
  EVENT_CATEGORY_LABELS,
  TOURNAMENT_DIFFICULTY_LEVELS,
} from '@/lib/types/tournament'
import { EVENT_TYPE_LABELS, isBeltExamType } from '@/lib/types/event'
import type { SenseiSummary } from '@/lib/types/sensei'

const beltOptions = BELTS.map((belt) => ({
  value: belt.colour,
  label: belt.label,
}))

export type ResultEventParticipant = {
  id: string
  athleteId?: string
  athleteName: string
  skfId: string
  branchName?: string
}

export type ManagedResult = {
  id?: string
  participantId?: string
  athleteId?: string
  athleteName?: string
  skfId?: string
  notes?: string
  category?: string
  ageGroup?: string
  weightCategory?: string
  medal?: string
  result?: string
  difficultyLevel?: number | string
  wins?: number | string
  beltAwarded?: string
  promotion?: string
  examiner?: string
  doublePromotion?: boolean
  grade?: string
  score?: number | string
  daysAttended?: number | string
  specialAward?: string
  award?: string
}

type ResultsManagerProps = {
  eventId: string
  participants: ResultEventParticipant[]
  results: ManagedResult[]
  type: string
  senseis?: SenseiSummary[]
}

function buildInitialResult(participant: ResultEventParticipant, type: string): ManagedResult {
  const base = {
    id: `res_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    participantId: participant.id,
    athleteId: participant.athleteId,
    athleteName: participant.athleteName,
    skfId: participant.skfId,
    notes: '',
  }

  if (type === 'tournament') {
    return {
      ...base,
      category: 'kata-individual',
      ageGroup: 'sub-junior',
      weightCategory: '',
      medal: 'participation',
      result: 'participation',
      difficultyLevel: '',
      wins: 0,
    }
  }

  if (type === 'grading') {
    return {
      ...base,
      result: '',
      beltAwarded: '',
      examiner: '',
      doublePromotion: false,
    }
  }

  if (isBeltExamType(type)) {
    return {
      ...base,
      result: '',
      grade: '',
      score: '',
    }
  }

  return {
    ...base,
    result: '',
    daysAttended: '',
    specialAward: '',
  }
}

function getResultForParticipant(
  localResults: ManagedResult[],
  participant: ResultEventParticipant,
  type: string
): ManagedResult {
  const existing = localResults.find((result) => result.participantId === participant.id)
  if (!existing) return buildInitialResult(participant, type)

  if (type === 'grading') {
    return {
      ...buildInitialResult(participant, type),
      ...existing,
      result: existing.result || (existing.promotion || existing.beltAwarded ? 'pass' : existing.result || ''),
      beltAwarded: existing.beltAwarded || existing.promotion || '',
    }
  }

  if (type === 'tournament') {
    return {
      ...buildInitialResult(participant, type),
      ...existing,
      result: existing.result || existing.medal || 'participation',
    }
  }

  return {
    ...buildInitialResult(participant, type),
    ...existing,
  }
}

export default function ResultsManager({
  eventId,
  participants = [],
  results = [],
  type,
  senseis = [],
}: ResultsManagerProps) {
  const router = useRouter()
  const [localResults, setLocalResults] = useState<ManagedResult[]>(results || [])
  const [publishing, setPublishing] = useState(false)
  const [saving, setSaving] = useState(false)

  const isTournament = type === 'tournament'
  const isBeltExam = isBeltExamType(type)
  const isAttendanceStyleEvent =
    type !== 'tournament' && type !== 'grading' && !isBeltExam

  const updateResult = (
    participant: ResultEventParticipant,
    updater: (current: ManagedResult) => ManagedResult
  ) => {
    setLocalResults((previous) => {
      const index = previous.findIndex((entry) => entry.participantId === participant.id)
      const current = getResultForParticipant(previous, participant, type)
      const next = updater(current)

      if (index === -1) {
        return [...previous, next]
      }

      const copy = [...previous]
      copy[index] = next
      return copy
    })
  }

  const handleResultChange = <Field extends keyof ManagedResult>(
    participant: ResultEventParticipant,
    field: Field,
    value: ManagedResult[Field]
  ) => {
    updateResult(participant, (current) => {
      const next = { ...current, [field]: value }

      if (type === 'tournament' && field === 'medal') {
        next.result = typeof value === 'string' && value ? value : 'participation'
      }

      if (type === 'grading' && field === 'result' && value !== 'pass') {
        next.beltAwarded = ''
        next.doublePromotion = false
      }

      return next
    })
  }

  const handleCheckboxChange = (participant: ResultEventParticipant, field: 'doublePromotion', checked: boolean) => {
    handleResultChange(participant, field, checked)
  }

  const handleSaveDraft = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: localResults }),
      })
      if (res.ok) {
        alert('Results draft saved.')
        router.refresh()
      } else {
        const data = await res.json().catch(() => null)
        alert(getApiErrorMessage(data, 'Failed to save the draft'))
      }
    } catch (error) {
      console.error(error)
    } finally {
      setSaving(false)
    }
  }

  const handlePublishToProfiles = async () => {
    if (!confirm('This will replace the previously published profile entries for this event. Continue?')) {
      return
    }

    setPublishing(true)
    try {
      const saveResponse = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: localResults }),
      })

      if (!saveResponse.ok) {
        const savePayload = await saveResponse.json().catch(() => null)
        alert(getApiErrorMessage(savePayload, 'Failed to save the latest draft before publishing'))
        return
      }

      const res = await fetch(`/api/admin/events/${eventId}/publish-results`, {
        method: 'POST',
      })

      if (res.ok) {
        alert('Published to athlete profiles.')
        router.refresh()
      } else {
        const data = await res.json().catch(() => null)
        alert(getApiErrorMessage(data, 'Failed to publish to athlete profiles'))
      }
    } catch (error) {
      console.error(error)
    } finally {
      setPublishing(false)
    }
  }

  if (participants.length === 0) {
    return <div style={{ color: '#888' }}>Please assign athletes first before managing results.</div>
  }

  const inputStyle = {
    padding: '0.45rem 0.6rem',
    background: '#050505',
    border: '1px solid #333',
    color: '#fff',
    borderRadius: '4px',
    fontSize: '0.8rem',
    width: '100%',
  }

  const panelStyle = {
    display: 'grid',
    gap: '0.75rem',
    gridTemplateColumns: isTournament ? 'repeat(2, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))',
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: 0, fontWeight: 500 }}>Participant Outcomes</h3>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={handleSaveDraft}
            disabled={saving || publishing}
            style={{ background: '#333', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 500 }}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={handlePublishToProfiles}
            disabled={saving || publishing}
            style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
          >
            {publishing ? 'Publishing...' : 'Publish to Athlete Profiles'}
          </button>
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#888', marginBottom: '2rem' }}>
        Record the full workflow outcome for each assigned athlete. This now supports attendance, completion, special awards, grading pass or fail, double promotions, belt exam scores, and tournament categories.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {participants.map((participant) => {
          const currentResult = getResultForParticipant(localResults, participant, type)

          return (
            <div
              key={participant.id}
              style={{
                border: '1px solid #1a1a1a',
                borderRadius: '8px',
                background: '#080808',
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem', alignItems: 'center' }}>
                <div>
                  <strong style={{ display: 'block', color: '#fff', fontSize: '0.95rem' }}>{participant.athleteName}</strong>
                  <span style={{ color: '#666', fontSize: '0.78rem' }}>
                    {participant.skfId} • {participant.branchName}
                  </span>
                </div>
                <span style={{ color: '#999', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {EVENT_TYPE_LABELS[type as keyof typeof EVENT_TYPE_LABELS] || type.replace(/-/g, ' ')}
                </span>
              </div>

              {isTournament && (
                <div style={panelStyle}>
                  <label>
                    <span style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Category</span>
                    <select
                      style={{ ...inputStyle, WebkitAppearance: 'none' }}
                      value={currentResult.category || 'kata-individual'}
                      onChange={(event) => handleResultChange(participant, 'category', event.target.value)}
                    >
                      {EVENT_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {EVENT_CATEGORY_LABELS[category as keyof typeof EVENT_CATEGORY_LABELS] || category}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Age Group</span>
                    <select
                      style={{ ...inputStyle, WebkitAppearance: 'none' }}
                      value={currentResult.ageGroup || 'sub-junior'}
                      onChange={(event) => handleResultChange(participant, 'ageGroup', event.target.value)}
                    >
                      {AGE_GROUPS.map((ageGroup) => (
                        <option key={ageGroup} value={ageGroup}>
                          {AGE_GROUP_LABELS[ageGroup as keyof typeof AGE_GROUP_LABELS] || ageGroup}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Medal / Placement</span>
                    <select
                      style={{ ...inputStyle, WebkitAppearance: 'none' }}
                      value={currentResult.medal || 'participation'}
                      onChange={(event) => handleResultChange(participant, 'medal', event.target.value)}
                    >
                      <option value="participation">Participation</option>
                      <option value="gold">Gold</option>
                      <option value="silver">Silver</option>
                      <option value="bronze">Bronze</option>
                    </select>
                  </label>

                  <label>
                    <span style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Weight Category</span>
                    <input
                      type="text"
                      placeholder="Optional"
                      style={inputStyle}
                      value={currentResult.weightCategory || ''}
                      onChange={(event) => handleResultChange(participant, 'weightCategory', event.target.value)}
                    />
                  </label>

                  <label>
                    <span style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Difficulty Level</span>
                    <select
                      style={{ ...inputStyle, WebkitAppearance: 'none' }}
                      value={currentResult.difficultyLevel || ''}
                      onChange={(event) => handleResultChange(participant, 'difficultyLevel', event.target.value)}
                    >
                      <option value="">Use tournament level only</option>
                      {TOURNAMENT_DIFFICULTY_LEVELS.map((difficultyLevel) => (
                        <option key={difficultyLevel} value={difficultyLevel}>
                          {difficultyLevel} / 5
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Fights Won</span>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      style={inputStyle}
                      value={currentResult.wins ?? 0}
                      onChange={(event) => handleResultChange(participant, 'wins', event.target.value)}
                    />
                  </label>

                  <label style={{ gridColumn: '1 / -1' }}>
                    <span style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Notes</span>
                    <input
                      type="text"
                      placeholder="Optional notes for admins"
                      style={inputStyle}
                      value={currentResult.notes || ''}
                      onChange={(event) => handleResultChange(participant, 'notes', event.target.value)}
                    />
                  </label>
                </div>
              )}

              {type === 'grading' && (
                <div style={panelStyle}>
                  <label>
                    <span style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Result</span>
                    <select
                      style={{ ...inputStyle, WebkitAppearance: 'none' }}
                      value={currentResult.result || ''}
                      onChange={(event) => handleResultChange(participant, 'result', event.target.value)}
                    >
                      <option value="">Select result</option>
                      <option value="pass">Pass</option>
                      <option value="fail">Fail</option>
                    </select>
                  </label>

                  <label>
                    <span style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Examiner</span>
                    <select
                      style={{ ...inputStyle, WebkitAppearance: 'none' }}
                      value={currentResult.examiner || ''}
                      onChange={(event) => handleResultChange(participant, 'examiner', event.target.value)}
                    >
                      <option value="">Select examiner / panel</option>
                      {senseis.map((sensei) => (
                        <option key={sensei.id} value={sensei.name}>
                          {sensei.name} · {sensei.dan}
                        </option>
                      ))}
                      <option value="SKF Examination Panel">SKF Examination Panel</option>
                    </select>
                  </label>

                  <label style={{ gridColumn: '1 / -1' }}>
                    <span style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Awarded Belt</span>
                    <select
                      style={{ ...inputStyle, WebkitAppearance: 'none' }}
                      value={currentResult.beltAwarded || ''}
                      onChange={(event) => handleResultChange(participant, 'beltAwarded', event.target.value)}
                      disabled={currentResult.result !== 'pass'}
                    >
                      <option value="">No promotion</option>
                      {beltOptions.map((belt) => (
                        <option key={belt.value} value={belt.value}>
                          {belt.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.65rem',
                      color: currentResult.result === 'pass' ? '#ddd' : '#666',
                      fontSize: '0.82rem',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(currentResult.doublePromotion)}
                      disabled={currentResult.result !== 'pass'}
                      onChange={(event) => handleCheckboxChange(participant, 'doublePromotion', event.target.checked)}
                    />
                    Double promotion
                  </label>

                  <label style={{ gridColumn: '1 / -1' }}>
                    <span style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Notes</span>
                    <input
                      type="text"
                      placeholder="Promotion remarks, grading remarks, missing criteria..."
                      style={inputStyle}
                      value={currentResult.notes || ''}
                      onChange={(event) => handleResultChange(participant, 'notes', event.target.value)}
                    />
                  </label>
                </div>
              )}

              {isBeltExam && (
                <div style={panelStyle}>
                  <label>
                    <span style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Result</span>
                    <select
                      style={{ ...inputStyle, WebkitAppearance: 'none' }}
                      value={currentResult.result || ''}
                      onChange={(event) => handleResultChange(participant, 'result', event.target.value)}
                    >
                      <option value="">Select result</option>
                      <option value="pass">Pass</option>
                      <option value="fail">Fail</option>
                    </select>
                  </label>

                  <label>
                    <span style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Grade</span>
                    <input
                      type="text"
                      placeholder="A+, A, B..."
                      style={inputStyle}
                      value={currentResult.grade || ''}
                      onChange={(event) => handleResultChange(participant, 'grade', event.target.value)}
                    />
                  </label>

                  <label>
                    <span style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Score</span>
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      placeholder="Optional"
                      style={inputStyle}
                      value={currentResult.score || ''}
                      onChange={(event) => handleResultChange(participant, 'score', event.target.value)}
                    />
                  </label>

                  <label style={{ gridColumn: '1 / -1' }}>
                    <span style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Notes</span>
                    <input
                      type="text"
                      placeholder="Exam comments"
                      style={inputStyle}
                      value={currentResult.notes || ''}
                      onChange={(event) => handleResultChange(participant, 'notes', event.target.value)}
                    />
                  </label>
                </div>
              )}

              {isAttendanceStyleEvent && (
                <div style={panelStyle}>
                  <label>
                    <span style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Attendance Result</span>
                    <select
                      style={{ ...inputStyle, WebkitAppearance: 'none' }}
                      value={currentResult.result || ''}
                      onChange={(event) => handleResultChange(participant, 'result', event.target.value)}
                    >
                      <option value="">Select result</option>
                      <option value="absent">Absent</option>
                      <option value="attended">Attended</option>
                      <option value="completed">Completed</option>
                    </select>
                  </label>

                  <label>
                    <span style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Days Attended</span>
                    <input
                      type="number"
                      min={0}
                      max={365}
                      placeholder="Optional"
                      style={inputStyle}
                      value={currentResult.daysAttended || ''}
                      onChange={(event) => handleResultChange(participant, 'daysAttended', event.target.value)}
                    />
                  </label>

                  <label style={{ gridColumn: '1 / -1' }}>
                    <span style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Special Award / Recognition</span>
                    <input
                      type="text"
                      placeholder="Best performer, discipline award, attendance star..."
                      style={inputStyle}
                      value={currentResult.specialAward || currentResult.award || ''}
                      onChange={(event) => handleResultChange(participant, 'specialAward', event.target.value)}
                    />
                  </label>

                  <label style={{ gridColumn: '1 / -1' }}>
                    <span style={{ display: 'block', color: '#888', fontSize: '0.75rem', marginBottom: '0.35rem' }}>Notes</span>
                    <input
                      type="text"
                      placeholder="Completion summary, attendance remarks, special performance notes"
                      style={inputStyle}
                      value={currentResult.notes || ''}
                      onChange={(event) => handleResultChange(participant, 'notes', event.target.value)}
                    />
                  </label>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
