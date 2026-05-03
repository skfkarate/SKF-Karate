'use client'

import Link from 'next/link'
import { useState } from 'react'

import { getApiErrorMessage } from '@/app/admin/_utils/apiErrors'
import type { Branch, City, School } from '@/lib/classesData'
import type { SenseiSummary } from '@/lib/types/sensei'

type CityDraft = {
  name: string
  slug: string
  state: string
  photo: string
}

type BranchDraft = {
  city: string
  name: string
  slug: string
  isHQ: boolean
  address: string
  phone: string
  whatsapp: string
  senseiId: string
  sensei: string
  senseiDan: string
  classDays: number[]
  classTime: string
  mapUrl: string
  photosText: string
  description: string
}

type SchoolDraft = {
  id: string
  city: string
  name: string
}

const weekdayOptions = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
]

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

function buildCityDraft(city: City): CityDraft {
  return {
    name: city.name,
    slug: city.slug,
    state: city.state,
    photo: city.photo,
  }
}

function buildBranchDraft(citySlug: string, branch: Branch): BranchDraft {
  return {
    city: citySlug,
    name: branch.name,
    slug: branch.slug,
    isHQ: Boolean(branch.isHQ),
    address: branch.address,
    phone: branch.phone,
    whatsapp: branch.whatsapp,
    senseiId: branch.senseiId || '',
    sensei: branch.sensei,
    senseiDan: branch.senseiDan,
    classDays: Array.isArray(branch.classDays) ? branch.classDays : [],
    classTime: branch.classTime,
    mapUrl: branch.mapUrl || '',
    photosText: Array.isArray(branch.photos) ? branch.photos.join(', ') : '',
    description: branch.description,
  }
}

function buildSchoolDraft(citySlug: string, school: School): SchoolDraft {
  return {
    id: school.id || slugify(`${citySlug}-${school.name}`),
    city: citySlug,
    name: school.name,
  }
}

function buildCityDraftMap(cities: City[]) {
  return Object.fromEntries(cities.map((city) => [city.slug, buildCityDraft(city)]))
}

function buildBranchDraftMap(cities: City[]) {
  return Object.fromEntries(
    cities.flatMap((city) =>
      city.branches.map((branch) => [branch.slug, buildBranchDraft(city.slug, branch)])
    )
  )
}

function buildSchoolDraftMap(cities: City[]) {
  return Object.fromEntries(
    cities.flatMap((city) =>
      city.schools.map((school) => [
        school.id || slugify(`${city.slug}-${school.name}`),
        buildSchoolDraft(city.slug, school),
      ])
    )
  )
}

function createEmptyCityDraft() {
  return {
    name: '',
    slug: '',
    state: 'Karnataka',
    photo: '/gallery/In Dojo.jpeg',
  }
}

function createEmptyBranchDraft(city: string): BranchDraft {
  return {
    city,
    name: '',
    slug: '',
    isHQ: false,
    address: '',
    phone: '+91 90199 71726',
    whatsapp: '919019971726',
    senseiId: '',
    sensei: 'Sensei to be announced',
    senseiDan: 'Lead Instructor',
    classDays: [2, 3, 5],
    classTime: '',
    mapUrl: '',
    photosText: '/gallery/In Dojo.jpeg',
    description: '',
  }
}

function createEmptySchoolDraft(city: string): SchoolDraft {
  return {
    id: '',
    city,
    name: '',
  }
}

function applySenseiSelection(draft: BranchDraft, sensei: SenseiSummary | null): BranchDraft {
  if (!sensei) {
    return {
      ...draft,
      senseiId: '',
      sensei: 'Sensei to be announced',
      senseiDan: 'Lead Instructor',
    }
  }

  return {
    ...draft,
    senseiId: sensei.id,
    sensei: sensei.name,
    senseiDan: sensei.dan || sensei.title || 'Lead Instructor',
  }
}

