'use client'

import { useState } from 'react'

import {
  SENSEI_ACCENTS,
  type SenseiAccent,
  type SenseiProfile,
} from '@/lib/types/sensei'

type SenseiDraft = {
  id: string
  name: string
  slug: string
  title: string
  dan: string
  role: string
  specialty: string
  experience: string
  description: string
  fullBio: string
  achievementsText: string
  quote: string
  imageUrl: string
  accent: SenseiAccent
  isFounder: boolean
  isExecutiveCommittee: boolean
  isPublic: boolean
  isActive: boolean
  isAssignable: boolean
  sortOrder: number
}

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function buildSenseiDraft(sensei: SenseiProfile): SenseiDraft {
  return {
    id: sensei.id,
    name: sensei.name,
    slug: sensei.slug,
    title: sensei.title,
    dan: sensei.dan,
    role: sensei.role,
    specialty: sensei.specialty,
    experience: sensei.experience,
    description: sensei.description,
    fullBio: sensei.fullBio,
    achievementsText: sensei.achievements.join('\n'),
    quote: sensei.quote,
    imageUrl: sensei.imageUrl,
    accent: sensei.accent,
    isFounder: sensei.isFounder,
    isExecutiveCommittee: sensei.isExecutiveCommittee,
    isPublic: sensei.isPublic,
    isActive: sensei.isActive,
    isAssignable: sensei.isAssignable,
    sortOrder: sensei.sortOrder,
  }
}

function buildDraftMap(senseis: SenseiProfile[]) {
  return Object.fromEntries(senseis.map((sensei) => [sensei.id, buildSenseiDraft(sensei)]))
}

function createEmptySenseiDraft(order: number): SenseiDraft {
  return {
    id: '',
    name: '',
    slug: '',
    title: 'Lead Instructor',
    dan: 'Black Belt',
    role: 'Lead Instructor',
    specialty: 'Karate Instruction',
    experience: '',
    description: '',
    fullBio: '',
    achievementsText: '',
    quote: '',
    imageUrl: '/gallery/In Dojo.jpeg',
    accent: 'gold',
    isFounder: false,
    isExecutiveCommittee: false,
    isPublic: true,
    isActive: true,
    isAssignable: true,
    sortOrder: order,
  }
}

