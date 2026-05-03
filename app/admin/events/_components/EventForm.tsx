'use client'

import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

import { getEventLabel } from '@/data/constants/categories'
import type { City } from '@/lib/classesData'
import { flattenClassBranches } from '@/lib/classes/catalog'
import { EVENT_STATUSES } from '@/lib/types/event'
import { getApiErrorMessage } from '@/app/admin/_utils/apiErrors'

type SubmitMode = 'stay' | 'continue' | 'draft' | 'publish'
type RedirectTab = 'details' | 'athletes' | 'results'

type EventFormData = {
  id?: string
  name: string
  shortName: string
  slug: string
  type: string
  hostingBranch: string
  status: string
  date: string
  endDate: string
  venue: string
  city: string
  state: string
  description: string
  coverImageUrl: string
  affiliatedBody: string
  isPublished: boolean
  isFeatured: boolean
  isResultsPublished: boolean
  showInJourney: boolean
}

type EventFieldChange = ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export default function EventForm({
  initialData,
  isEdit = false,
  classCities = [],
  redirectTab = 'details',
}: {
  initialData?: Partial<EventFormData>
  isEdit?: boolean
  classCities?: City[]
  redirectTab?: RedirectTab
}) {
  const router = useRouter()
  const [categories, setCategories] = useState<string[]>([])
  const [newCategoryStr, setNewCategoryStr] = useState('')
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [availableCities, setAvailableCities] = useState<City[]>(classCities)
  const [feedback, setFeedback] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [loadingMode, setLoadingMode] = useState<SubmitMode | null>(null)

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    shortName: initialData?.shortName || '',
    slug: initialData?.slug || '',
    type: initialData?.type || 'seminar',
    hostingBranch: initialData?.hostingBranch || '',
    status: initialData?.status || 'draft',
    date: initialData?.date || '',
    endDate: initialData?.endDate || '',
    venue: initialData?.venue || '',
    city: initialData?.city || '',
    state: initialData?.state || 'Karnataka',
    description: initialData?.description || '',
    coverImageUrl: initialData?.coverImageUrl || '',
    affiliatedBody: initialData?.affiliatedBody || '',
    isPublished: initialData?.isPublished ?? false,
    isFeatured: initialData?.isFeatured ?? false,
    isResultsPublished: initialData?.isResultsPublished ?? false,
    showInJourney: initialData?.showInJourney ?? false,
  })

  const classBranches = flattenClassBranches(availableCities)

  const branchOptions = useMemo(() => {
    const mappedOptions = classBranches.map((branch) => ({
      key: `${branch.citySlug}-${branch.slug}`,
      slug: branch.slug,
      value: branch.name,
      label: `${branch.name} (${branch.cityName})`,
      city: branch.cityName,
      state: branch.state,
      venue: branch.venue,
    }))

    if (
      !formData.hostingBranch ||
      mappedOptions.some(
        (branch) =>
          branch.value === formData.hostingBranch || branch.slug === formData.hostingBranch
      )
    ) {
      return mappedOptions
    }

    return [
      {
        key: `custom-${slugify(formData.hostingBranch) || 'branch'}`,
        slug: slugify(formData.hostingBranch) || 'custom-branch',
        value: formData.hostingBranch,
        label: `${formData.hostingBranch} (Existing custom branch)`,
        city: formData.city,
        state: formData.state || 'Karnataka',
        venue: formData.venue || formData.hostingBranch,
      },
      ...mappedOptions,
    ]
  }, [classBranches, formData.city, formData.hostingBranch, formData.state, formData.venue])

  const visibleCategories = useMemo(() => {
    const all = new Set(categories)
    if (formData.type && formData.type !== 'tournament') {
      all.add(formData.type)
    }
    return [...all]
  }, [categories, formData.type])

  useEffect(() => {
    if (availableCities.length > 0) return

    let isMounted = true

    fetch('/api/admin/classes')
      .then((res) => res.json())
      .then((data) => {
        if (!isMounted || !Array.isArray(data?.cities)) return
        setAvailableCities(data.cities)
      })
      .catch((error) => {
        console.error('Failed to load classes for event form:', error)
      })

    return () => {
      isMounted = false
    }
  }, [availableCities.length])

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data?.categories)) return
        setCategories(
          data.categories.filter((category: string) => category !== 'tournament')
        )
      })
      .catch((error) => {
        console.error('Failed to load event categories:', error)
      })
  }, [])

  useEffect(() => {
    if (!formData.hostingBranch || classBranches.length === 0) return

    const selectedBranch = classBranches.find(
      (branch) =>
        branch.name === formData.hostingBranch || branch.slug === formData.hostingBranch
    )

    if (!selectedBranch || formData.type === 'tournament') return

    const id = window.setTimeout(() => setFormData((previous) => {
      const nextVenue = previous.venue || selectedBranch.venue
      const nextCity = previous.city || selectedBranch.cityName
      const nextState = previous.state || selectedBranch.state || 'Karnataka'

      if (
        nextVenue === previous.venue &&
        nextCity === previous.city &&
        nextState === previous.state &&
        previous.hostingBranch === selectedBranch.name
      ) {
        return previous
      }

      return {
        ...previous,
        hostingBranch: selectedBranch.name,
        venue: nextVenue,
        city: nextCity,
        state: nextState,
      }
    }), 0)
    return () => window.clearTimeout(id)
  }, [classBranches, formData.hostingBranch, formData.type])

  const handleChange = (event: EventFieldChange) => {
    const target = event.target
    const { name, value } = target
    const isCheckbox = target instanceof HTMLInputElement && target.type === 'checkbox'
    setErrorMessage('')

    setFormData((previous) => {
      if (name === 'name') {
        const currentAutoSlug = slugify(previous.name)
        const currentAutoShortName = previous.shortName || previous.name
        const shouldSyncSlug = !previous.slug || previous.slug === currentAutoSlug
        const shouldSyncShortName =
          !previous.shortName || previous.shortName === currentAutoShortName

        return {
          ...previous,
          name: value,
          shortName: shouldSyncShortName ? value : previous.shortName,
          slug: shouldSyncSlug ? slugify(value) : previous.slug,
        }
      }

      if (name === 'slug') {
        return {
          ...previous,
          slug: slugify(value),
        }
      }

      if (name === 'hostingBranch') {
        const selectedBranch = branchOptions.find((branch) => branch.value === value)
        if (!selectedBranch || previous.type === 'tournament') {
          return {
            ...previous,
            hostingBranch: value,
          }
        }

        return {
          ...previous,
          hostingBranch: value,
          venue: selectedBranch.venue,
          city: selectedBranch.city,
          state: selectedBranch.state || previous.state || 'Karnataka',
        }
      }

      if (name === 'type' && value === 'tournament') {
        return previous
      }

      return {
        ...previous,
        [name]: isCheckbox ? target.checked : value,
      }
    })
  }

  const handleCreateCategory = async () => {
    if (!newCategoryStr.trim()) return
    if (slugify(newCategoryStr) === 'tournament') {
      alert('Tournaments are managed from the Tournament Results section.')
      return
    }

    setIsAddingCategory(true)
    try {
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCategoryStr }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(getApiErrorMessage(payload, 'Unable to create category'))
      }

      const payload = await response.json()
      setCategories(
        payload.categories.filter((category: string) => category !== 'tournament')
      )
      setFormData((previous) => ({
        ...previous,
        type: slugify(newCategoryStr),
      }))
      setNewCategoryStr('')
    } catch (error) {
      console.error(error)
      alert('Failed to create category')
    } finally {
      setIsAddingCategory(false)
    }
  }

  const persistEvent = async (mode: SubmitMode) => {
    setLoadingMode(mode)
    setFeedback('')
    setErrorMessage('')

    try {
      const url = isEdit ? `/api/admin/events/${initialData.id}` : '/api/admin/events'
      const method = isEdit ? 'PUT' : 'POST'

      const payload = {
        ...formData,
        shortName: formData.shortName.trim() || formData.name.trim(),
        slug: formData.slug.trim() || slugify(formData.name),
      }

      if (mode === 'draft') {
        payload.status = 'draft'
        payload.isPublished = false
      }

      if (mode === 'publish') {
        payload.isPublished = true
        if (payload.status === 'draft') {
          payload.status = 'upcoming'
        }
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const responsePayload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(getApiErrorMessage(responsePayload, 'Something went wrong'))
      }

      const savedEvent = responsePayload?.event
      if (!savedEvent?.id) {
        throw new Error('Event saved, but the server response did not include the event id.')
      }
      const successMessage =
        mode === 'draft'
          ? 'Draft saved.'
          : mode === 'publish'
            ? 'Event saved and published.'
            : 'Core details saved.'

      setFeedback(successMessage)

      if (mode === 'continue') {
        router.push(`/admin/events/${savedEvent.id}?tab=athletes`)
        router.refresh()
        return
      }

      router.push(`/admin/events/${savedEvent.id}?tab=${redirectTab}`)
      router.refresh()
    } catch (error) {
      console.error(error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save event')
    } finally {
      setLoadingMode(null)
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await persistEvent('stay')
  }

  const inputStyle = {
    width: '100%',
    padding: '0.8rem 0.95rem',
    background: '#0a0a0a',
    border: '1px solid #232323',
    color: '#fff',
    borderRadius: '12px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    marginTop: '0.45rem',
  }

  const sectionStyle = {
    display: 'grid',
    gap: '1rem',
    padding: '1.1rem',
    borderRadius: '18px',
    border: '1px solid #151515',
    background: '#070707',
  }

  const isBusy = loadingMode !== null

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ maxWidth: '720px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 500 }}>Core Event Details</h3>
          <p style={{ margin: '0.55rem 0 0', color: '#7f7f7f', lineHeight: 1.6 }}>
            Save this record as a draft, keep refining details, or move directly into athlete assignment. Publishing publicly only affects the website. Athlete-profile history updates only happen after outcomes are published.
          </p>
        </div>

        <div style={{ display: 'grid', gap: '0.35rem', color: '#8a8a8a', fontSize: '0.82rem' }}>
          <span>Status: {formData.status}</span>
          <span>Visibility: {formData.isPublished ? 'Public' : 'Internal only'}</span>
          <span>Results visibility: {formData.isResultsPublished ? 'Public page enabled' : 'Internal only'}</span>
        </div>
      </div>

      {feedback ? (
        <div style={{ padding: '0.9rem 1rem', borderRadius: '14px', border: '1px solid rgba(16,185,129,0.22)', background: 'rgba(16,185,129,0.08)', color: '#93e6c1' }}>
          {feedback}
        </div>
      ) : null}

      {errorMessage ? (
        <div style={{ padding: '0.9rem 1rem', borderRadius: '14px', border: '1px solid rgba(255,107,107,0.24)', background: 'rgba(255,107,107,0.08)', color: '#ffb0b0' }}>
          {errorMessage}
        </div>
      ) : null}

      <section style={sectionStyle}>
        <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#707070' }}>
          Identity
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr 1fr', gap: '1rem' }}>
          <Field label="Event Name *">
            <input
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={inputStyle}
              placeholder="e.g. Summer Camp 2026"
            />
          </Field>

          <Field label="Short Name">
            <input
              name="shortName"
              value={formData.shortName}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Compact label for cards"
            />
          </Field>

          <Field label="URL Slug">
            <input
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Auto-generated if blank"
            />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <Field label="Event Category *">
            <div style={{ display: 'grid', gap: '0.55rem' }}>
              <select
                required
                name="type"
                value={formData.type}
                onChange={handleChange}
                style={{ ...inputStyle, WebkitAppearance: 'none' }}
              >
                {visibleCategories.map((category) => (
                  <option key={category} value={category}>
                    {getEventLabel(category)}
                  </option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  value={newCategoryStr}
                  onChange={(event) => setNewCategoryStr(event.target.value)}
                  style={{ ...inputStyle, marginTop: 0, flex: 1, padding: '0.65rem 0.75rem' }}
                  placeholder="Create custom event type"
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={isAddingCategory || !newCategoryStr.trim()}
                  style={secondaryButtonStyle(Boolean(isAddingCategory || !newCategoryStr.trim()))}
                >
                  {isAddingCategory ? 'Adding…' : 'Add'}
                </button>
              </div>
            </div>
          </Field>

          <Field label="Workflow Status">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{ ...inputStyle, WebkitAppearance: 'none' }}
            >
              {EVENT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/-/g, ' ')}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Hosting Branch">
            <select
              name="hostingBranch"
              value={formData.hostingBranch}
              onChange={handleChange}
              style={{ ...inputStyle, WebkitAppearance: 'none' }}
            >
              <option value="">Select from live classes branches</option>
              {branchOptions.map((branch) => (
                <option key={branch.key} value={branch.value}>
                  {branch.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#707070' }}>
          Schedule & Venue
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <Field label="Start Date *">
            <input
              required
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              style={inputStyle}
            />
          </Field>

          <Field label="End Date">
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              style={inputStyle}
            />
          </Field>

          <Field label="Venue">
            <input
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Auto-filled from branch or enter manually"
            />
          </Field>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="City">
            <input
              name="city"
              value={formData.city}
              onChange={handleChange}
              style={inputStyle}
              placeholder="e.g. Bengaluru"
            />
          </Field>

          <Field label="State">
            <input
              name="state"
              value={formData.state}
              onChange={handleChange}
              style={inputStyle}
              placeholder="e.g. Karnataka"
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
            placeholder="Describe the event, what athletes should expect, and any operational notes."
          />
        </Field>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Cover Image URL">
            <input
              name="coverImageUrl"
              value={formData.coverImageUrl}
              onChange={handleChange}
              style={inputStyle}
              placeholder="/gallery/Training.jpeg or https://..."
            />
          </Field>

          <Field label="Affiliated Body">
            <input
              name="affiliatedBody"
              value={formData.affiliatedBody}
              onChange={handleChange}
              style={inputStyle}
              placeholder="e.g. SKF, KIO, WKF"
            />
          </Field>
        </div>
      </section>

      <section style={sectionStyle}>
        <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#707070' }}>
          Publication Controls
        </div>

        <ToggleField
          checked={formData.isPublished}
          name="isPublished"
          onChange={handleChange}
          title="Publish Event publicly"
          description="This makes the event visible on the public website, including the Events page and the public event detail page."
        />

        <ToggleField
          checked={formData.isFeatured}
          name="isFeatured"
          onChange={handleChange}
          title="Mark as Featured"
          description="This highlights the event on featured event surfaces. It does not publish the event by itself."
        />

        <ToggleField
          checked={formData.showInJourney}
          name="showInJourney"
          onChange={handleChange}
          title="Show in Athlete Journey"
          description="This lets assigned athletes see this event as a milestone in their portal journey timeline."
        />

        <ToggleField
          checked={formData.isResultsPublished}
          name="isResultsPublished"
          onChange={handleChange}
          title="Show Results & Participants Publicly"
          description="This controls whether the public event page shows assigned athletes and results. Athlete-profile syncing is still a separate publish step."
          accent="#10b981"
        />
      </section>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', paddingTop: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => persistEvent('draft')}
            style={secondaryButtonStyle(isBusy)}
          >
            {loadingMode === 'draft' ? 'Saving draft…' : 'Save Draft'}
          </button>

          <button
            type="submit"
            disabled={isBusy}
            style={primaryButtonStyle(isBusy)}
          >
            {loadingMode === 'stay'
              ? 'Saving…'
              : isEdit
                ? 'Save Core Details'
                : 'Create Event Record'}
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={() => persistEvent('continue')}
            style={secondaryButtonStyle(isBusy)}
          >
            {loadingMode === 'continue' ? 'Saving…' : 'Save & Continue to Athletes'}
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={() => persistEvent('publish')}
            style={publishButtonStyle(isBusy)}
          >
            {loadingMode === 'publish' ? 'Publishing…' : 'Save & Publish Publicly'}
          </button>
        </div>

        <Link
          href={isEdit && initialData?.id ? `/admin/events/${initialData.id}?tab=details` : '/admin/events'}
          style={{
            padding: '0.8rem 1.25rem',
            borderRadius: '12px',
            border: '1px solid #2a2a2a',
            color: '#d8d8d8',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            background: '#080808',
          }}
        >
          Back
        </Link>
      </div>
    </form>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label style={{ display: 'grid', gap: '0.1rem' }}>
      <span style={{ fontSize: '0.84rem', color: '#8a8a8a' }}>{label}</span>
      {children}
    </label>
  )
}

function ToggleField({
  checked,
  name,
  onChange,
  title,
  description,
  accent = '#ffffff',
}: {
  checked: boolean
  name: string
  onChange: (event: EventFieldChange) => void
  title: string
  description: string
  accent?: string
}) {
  return (
    <label style={{ display: 'grid', gap: '0.4rem', cursor: 'pointer', fontSize: '0.9rem', color: '#d8d8d8' }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          style={{ width: '1.05rem', height: '1.05rem', cursor: 'pointer', accentColor: accent }}
        />
        {title}
      </span>
      <span style={{ color: '#757575', fontSize: '0.8rem', lineHeight: 1.5 }}>{description}</span>
    </label>
  )
}

function primaryButtonStyle(disabled: boolean) {
  return {
    background: disabled ? '#b7b7b7' : '#fff',
    color: '#000',
    border: 'none',
    padding: '0.8rem 1.25rem',
    borderRadius: '12px',
    cursor: disabled ? 'wait' : 'pointer',
    fontWeight: 700,
  }
}

function secondaryButtonStyle(disabled: boolean) {
  return {
    background: '#101010',
    color: disabled ? '#6d6d6d' : '#f3f3f3',
    border: '1px solid #2a2a2a',
    padding: '0.8rem 1.05rem',
    borderRadius: '12px',
    cursor: disabled ? 'wait' : 'pointer',
    fontWeight: 600,
  }
}

function publishButtonStyle(disabled: boolean) {
  return {
    background: disabled ? '#0f3d2f' : '#10b981',
    color: '#fff',
    border: 'none',
    padding: '0.8rem 1.15rem',
    borderRadius: '12px',
    cursor: disabled ? 'wait' : 'pointer',
    fontWeight: 700,
  }
}