export default function ClassesAdminClient({
  initialCities,
  initialSenseis,
  canManage,
}: {
  initialCities: City[]
  initialSenseis: SenseiSummary[]
  canManage: boolean
}) {
  const [cities, setCities] = useState<City[]>(initialCities)
  const [senseis] = useState<SenseiSummary[]>(initialSenseis)
  const [cityDrafts, setCityDrafts] = useState<Record<string, CityDraft>>(() =>
    buildCityDraftMap(initialCities)
  )
  const [branchDrafts, setBranchDrafts] = useState<Record<string, BranchDraft>>(() =>
    buildBranchDraftMap(initialCities)
  )
  const [schoolDrafts, setSchoolDrafts] = useState<Record<string, SchoolDraft>>(() =>
    buildSchoolDraftMap(initialCities)
  )
  const [newCity, setNewCity] = useState<CityDraft>(createEmptyCityDraft())
  const [newBranches, setNewBranches] = useState<Record<string, BranchDraft>>({})
  const [newSchools, setNewSchools] = useState<Record<string, SchoolDraft>>({})
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [savingKey, setSavingKey] = useState('')
  const [selectedCitySlug, setSelectedCitySlug] = useState(initialCities[0]?.slug || '')

  const totalTrainingCentres = cities.reduce((count, city) => count + city.branches.length, 0)
  const totalSchools = cities.reduce((count, city) => count + city.schools.length, 0)
  const totalAssignableSenseis = senseis.filter((sensei) => sensei.isAssignable && sensei.isActive).length
  const assignableSenseis = senseis
    .filter((sensei) => sensei.isAssignable && sensei.isActive)
    .sort((a, b) => a.name.localeCompare(b.name))
  const activeCity =
    cities.find((city) => city.slug === selectedCitySlug) || cities[0] || null
  const visibleCities = activeCity ? [activeCity] : cities

  const syncCities = (nextCities: City[]) => {
    setCities(nextCities)
    setCityDrafts(buildCityDraftMap(nextCities))
    setBranchDrafts(buildBranchDraftMap(nextCities))
    setSchoolDrafts(buildSchoolDraftMap(nextCities))
    setNewBranches({})
    setNewSchools({})
  }

  const submitAction = async (key: string, body: Record<string, unknown>) => {
    setSavingKey(key)
    setStatus('')
    setError('')

    try {
      const response = await fetch('/api/admin/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(getApiErrorMessage(payload, 'Unable to update classes.'))
      }

      syncCities(Array.isArray(payload?.cities) ? payload.cities : [])
      setStatus('Classes updated successfully.')
      return true
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to update classes.'
      )
      return false
    } finally {
      setSavingKey('')
    }
  }

  const handleClassDayToggle = (
    source: 'existing' | 'new',
    key: string,
    day: number
  ) => {
    const setter = source === 'existing' ? setBranchDrafts : setNewBranches

    setter((previous) => {
      const current = previous[key] || (source === 'new' ? createEmptyBranchDraft(key) : null)
      if (!current) return previous

      const nextDays = current.classDays.includes(day)
        ? current.classDays.filter((entry) => entry !== day)
        : [...current.classDays, day].sort((a, b) => a - b)

      return {
        ...previous,
        [key]: {
          ...current,
          classDays: nextDays,
        },
      }
    })
  }

  const inputStyle = {
    width: '100%',
    padding: '0.8rem 0.9rem',
    background: '#050505',
    border: '1px solid #2a2a2a',
    color: '#fff',
    borderRadius: '8px',
    fontSize: '0.92rem',
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#050505', color: '#fff', paddingBottom: '4rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ borderBottom: '1px solid #111', padding: '2rem 2.5rem', background: '#000' }}>
        <p style={{ color: '#666', fontSize: '0.8rem', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '1rem', textTransform: 'uppercase' }}>
          Administration / Classes
        </p>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 400, margin: 0, letterSpacing: '-0.03em' }}>
          Classes Control Center
        </h1>
        <p style={{ color: '#888', maxWidth: '760px', margin: '0.9rem 0 0' }}>
          Manage cities, training centres, and schools from one place. Public classes pages, event branch lists, student registration, and trial booking now read from this catalog.
        </p>
        <div style={{ marginTop: '1rem' }}>
          <Link href="/admin/senseis" style={{ color: '#fff', textDecoration: 'underline', fontSize: '0.92rem', marginRight: '1rem' }}>
            Manage Sensei Directory
          </Link>
          <Link href="/admin/portal" style={{ color: '#fff', textDecoration: 'underline', fontSize: '0.92rem' }}>
            Manage Portal Content
          </Link>
        </div>
      </header>

      <div style={{ padding: '2rem 2.5rem', display: 'grid', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem' }}>
          {[
            { label: 'Cities', value: cities.length },
            { label: 'Training Centres', value: totalTrainingCentres },
            { label: 'Schools', value: totalSchools },
            { label: 'Assignable Senseis', value: totalAssignableSenseis },
          ].map((item) => (
            <div key={item.label} style={{ background: '#0b0b0b', border: '1px solid #171717', borderRadius: '14px', padding: '1.25rem' }}>
              <div style={{ color: '#666', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</div>
              <div style={{ fontSize: '2rem', marginTop: '0.4rem' }}>{item.value}</div>
            </div>
          ))}
        </div>

        {(status || error) && (
          <div style={{ padding: '1rem 1.1rem', borderRadius: '10px', border: `1px solid ${error ? '#5a2020' : '#1c3a29'}`, background: error ? 'rgba(120, 28, 28, 0.2)' : 'rgba(22, 101, 52, 0.18)', color: error ? '#fca5a5' : '#86efac' }}>
            {error || status}
          </div>
        )}

        {cities.length > 0 && (
          <section style={{ background: '#0b0b0b', border: '1px solid #171717', borderRadius: '16px', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 500 }}>City Workspace</h2>
                <p style={{ margin: '0.45rem 0 0', color: '#777', fontSize: '0.9rem' }}>
                  Focus on one city at a time, then manage its training centres, schools, linked Senseis, and portal-facing setup without a long mixed list.
                </p>
              </div>
              <select
                value={activeCity?.slug || ''}
                onChange={(event) => setSelectedCitySlug(event.target.value)}
                style={{ ...inputStyle, maxWidth: '260px' }}
              >
                {cities.map((city) => (
                  <option key={city.slug} value={city.slug}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            {activeCity ? (
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                <div style={{ background: '#070707', border: '1px solid #171717', borderRadius: '14px', padding: '1rem' }}>
                  <div style={{ color: '#666', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Training Centres</div>
                  <div style={{ fontSize: '1.8rem', marginTop: '0.4rem' }}>{activeCity.branches.length}</div>
                </div>
                <div style={{ background: '#070707', border: '1px solid #171717', borderRadius: '14px', padding: '1rem' }}>
                  <div style={{ color: '#666', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Schools</div>
                  <div style={{ fontSize: '1.8rem', marginTop: '0.4rem' }}>{activeCity.schools.length}</div>
                </div>
                <div style={{ background: '#070707', border: '1px solid #171717', borderRadius: '14px', padding: '1rem' }}>
                  <div style={{ color: '#666', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>State</div>
                  <div style={{ fontSize: '1.2rem', marginTop: '0.6rem' }}>{activeCity.state}</div>
                </div>
              </div>
            ) : null}
          </section>
        )}

        <section style={{ background: '#0b0b0b', border: '1px solid #171717', borderRadius: '16px', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 500 }}>Add City</h2>
              <p style={{ margin: '0.45rem 0 0', color: '#777', fontSize: '0.9rem' }}>Create a new city container before adding training centres or schools.</p>
            </div>
            <button
              type="button"
              disabled={!canManage || !!savingKey}
              onClick={() =>
                submitAction('create-city', {
                  entity: 'city',
                  operation: 'create',
                  payload: {
                    ...newCity,
                    slug: slugify(newCity.slug || newCity.name),
                    sortOrder: cities.length,
                  },
                }).then((success) => {
                  if (success) {
                    setNewCity(createEmptyCityDraft())
                  }
                })
              }
              style={{ background: '#fff', color: '#000', border: 'none', padding: '0.9rem 1.4rem', borderRadius: '8px', fontWeight: 600, cursor: canManage ? 'pointer' : 'not-allowed', opacity: canManage ? 1 : 0.55 }}
            >
              {savingKey === 'create-city' ? 'Saving...' : 'Create City'}
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem' }}>
            <input value={newCity.name} onChange={(event) => setNewCity((previous) => ({ ...previous, name: event.target.value, slug: previous.slug || slugify(event.target.value) }))} placeholder="City name" style={inputStyle} />
            <input value={newCity.slug} onChange={(event) => setNewCity((previous) => ({ ...previous, slug: slugify(event.target.value) }))} placeholder="city-slug" style={inputStyle} />
            <input value={newCity.state} onChange={(event) => setNewCity((previous) => ({ ...previous, state: event.target.value }))} placeholder="State" style={inputStyle} />
            <input value={newCity.photo} onChange={(event) => setNewCity((previous) => ({ ...previous, photo: event.target.value }))} placeholder="Photo URL" style={inputStyle} />
          </div>
        </section>

        {visibleCities.map((city) => {
          const cityDraft = cityDrafts[city.slug] || buildCityDraft(city)
          const pendingBranchDraft = newBranches[city.slug] || createEmptyBranchDraft(city.slug)
          const pendingSchoolDraft = newSchools[city.slug] || createEmptySchoolDraft(city.slug)

          return (
            <section key={city.slug} style={{ background: '#0b0b0b', border: '1px solid #171717', borderRadius: '18px', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 500 }}>{city.name}</h2>
                  <p style={{ margin: '0.45rem 0 0', color: '#777', fontSize: '0.9rem' }}>
                    {city.branches.length} training centre{city.branches.length === 1 ? '' : 's'} · {city.schools.length} school{city.schools.length === 1 ? '' : 's'}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    disabled={!canManage || !!savingKey}
                    onClick={() =>
                      submitAction(`city-${city.slug}`, {
                        entity: 'city',
                        operation: 'update',
                        slug: city.slug,
                        payload: cityDraft,
                      })
                    }
                    style={{ background: '#fff', color: '#000', border: 'none', padding: '0.8rem 1.2rem', borderRadius: '8px', fontWeight: 600, cursor: canManage ? 'pointer' : 'not-allowed', opacity: canManage ? 1 : 0.55 }}
                  >
                    {savingKey === `city-${city.slug}` ? 'Saving...' : 'Save City'}
                  </button>
                  <button
                    type="button"
                    disabled={!canManage || !!savingKey}
                    onClick={() => {
                      if (!confirm(`Delete ${city.name} and all linked training centres/schools?`)) return
                      void submitAction(`delete-city-${city.slug}`, {
                        entity: 'city',
                        operation: 'delete',
                        slug: city.slug,
                      })
                    }}
                    style={{ background: 'transparent', color: '#fca5a5', border: '1px solid #5a2020', padding: '0.8rem 1.2rem', borderRadius: '8px', cursor: canManage ? 'pointer' : 'not-allowed', opacity: canManage ? 1 : 0.55 }}
                  >
                    Delete City
                  </button>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <input value={cityDraft.name} onChange={(event) => setCityDrafts((previous) => ({ ...previous, [city.slug]: { ...cityDraft, name: event.target.value } }))} placeholder="City name" style={inputStyle} />
                <input value={cityDraft.slug} onChange={(event) => setCityDrafts((previous) => ({ ...previous, [city.slug]: { ...cityDraft, slug: slugify(event.target.value) } }))} placeholder="city-slug" style={inputStyle} />
                <input value={cityDraft.state} onChange={(event) => setCityDrafts((previous) => ({ ...previous, [city.slug]: { ...cityDraft, state: event.target.value } }))} placeholder="State" style={inputStyle} />
                <input value={cityDraft.photo} onChange={(event) => setCityDrafts((previous) => ({ ...previous, [city.slug]: { ...cityDraft, photo: event.target.value } }))} placeholder="Photo URL" style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ borderTop: '1px solid #171717', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 500 }}>Training Centres</h3>
                      <p style={{ margin: '0.35rem 0 0', color: '#777', fontSize: '0.88rem' }}>
                        These feed the public classes pages, trial booking, student registration,
                        event branch pickers, and live Sensei assignments.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {city.branches.map((branch) => {
                      const draft = branchDrafts[branch.slug] || buildBranchDraft(city.slug, branch)
                      return (
                        <div key={branch.slug} style={{ background: '#070707', border: '1px solid #171717', borderRadius: '14px', padding: '1rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                            <div>
                              <div style={{ fontSize: '1rem' }}>{branch.name}</div>
                              <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.3rem' }}>{branch.slug}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                              <button
                                type="button"
                                disabled={!canManage || !!savingKey}
                                onClick={() =>
                                  submitAction(`branch-${branch.slug}`, {
                                    entity: 'branch',
                                    operation: 'update',
                                    slug: branch.slug,
                                    citySlug: city.slug,
                                    payload: {
                                      ...draft,
                                      slug: slugify(draft.slug || draft.name),
                                      photos: draft.photosText.split(',').map((item) => item.trim()).filter(Boolean),
                                    },
                                  })
                                }
                                style={{ background: '#fff', color: '#000', border: 'none', padding: '0.72rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: canManage ? 'pointer' : 'not-allowed', opacity: canManage ? 1 : 0.55 }}
                              >
                                {savingKey === `branch-${branch.slug}` ? 'Saving...' : 'Save Centre'}
                              </button>
                              <button
                                type="button"
                                disabled={!canManage || !!savingKey}
                                onClick={() => {
                                  if (!confirm(`Delete ${branch.name}?`)) return
                                  void submitAction(`delete-branch-${branch.slug}`, {
                                    entity: 'branch',
                                    operation: 'delete',
                                    slug: branch.slug,
                                    citySlug: city.slug,
                                    branchSlug: branch.slug,
                                  })
                                }}
                                style={{ background: 'transparent', color: '#fca5a5', border: '1px solid #5a2020', padding: '0.72rem 1rem', borderRadius: '8px', cursor: canManage ? 'pointer' : 'not-allowed', opacity: canManage ? 1 : 0.55 }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.9rem' }}>
                            <input value={draft.name} onChange={(event) => setBranchDrafts((previous) => ({ ...previous, [branch.slug]: { ...draft, name: event.target.value, slug: draft.slug || slugify(event.target.value) } }))} placeholder="Centre name" style={inputStyle} />
                            <input value={draft.slug} onChange={(event) => setBranchDrafts((previous) => ({ ...previous, [branch.slug]: { ...draft, slug: slugify(event.target.value) } }))} placeholder="centre-slug" style={inputStyle} />
                            <input value={draft.phone} onChange={(event) => setBranchDrafts((previous) => ({ ...previous, [branch.slug]: { ...draft, phone: event.target.value } }))} placeholder="Phone" style={inputStyle} />
                            <input value={draft.whatsapp} onChange={(event) => setBranchDrafts((previous) => ({ ...previous, [branch.slug]: { ...draft, whatsapp: event.target.value } }))} placeholder="WhatsApp" style={inputStyle} />
                            <select
                              value={draft.senseiId}
                              onChange={(event) => {
                                const selectedSensei =
                                  assignableSenseis.find((sensei) => sensei.id === event.target.value) ||
                                  null
                                setBranchDrafts((previous) => ({
                                  ...previous,
                                  [branch.slug]: applySenseiSelection(draft, selectedSensei),
                                }))
                              }}
                              style={inputStyle}
                            >
                              <option value="">Sensei to be announced</option>
                              {assignableSenseis.map((sensei) => (
                                <option key={sensei.id} value={sensei.id}>
                                  {sensei.name} · {sensei.dan}
                                </option>
                              ))}
                            </select>
                            <input value={draft.senseiDan} readOnly placeholder="Sensei rank" style={{ ...inputStyle, color: '#bbb' }} />
                            <input value={draft.classTime} onChange={(event) => setBranchDrafts((previous) => ({ ...previous, [branch.slug]: { ...draft, classTime: event.target.value } }))} placeholder="Class time" style={inputStyle} />
                            <input value={draft.mapUrl} onChange={(event) => setBranchDrafts((previous) => ({ ...previous, [branch.slug]: { ...draft, mapUrl: event.target.value } }))} placeholder="Map URL" style={inputStyle} />
                          </div>

                          <div style={{ marginTop: '0.65rem', color: '#777', fontSize: '0.82rem' }}>
                            Lead Sensei: <strong style={{ color: '#ddd' }}>{draft.sensei}</strong>
                            {draft.senseiId
                              ? ' from the live Sensei directory'
                              : ' will remain unassigned until you select one'}
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '0.9rem', marginTop: '0.9rem' }}>
                            <input value={draft.address} onChange={(event) => setBranchDrafts((previous) => ({ ...previous, [branch.slug]: { ...draft, address: event.target.value } }))} placeholder="Venue / address" style={inputStyle} />
                            <input value={draft.photosText} onChange={(event) => setBranchDrafts((previous) => ({ ...previous, [branch.slug]: { ...draft, photosText: event.target.value } }))} placeholder="Photos CSV" style={inputStyle} />
                          </div>

                          <div style={{ marginTop: '0.9rem' }}>
                            <textarea value={draft.description} onChange={(event) => setBranchDrafts((previous) => ({ ...previous, [branch.slug]: { ...draft, description: event.target.value } }))} placeholder="Branch description" style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} />
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginTop: '0.9rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#ddd' }}>
                              <input type="checkbox" checked={draft.isHQ} onChange={(event) => setBranchDrafts((previous) => ({ ...previous, [branch.slug]: { ...draft, isHQ: event.target.checked } }))} />
                              HQ branch
                            </label>
                            {weekdayOptions.map((day) => (
                              <label key={day.value} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#888', fontSize: '0.88rem' }}>
                                <input type="checkbox" checked={draft.classDays.includes(day.value)} onChange={() => handleClassDayToggle('existing', branch.slug, day.value)} />
                                {day.label}
                              </label>
                            ))}
                          </div>
                        </div>
                      )
                    })}

                    <div style={{ background: '#070707', border: '1px dashed #262626', borderRadius: '14px', padding: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '1rem' }}>Add Training Centre</div>
                          <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '0.3rem' }}>New branch or training venue inside {city.name}</div>
                        </div>
                        <button
                          type="button"
                          disabled={!canManage || !!savingKey}
                          onClick={() =>
                            submitAction(`create-branch-${city.slug}`, {
                              entity: 'branch',
                              operation: 'create',
                              citySlug: city.slug,
                              payload: {
                                ...pendingBranchDraft,
                                slug: slugify(pendingBranchDraft.slug || pendingBranchDraft.name),
                                photos: pendingBranchDraft.photosText.split(',').map((item) => item.trim()).filter(Boolean),
                                sortOrder: city.branches.length,
                              },
                            }).then((success) => {
                              if (success) {
                                setNewBranches((previous) => ({
                                  ...previous,
                                  [city.slug]: createEmptyBranchDraft(city.slug),
                                }))
                              }
                            })
                          }
                          style={{ background: '#fff', color: '#000', border: 'none', padding: '0.72rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: canManage ? 'pointer' : 'not-allowed', opacity: canManage ? 1 : 0.55 }}
                        >
                          {savingKey === `create-branch-${city.slug}` ? 'Saving...' : 'Create Centre'}
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '0.9rem' }}>
                        <input value={pendingBranchDraft.name} onChange={(event) => setNewBranches((previous) => ({ ...previous, [city.slug]: { ...pendingBranchDraft, name: event.target.value, slug: pendingBranchDraft.slug || slugify(event.target.value) } }))} placeholder="Centre name" style={inputStyle} />
                        <input value={pendingBranchDraft.slug} onChange={(event) => setNewBranches((previous) => ({ ...previous, [city.slug]: { ...pendingBranchDraft, slug: slugify(event.target.value) } }))} placeholder="centre-slug" style={inputStyle} />
                        <input value={pendingBranchDraft.phone} onChange={(event) => setNewBranches((previous) => ({ ...previous, [city.slug]: { ...pendingBranchDraft, phone: event.target.value } }))} placeholder="Phone" style={inputStyle} />
                        <input value={pendingBranchDraft.whatsapp} onChange={(event) => setNewBranches((previous) => ({ ...previous, [city.slug]: { ...pendingBranchDraft, whatsapp: event.target.value } }))} placeholder="WhatsApp" style={inputStyle} />
                        <select
                          value={pendingBranchDraft.senseiId}
                          onChange={(event) => {
                            const selectedSensei =
                              assignableSenseis.find((sensei) => sensei.id === event.target.value) ||
                              null
                            setNewBranches((previous) => ({
                              ...previous,
                              [city.slug]: applySenseiSelection(pendingBranchDraft, selectedSensei),
                            }))
                          }}
                          style={inputStyle}
                        >
                          <option value="">Sensei to be announced</option>
                          {assignableSenseis.map((sensei) => (
                            <option key={sensei.id} value={sensei.id}>
                              {sensei.name} · {sensei.dan}
                            </option>
                          ))}
                        </select>
                        <input value={pendingBranchDraft.senseiDan} readOnly placeholder="Sensei rank" style={{ ...inputStyle, color: '#bbb' }} />
                        <input value={pendingBranchDraft.classTime} onChange={(event) => setNewBranches((previous) => ({ ...previous, [city.slug]: { ...pendingBranchDraft, classTime: event.target.value } }))} placeholder="Class time" style={inputStyle} />
                        <input value={pendingBranchDraft.mapUrl} onChange={(event) => setNewBranches((previous) => ({ ...previous, [city.slug]: { ...pendingBranchDraft, mapUrl: event.target.value } }))} placeholder="Map URL" style={inputStyle} />
                      </div>

                      <div style={{ marginTop: '0.65rem', color: '#777', fontSize: '0.82rem' }}>
                        Lead Sensei: <strong style={{ color: '#ddd' }}>{pendingBranchDraft.sensei}</strong>
                        {pendingBranchDraft.senseiId
                          ? ' from the live Sensei directory'
                          : ' will remain unassigned until you select one'}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr', gap: '0.9rem', marginTop: '0.9rem' }}>
                        <input value={pendingBranchDraft.address} onChange={(event) => setNewBranches((previous) => ({ ...previous, [city.slug]: { ...pendingBranchDraft, address: event.target.value } }))} placeholder="Venue / address" style={inputStyle} />
                        <input value={pendingBranchDraft.photosText} onChange={(event) => setNewBranches((previous) => ({ ...previous, [city.slug]: { ...pendingBranchDraft, photosText: event.target.value } }))} placeholder="Photos CSV" style={inputStyle} />
                      </div>

                      <div style={{ marginTop: '0.9rem' }}>
                        <textarea value={pendingBranchDraft.description} onChange={(event) => setNewBranches((previous) => ({ ...previous, [city.slug]: { ...pendingBranchDraft, description: event.target.value } }))} placeholder="Branch description" style={{ ...inputStyle, minHeight: '90px', resize: 'vertical' }} />
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginTop: '0.9rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#ddd' }}>
                          <input type="checkbox" checked={pendingBranchDraft.isHQ} onChange={(event) => setNewBranches((previous) => ({ ...previous, [city.slug]: { ...pendingBranchDraft, isHQ: event.target.checked } }))} />
                          HQ branch
                        </label>
                        {weekdayOptions.map((day) => (
                          <label key={day.value} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#888', fontSize: '0.88rem' }}>
                            <input type="checkbox" checked={pendingBranchDraft.classDays.includes(day.value)} onChange={() => handleClassDayToggle('new', city.slug, day.value)} />
                            {day.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #171717', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 500 }}>Schools</h3>
                      <p style={{ margin: '0.35rem 0 0', color: '#777', fontSize: '0.88rem' }}>Use schools for school-based karate programs inside the same city.</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gap: '1rem' }}>
                    {city.schools.map((school) => {
                      const schoolId = school.id || slugify(`${city.slug}-${school.name}`)
                      const draft = schoolDrafts[schoolId] || buildSchoolDraft(city.slug, school)
                      return (
                        <div key={schoolId} style={{ background: '#070707', border: '1px solid #171717', borderRadius: '14px', padding: '1rem' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto auto', gap: '0.9rem', alignItems: 'center' }}>
                            <input value={draft.name} onChange={(event) => setSchoolDrafts((previous) => ({ ...previous, [schoolId]: { ...draft, name: event.target.value, id: draft.id || slugify(`${city.slug}-${event.target.value}`) } }))} placeholder="School name" style={inputStyle} />
                            <input value={draft.id} onChange={(event) => setSchoolDrafts((previous) => ({ ...previous, [schoolId]: { ...draft, id: slugify(event.target.value) } }))} placeholder="school-id" style={inputStyle} />
                            <button
                              type="button"
                              disabled={!canManage || !!savingKey}
                              onClick={() =>
                                submitAction(`school-${schoolId}`, {
                                  entity: 'school',
                                  operation: 'update',
                                  id: schoolId,
                                  citySlug: city.slug,
                                  payload: draft,
                                })
                              }
                              style={{ background: '#fff', color: '#000', border: 'none', padding: '0.72rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: canManage ? 'pointer' : 'not-allowed', opacity: canManage ? 1 : 0.55 }}
                            >
                              {savingKey === `school-${schoolId}` ? 'Saving...' : 'Save'}
                            </button>
                            <button
                              type="button"
                              disabled={!canManage || !!savingKey}
                              onClick={() => {
                                if (!confirm(`Delete ${school.name}?`)) return
                                void submitAction(`delete-school-${schoolId}`, {
                                  entity: 'school',
                                  operation: 'delete',
                                  id: schoolId,
                                  citySlug: city.slug,
                                })
                              }}
                              style={{ background: 'transparent', color: '#fca5a5', border: '1px solid #5a2020', padding: '0.72rem 1rem', borderRadius: '8px', cursor: canManage ? 'pointer' : 'not-allowed', opacity: canManage ? 1 : 0.55 }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )
                    })}

                    <div style={{ background: '#070707', border: '1px dashed #262626', borderRadius: '14px', padding: '1rem' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr auto', gap: '0.9rem', alignItems: 'center' }}>
                        <input value={pendingSchoolDraft.name} onChange={(event) => setNewSchools((previous) => ({ ...previous, [city.slug]: { ...pendingSchoolDraft, name: event.target.value, id: pendingSchoolDraft.id || slugify(`${city.slug}-${event.target.value}`) } }))} placeholder="School name" style={inputStyle} />
                        <input value={pendingSchoolDraft.id} onChange={(event) => setNewSchools((previous) => ({ ...previous, [city.slug]: { ...pendingSchoolDraft, id: slugify(event.target.value) } }))} placeholder="school-id" style={inputStyle} />
                        <button
                          type="button"
                          disabled={!canManage || !!savingKey}
                          onClick={() =>
                            submitAction(`create-school-${city.slug}`, {
                              entity: 'school',
                              operation: 'create',
                              citySlug: city.slug,
                              payload: {
                                ...pendingSchoolDraft,
                                id: slugify(pendingSchoolDraft.id || `${city.slug}-${pendingSchoolDraft.name}`),
                                sortOrder: city.schools.length,
                              },
                            }).then((success) => {
                              if (success) {
                                setNewSchools((previous) => ({
                                  ...previous,
                                  [city.slug]: createEmptySchoolDraft(city.slug),
                                }))
                              }
                            })
                          }
                          style={{ background: '#fff', color: '#000', border: 'none', padding: '0.72rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: canManage ? 'pointer' : 'not-allowed', opacity: canManage ? 1 : 0.55 }}
                        >
                          {savingKey === `create-school-${city.slug}` ? 'Saving...' : 'Create School'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