export default function SenseisAdminClient({
  initialSenseis,
  canManage,
}: {
  initialSenseis: SenseiProfile[]
  canManage: boolean
}) {
  const [senseis, setSenseis] = useState<SenseiProfile[]>(initialSenseis)
  const [drafts, setDrafts] = useState<Record<string, SenseiDraft>>(() =>
    buildDraftMap(initialSenseis)
  )
  const [newSensei, setNewSensei] = useState<SenseiDraft>(() =>
    createEmptySenseiDraft(initialSenseis.length)
  )
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [savingKey, setSavingKey] = useState('')
  const [activeGroup, setActiveGroup] = useState<'founder' | 'leadership' | 'assigned' | 'reserve' | 'inactive'>('leadership')

  const totalPublicSenseis = senseis.filter((sensei) => sensei.isPublic && sensei.isActive).length
  const totalAssignableSenseis = senseis.filter(
    (sensei) => sensei.isAssignable && sensei.isActive
  ).length
  const groupedSenseis = {
    founder: senseis.filter((sensei) => sensei.isFounder),
    leadership: senseis.filter(
      (sensei) => !sensei.isFounder && sensei.isActive && (sensei.isExecutiveCommittee || (sensei.role && sensei.role !== 'Lead Instructor'))
    ),
    assigned: senseis.filter(
      (sensei) =>
        !sensei.isFounder &&
        sensei.isActive &&
        !sensei.isExecutiveCommittee &&
        Array.isArray(sensei.assignments) &&
        sensei.assignments.length > 0
    ),
    reserve: senseis.filter(
      (sensei) =>
        !sensei.isFounder &&
        sensei.isActive &&
        !sensei.isExecutiveCommittee &&
        (!Array.isArray(sensei.assignments) || sensei.assignments.length === 0)
    ),
    inactive: senseis.filter((sensei) => !sensei.isActive),
  }
  const visibleSenseis = groupedSenseis[activeGroup]

  const inputStyle = {
    width: '100%',
    padding: '0.8rem 0.9rem',
    background: '#050505',
    border: '1px solid #2a2a2a',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '0.92rem',
  }

  const syncSenseis = (nextSenseis: SenseiProfile[]) => {
    setSenseis(nextSenseis)
    setDrafts(buildDraftMap(nextSenseis))
    setNewSensei(createEmptySenseiDraft(nextSenseis.length))
  }

  const submitAction = async (
    key: string,
    body: Record<string, unknown>,
    successMessage: string
  ) => {
    setSavingKey(key)
    setStatus('')
    setError('')

    try {
      const response = await fetch('/api/admin/senseis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || 'Unable to update the sensei directory.')
      }

      syncSenseis(Array.isArray(payload.senseis) ? payload.senseis : [])
      setStatus(successMessage)
      return true
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to update the sensei directory.'
      )
      return false
    } finally {
      setSavingKey('')
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050505',
        color: '#fff',
        paddingBottom: '4rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <header
        style={{ borderBottom: '1px solid #111', padding: '2rem 2.5rem', background: '#000' }}
      >
        <p
          style={{
            color: '#666',
            fontSize: '0.8rem',
            fontFamily: 'monospace',
            letterSpacing: '0.1em',
            marginBottom: '1rem',
            textTransform: 'uppercase',
          }}
        >
          Administration / Senseis
        </p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 400, margin: 0, letterSpacing: '-0.03em' }}>
          Sensei Directory
        </h1>
        <p style={{ color: '#888', maxWidth: '860px', margin: '0.9rem 0 0' }}>
          Manage the live Sensei directory used by classes, branch pages, grading examiner
          dropdowns, certificate issuer suggestions, and public Sensei profiles. Keep identity and
          profile content here once, then reuse it everywhere.
        </p>
      </header>

      <div style={{ padding: '2rem 2.5rem', display: 'grid', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Total Senseis', value: senseis.length },
            { label: 'Public Profiles', value: totalPublicSenseis },
            { label: 'Assignable in Dropdowns', value: totalAssignableSenseis },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: '#0b0b0b',
                border: '1px solid #171717',
                borderRadius: '14px',
                padding: '1.25rem',
              }}
            >
              <div
                style={{
                  color: '#666',
                  fontSize: '0.8rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {item.label}
              </div>
              <div style={{ fontSize: '2rem', marginTop: '0.4rem' }}>{item.value}</div>
            </div>
          ))}
        </div>

        {(status || error) && (
          <div
            style={{
              padding: '1rem 1.1rem',
              borderRadius: '10px',
              border: `1px solid ${error ? '#5a2020' : '#1c3a29'}`,
              background: error ? 'rgba(120, 28, 28, 0.2)' : 'rgba(22, 101, 52, 0.18)',
              color: error ? '#fca5a5' : '#86efac',
            }}
          >
            {error || status}
          </div>
        )}

        <section
          style={{
            background: '#0b0b0b',
            border: '1px solid #171717',
            borderRadius: '16px',
            padding: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 500 }}>Directory Groups</h2>
              <p style={{ margin: '0.45rem 0 0', color: '#777', fontSize: '0.9rem' }}>
                Founder, leadership, actively assigned Senseis, reserve instructors, and inactive records are separated here so branch operations stay easier to read.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              {[
                ['founder', `Founder (${groupedSenseis.founder.length})`],
                ['leadership', `Leadership (${groupedSenseis.leadership.length})`],
                ['assigned', `Assigned (${groupedSenseis.assigned.length})`],
                ['reserve', `Reserve (${groupedSenseis.reserve.length})`],
                ['inactive', `Inactive (${groupedSenseis.inactive.length})`],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveGroup(key as typeof activeGroup)}
                  style={{
                    padding: '0.68rem 0.95rem',
                    borderRadius: '999px',
                    border: `1px solid ${activeGroup === key ? 'rgba(255,183,3,0.35)' : '#252525'}`,
                    background: activeGroup === key ? 'rgba(255,183,3,0.08)' : '#070707',
                    color: activeGroup === key ? '#ffcf70' : '#d3d3d3',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section
          style={{
            background: '#0b0b0b',
            border: '1px solid #171717',
            borderRadius: '16px',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 500 }}>Add Sensei</h2>
              <p style={{ margin: '0.45rem 0 0', color: '#777', fontSize: '0.9rem' }}>
                New Senseis added here immediately become available to branch and examiner
                dropdowns when marked active and assignable.
              </p>
            </div>
            <button
              type="button"
              disabled={!canManage || !!savingKey}
              onClick={() =>
                submitAction(
                  'create-sensei',
                  {
                    operation: 'create',
                    payload: {
                      ...newSensei,
                      slug: slugify(newSensei.slug || newSensei.name),
                    },
                  },
                  'Sensei directory updated successfully.'
                )
              }
              style={{
                background: '#fff',
                color: '#000',
                border: 'none',
                padding: '0.9rem 1.4rem',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: canManage ? 'pointer' : 'not-allowed',
                opacity: canManage ? 1 : 0.55,
              }}
            >
              {savingKey === 'create-sensei' ? 'Saving...' : 'Create Sensei'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem' }}>
            <input
              value={newSensei.name}
              onChange={(event) =>
                setNewSensei((previous) => ({
                  ...previous,
                  name: event.target.value,
                  slug: previous.slug || slugify(event.target.value),
                }))
              }
              placeholder="Sensei name"
              style={inputStyle}
            />
            <input
              value={newSensei.slug}
              onChange={(event) =>
                setNewSensei((previous) => ({ ...previous, slug: slugify(event.target.value) }))
              }
              placeholder="sensei-slug"
              style={inputStyle}
            />
            <input
              value={newSensei.title}
              onChange={(event) =>
                setNewSensei((previous) => ({ ...previous, title: event.target.value }))
              }
              placeholder="Title"
              style={inputStyle}
            />
            <input
              value={newSensei.dan}
              onChange={(event) =>
                setNewSensei((previous) => ({ ...previous, dan: event.target.value }))
              }
              placeholder="Dan / rank"
              style={inputStyle}
            />
            <input
              value={newSensei.role}
              onChange={(event) =>
                setNewSensei((previous) => ({ ...previous, role: event.target.value }))
              }
              placeholder="Role"
              style={inputStyle}
            />
            <input
              value={newSensei.specialty}
              onChange={(event) =>
                setNewSensei((previous) => ({ ...previous, specialty: event.target.value }))
              }
              placeholder="Specialty"
              style={inputStyle}
            />
            <input
              value={newSensei.experience}
              onChange={(event) =>
                setNewSensei((previous) => ({ ...previous, experience: event.target.value }))
              }
              placeholder="Experience"
              style={inputStyle}
            />
            <select
              value={newSensei.accent}
              onChange={(event) =>
                setNewSensei((previous) => ({
                  ...previous,
                  accent: event.target.value as SenseiAccent,
                }))
              }
              style={inputStyle}
            >
              {SENSEI_ACCENTS.map((accent) => (
                <option key={accent} value={accent}>
                  {accent}
                </option>
              ))}
            </select>
            <input
              value={newSensei.imageUrl}
              onChange={(event) =>
                setNewSensei((previous) => ({ ...previous, imageUrl: event.target.value }))
              }
              placeholder="Image URL"
              style={{ ...inputStyle, gridColumn: '1 / span 2' }}
            />
            <input
              value={String(newSensei.sortOrder)}
              onChange={(event) =>
                setNewSensei((previous) => ({
                  ...previous,
                  sortOrder: Math.max(0, Number(event.target.value) || 0),
                }))
              }
              placeholder="Sort order"
              style={inputStyle}
            />
            <input
              value={newSensei.quote}
              onChange={(event) =>
                setNewSensei((previous) => ({ ...previous, quote: event.target.value }))
              }
              placeholder="Quote"
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <textarea
              value={newSensei.description}
              onChange={(event) =>
                setNewSensei((previous) => ({ ...previous, description: event.target.value }))
              }
              placeholder="Short description"
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
            />
            <textarea
              value={newSensei.fullBio}
              onChange={(event) =>
                setNewSensei((previous) => ({ ...previous, fullBio: event.target.value }))
              }
              placeholder="Full bio"
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
            />
          </div>

          <div style={{ marginTop: '1rem' }}>
            <textarea
              value={newSensei.achievementsText}
              onChange={(event) =>
                setNewSensei((previous) => ({
                  ...previous,
                  achievementsText: event.target.value,
                }))
              }
              placeholder="Achievements, one per line"
              style={{ ...inputStyle, minHeight: '110px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
            {[
              ['isActive', 'Active'],
              ['isPublic', 'Public profile'],
              ['isAssignable', 'Available in dropdowns'],
              ['isExecutiveCommittee', 'Executive committee'],
              ['isFounder', 'Founder'],
            ].map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#ddd' }}>
                <input
                  type="checkbox"
                  checked={Boolean(newSensei[key as keyof SenseiDraft])}
                  onChange={(event) =>
                    setNewSensei((previous) => ({
                      ...previous,
                      [key]: event.target.checked,
                    }))
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </section>

        <section
          style={{
            background: '#0b0b0b',
            border: '1px solid #171717',
            borderRadius: '16px',
            padding: '1.5rem',
          }}
        >
          <div style={{ marginBottom: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 500 }}>Existing Senseis</h2>
            <p style={{ margin: '0.45rem 0 0', color: '#777', fontSize: '0.9rem' }}>
              Branch assignments are shown here read-only. Reassign a branch from Classes if you
              want a different lead Sensei there. Currently viewing the {activeGroup} group.
            </p>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            {visibleSenseis.map((sensei) => {
              const draft = drafts[sensei.id] || buildSenseiDraft(sensei)

              return (
                <div
                  key={sensei.id}
                  style={{
                    background: '#070707',
                    border: '1px solid #171717',
                    borderRadius: '14px',
                    padding: '1rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: '1rem',
                      alignItems: 'center',
                      marginBottom: '1rem',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '1rem' }}>{sensei.name}</div>
                      <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                        /senseis/{sensei.slug}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button
                        type="button"
                        disabled={!canManage || !!savingKey}
                        onClick={() =>
                          submitAction(
                            `sensei-${sensei.id}`,
                            {
                              operation: 'update',
                              id: sensei.id,
                              payload: {
                                ...draft,
                                slug: slugify(draft.slug || draft.name),
                              },
                            },
                            'Sensei directory updated successfully.'
                          )
                        }
                        style={{
                          background: '#fff',
                          color: '#000',
                          border: 'none',
                          padding: '0.72rem 1rem',
                          borderRadius: '8px',
                          fontWeight: 600,
                          cursor: canManage ? 'pointer' : 'not-allowed',
                          opacity: canManage ? 1 : 0.55,
                        }}
                      >
                        {savingKey === `sensei-${sensei.id}` ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        disabled={!canManage || !!savingKey}
                        onClick={() => {
                          if (
                            !confirm(
                              `Delete ${sensei.name}? Reassign any linked branches first if this Sensei is in use.`
                            )
                          ) {
                            return
                          }

                          void submitAction(
                            `delete-sensei-${sensei.id}`,
                            { operation: 'delete', id: sensei.id },
                            'Sensei directory updated successfully.'
                          )
                        }}
                        style={{
                          background: 'transparent',
                          color: '#fca5a5',
                          border: '1px solid #5a2020',
                          padding: '0.72rem 1rem',
                          borderRadius: '8px',
                          cursor: canManage ? 'pointer' : 'not-allowed',
                          opacity: canManage ? 1 : 0.55,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.9rem' }}>
                    <input
                      value={draft.name}
                      onChange={(event) =>
                        setDrafts((previous) => ({
                          ...previous,
                          [sensei.id]: {
                            ...draft,
                            name: event.target.value,
                            slug: draft.slug || slugify(event.target.value),
                          },
                        }))
                      }
                      placeholder="Sensei name"
                      style={inputStyle}
                    />
                    <input
                      value={draft.slug}
                      onChange={(event) =>
                        setDrafts((previous) => ({
                          ...previous,
                          [sensei.id]: { ...draft, slug: slugify(event.target.value) },
                        }))
                      }
                      placeholder="sensei-slug"
                      style={inputStyle}
                    />
                    <input
                      value={draft.title}
                      onChange={(event) =>
                        setDrafts((previous) => ({
                          ...previous,
                          [sensei.id]: { ...draft, title: event.target.value },
                        }))
                      }
                      placeholder="Title"
                      style={inputStyle}
                    />
                    <input
                      value={draft.dan}
                      onChange={(event) =>
                        setDrafts((previous) => ({
                          ...previous,
                          [sensei.id]: { ...draft, dan: event.target.value },
                        }))
                      }
                      placeholder="Dan / rank"
                      style={inputStyle}
                    />
                    <input
                      value={draft.role}
                      onChange={(event) =>
                        setDrafts((previous) => ({
                          ...previous,
                          [sensei.id]: { ...draft, role: event.target.value },
                        }))
                      }
                      placeholder="Role"
                      style={inputStyle}
                    />
                    <input
                      value={draft.specialty}
                      onChange={(event) =>
                        setDrafts((previous) => ({
                          ...previous,
                          [sensei.id]: { ...draft, specialty: event.target.value },
                        }))
                      }
                      placeholder="Specialty"
                      style={inputStyle}
                    />
                    <input
                      value={draft.experience}
                      onChange={(event) =>
                        setDrafts((previous) => ({
                          ...previous,
                          [sensei.id]: { ...draft, experience: event.target.value },
                        }))
                      }
                      placeholder="Experience"
                      style={inputStyle}
                    />
                    <select
                      value={draft.accent}
                      onChange={(event) =>
                        setDrafts((previous) => ({
                          ...previous,
                          [sensei.id]: {
                            ...draft,
                            accent: event.target.value as SenseiAccent,
                          },
                        }))
                      }
                      style={inputStyle}
                    >
                      {SENSEI_ACCENTS.map((accent) => (
                        <option key={accent} value={accent}>
                          {accent}
                        </option>
                      ))}
                    </select>
                    <input
                      value={draft.imageUrl}
                      onChange={(event) =>
                        setDrafts((previous) => ({
                          ...previous,
                          [sensei.id]: { ...draft, imageUrl: event.target.value },
                        }))
                      }
                      placeholder="Image URL"
                      style={{ ...inputStyle, gridColumn: '1 / span 2' }}
                    />
                    <input
                      value={String(draft.sortOrder)}
                      onChange={(event) =>
                        setDrafts((previous) => ({
                          ...previous,
                          [sensei.id]: {
                            ...draft,
                            sortOrder: Math.max(0, Number(event.target.value) || 0),
                          },
                        }))
                      }
                      placeholder="Sort order"
                      style={inputStyle}
                    />
                    <input
                      value={draft.quote}
                      onChange={(event) =>
                        setDrafts((previous) => ({
                          ...previous,
                          [sensei.id]: { ...draft, quote: event.target.value },
                        }))
                      }
                      placeholder="Quote"
                      style={inputStyle}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginTop: '0.9rem' }}>
                    <textarea
                      value={draft.description}
                      onChange={(event) =>
                        setDrafts((previous) => ({
                          ...previous,
                          [sensei.id]: { ...draft, description: event.target.value },
                        }))
                      }
                      placeholder="Short description"
                      style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
                    />
                    <textarea
                      value={draft.fullBio}
                      onChange={(event) =>
                        setDrafts((previous) => ({
                          ...previous,
                          [sensei.id]: { ...draft, fullBio: event.target.value },
                        }))
                      }
                      placeholder="Full bio"
                      style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ marginTop: '0.9rem' }}>
                    <textarea
                      value={draft.achievementsText}
                      onChange={(event) =>
                        setDrafts((previous) => ({
                          ...previous,
                          [sensei.id]: { ...draft, achievementsText: event.target.value },
                        }))
                      }
                      placeholder="Achievements, one per line"
                      style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.9rem' }}>
                    {[
                      ['isActive', 'Active'],
                      ['isPublic', 'Public profile'],
                      ['isAssignable', 'Available in dropdowns'],
                      ['isExecutiveCommittee', 'Executive committee'],
                      ['isFounder', 'Founder'],
                    ].map(([key, label]) => (
                      <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#ddd' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(draft[key as keyof SenseiDraft])}
                          onChange={(event) =>
                            setDrafts((previous) => ({
                              ...previous,
                              [sensei.id]: {
                                ...draft,
                                [key]: event.target.checked,
                              },
                            }))
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '0.9rem 1rem',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.04)',
                    }}
                  >
                    <div
                      style={{
                        color: '#888',
                        fontSize: '0.78rem',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: '0.5rem',
                      }}
                    >
                      Branch Assignments
                    </div>
                    <div style={{ color: '#ddd', fontSize: '0.9rem' }}>
                      {sensei.assignments.length > 0
                        ? sensei.assignments
                            .map((assignment) => `${assignment.branchName} (${assignment.cityName})`)
                            .join(' • ')
                        : 'No branches linked yet.'}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
