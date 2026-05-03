'use client'

import type { CSSProperties } from 'react'
import { useMemo, useState } from 'react'

import { getApiErrorMessage } from '@/app/admin/_utils/apiErrors'
import { flattenClassBranches } from '@/lib/classes/catalog'
import type { City } from '@/lib/classesData'
import type {
  BranchTimetableRecord,
  PortalVideoRecord,
} from '@/lib/server/repositories/portal-content-live'
import { extractYouTubeId } from '@/lib/youtube'
import YouTubeThumbnail from '@/components/video/YouTubeThumbnail'

const VIDEO_CATEGORIES = [
  { value: 'techniques', label: 'Techniques' },
  { value: 'kata', label: 'Kata' },
  { value: 'kumite', label: 'Kumite' },
  { value: 'bunkai', label: 'Bunkai' },
  { value: 'fitness', label: 'Conditioning' },
  { value: 'seminar', label: 'Seminar' },
]

const BELT_OPTIONS = ['white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black']

type VideoDraft = {
  id: string
  title: string
  description: string
  category: string
  durationLabel: string
  youtubeInput: string
  youtubeId: string
  branchSlugs: string[]
  batchNamesText: string
  beltLevels: string[]
  isFeatured: boolean
  isPublished: boolean
  showInTechniques: boolean
  sortOrder: number
}

type TimetableDraft = {
  id: string
  branchSlug: string
  title: string
  driveUrl: string
  imageUrl: string
  monthLabel: string
  effectiveFrom: string
  effectiveTo: string
  notes: string
  isActive: boolean
}

function buildEmptyVideoDraft(): VideoDraft {
  return {
    id: '',
    title: '',
    description: '',
    category: 'techniques',
    durationLabel: '',
    youtubeInput: '',
    youtubeId: '',
    branchSlugs: [],
    batchNamesText: '',
    beltLevels: [],
    isFeatured: false,
    isPublished: true,
    showInTechniques: false,
    sortOrder: 0,
  }
}

function buildVideoDraft(video: PortalVideoRecord): VideoDraft {
  return {
    id: video.id,
    title: video.title,
    description: video.description,
    category: video.category,
    durationLabel: video.durationLabel,
    youtubeInput: video.youtubeId,
    youtubeId: video.youtubeId,
    branchSlugs: video.branchSlugs,
    batchNamesText: video.batchNames.join(', '),
    beltLevels: video.beltLevels,
    isFeatured: video.isFeatured,
    isPublished: video.isPublished,
    showInTechniques: video.showInTechniques,
    sortOrder: video.sortOrder,
  }
}

function buildEmptyTimetableDraft(branchSlug = ''): TimetableDraft {
  return {
    id: '',
    branchSlug,
    title: 'Official Timetable',
    driveUrl: '',
    imageUrl: '',
    monthLabel: '',
    effectiveFrom: '',
    effectiveTo: '',
    notes: '',
    isActive: true,
  }
}

function buildTimetableDraft(timetable: BranchTimetableRecord): TimetableDraft {
  return {
    id: timetable.id,
    branchSlug: timetable.branchSlug,
    title: timetable.title,
    driveUrl: timetable.driveUrl,
    imageUrl: timetable.imageUrl,
    monthLabel: timetable.monthLabel,
    effectiveFrom: timetable.effectiveFrom,
    effectiveTo: timetable.effectiveTo,
    notes: timetable.notes,
    isActive: timetable.isActive,
  }
}

function parseCommaList(value: string) {
  return value
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
}

function applyYouTubeInput(current: VideoDraft, value: string): VideoDraft {
  return {
    ...current,
    youtubeInput: value,
    youtubeId: extractYouTubeId(value) || '',
  }
}

function fieldStyle() {
  return {
    width: '100%',
    padding: '0.85rem 0.95rem',
    background: '#050505',
    border: '1px solid #262626',
    color: '#fff',
    borderRadius: '12px',
    fontSize: '0.92rem',
  }
}

function SectionHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string
  title: string
  subtitle: string
}) {
  return (
    <div style={{ marginBottom: '1.2rem' }}>
      <div style={{ color: '#666', fontSize: '0.76rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {eyebrow}
      </div>
      <h2 style={{ margin: '0.45rem 0 0', fontSize: '1.4rem', fontWeight: 600 }}>{title}</h2>
      <p style={{ margin: '0.55rem 0 0', color: '#7c7c7c', lineHeight: 1.6 }}>{subtitle}</p>
    </div>
  )
}

export default function PortalContentAdminClient({
  initialCities,
  initialVideos,
  initialTimetables,
}: {
  initialCities: City[]
  initialVideos: PortalVideoRecord[]
  initialTimetables: BranchTimetableRecord[]
}) {
  const branchOptions = useMemo(() => flattenClassBranches(initialCities), [initialCities])
  const [activeTab, setActiveTab] = useState<'videos' | 'timetables'>('videos')
  const [videos, setVideos] = useState(initialVideos)
  const [timetables, setTimetables] = useState(initialTimetables)
  const [videoDraft, setVideoDraft] = useState<VideoDraft>(buildEmptyVideoDraft())
  const [timetableDraft, setTimetableDraft] = useState<TimetableDraft>(buildEmptyTimetableDraft(branchOptions[0]?.slug || ''))
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [busyKey, setBusyKey] = useState('')

  const publishedVideoCount = videos.filter((video) => video.isPublished).length
  const featuredVideoCount = videos.filter((video) => video.isFeatured).length
  const techniqueLibraryCount = videos.filter((video) => video.showInTechniques).length
  const activeTimetableCount = timetables.filter((entry) => entry.isActive).length

  const submitAction = async (body: Record<string, unknown>, successMessage: string) => {
    const payloadId =
      body.payload && typeof body.payload === 'object' && 'id' in body.payload
        ? String((body.payload as { id?: string }).id || '')
        : ''
    setBusyKey(String(body.entity) + ':' + String(body.operation) + ':' + String(body.id || payloadId || 'new'))
    setStatus('')
    setError('')

    try {
      const response = await fetch('/api/admin/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(getApiErrorMessage(payload, 'Unable to update portal content.'))
      }

      setVideos(Array.isArray(payload?.videos) ? payload.videos : [])
      setTimetables(Array.isArray(payload?.timetables) ? payload.timetables : [])
      setStatus(successMessage)
      return true
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to update portal content.'
      )
      return false
    } finally {
      setBusyKey('')
    }
  }

  const handleVideoSubmit = async () => {
    if (!videoDraft.youtubeId) {
      setStatus('')
      setError('Paste a valid YouTube URL or 11-character video ID before saving.')
      return
    }

    const success = await submitAction(
      {
        entity: 'video',
        operation: videoDraft.id ? 'update' : 'create',
        id: videoDraft.id || undefined,
        payload: {
          ...videoDraft,
          youtubeId: videoDraft.youtubeId,
          batchNames: parseCommaList(videoDraft.batchNamesText),
        },
      },
      videoDraft.id ? 'Home practice video updated.' : 'Home practice video created.'
    )

    if (success) {
      setVideoDraft(buildEmptyVideoDraft())
    }
  }

  const handleTimetableSubmit = async () => {
    const success = await submitAction(
      {
        entity: 'timetable',
        operation: timetableDraft.id ? 'update' : 'create',
        id: timetableDraft.id || undefined,
        payload: timetableDraft,
      },
      timetableDraft.id ? 'Timetable updated.' : 'Timetable created.'
    )

    if (success) {
      setTimetableDraft(buildEmptyTimetableDraft(branchOptions[0]?.slug || ''))
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#050505',
        color: '#fff',
        paddingBottom: '4rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <header style={{ borderBottom: '1px solid #111', padding: '2.2rem 2.5rem', background: '#000' }}>
        <p style={{ color: '#666', fontSize: '0.8rem', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '1rem', textTransform: 'uppercase' }}>
          Athlete Portal / Operations
        </p>
        <h1 style={{ fontSize: '2.6rem', fontWeight: 500, margin: 0, letterSpacing: '-0.04em' }}>
          Portal Content Studio
        </h1>
        <p style={{ color: '#888', maxWidth: '860px', margin: '0.9rem 0 0', lineHeight: 1.6 }}>
          Control YouTube-backed home-practice videos, the public technique library, and branch timetables from one place.
          Visibility is managed by branch, batch, and belt while playback stays inside your own SKF experience.
        </p>
      </header>

      <div style={{ padding: '2rem 2.5rem', display: 'grid', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          {[
            ['Published Videos', publishedVideoCount],
            ['Featured Videos', featuredVideoCount],
            ['Technique Library', techniqueLibraryCount],
            ['Branch Timetables', timetables.length],
            ['Active Timetables', activeTimetableCount],
          ].map(([label, value]) => (
            <div key={label} style={{ background: '#0b0b0b', border: '1px solid #171717', borderRadius: '18px', padding: '1.1rem 1.2rem' }}>
              <div style={{ color: '#666', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
              <div style={{ marginTop: '0.55rem', fontSize: '2rem', fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>

        {(status || error) ? (
          <div
            style={{
              padding: '1rem 1.1rem',
              borderRadius: '16px',
              border: `1px solid ${error ? '#5a2020' : '#1c3a29'}`,
              background: error ? 'rgba(120, 28, 28, 0.2)' : 'rgba(22, 101, 52, 0.18)',
              color: error ? '#fca5a5' : '#86efac',
            }}
          >
            {error || status}
          </div>
        ) : null}

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveTab('videos')} style={tabStyle(activeTab === 'videos')}>
            Home Practice
          </button>
          <button onClick={() => setActiveTab('timetables')} style={tabStyle(activeTab === 'timetables')}>
            Timetables
          </button>
        </div>

        {activeTab === 'videos' ? (
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'minmax(340px, 0.95fr) minmax(0, 1.25fr)' }}>
            <section style={panelStyle}>
              <SectionHeader
                eyebrow={videoDraft.id ? 'Edit Video' : 'New Video'}
                title={videoDraft.id ? 'Update Home Practice' : 'Create Home Practice'}
                subtitle="Paste a YouTube URL or 11-character video ID. SKF stores only the ID, derives the thumbnail automatically, and plays it through the custom in-platform player."
              />

              <div style={{ display: 'grid', gap: '0.9rem' }}>
                <input value={videoDraft.title} onChange={(event) => setVideoDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Video title" style={fieldStyle()} />
                <textarea value={videoDraft.description} onChange={(event) => setVideoDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Short description" rows={4} style={fieldStyle()} />
                <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                  <select value={videoDraft.category} onChange={(event) => setVideoDraft((current) => ({ ...current, category: event.target.value }))} style={fieldStyle()}>
                    {VIDEO_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  <input value={videoDraft.durationLabel} onChange={(event) => setVideoDraft((current) => ({ ...current, durationLabel: event.target.value }))} placeholder="Duration label" style={fieldStyle()} />
                </div>
                <input
                  value={videoDraft.youtubeInput}
                  onChange={(event) => setVideoDraft((current) => applyYouTubeInput(current, event.target.value))}
                  placeholder="YouTube URL or 11-character video ID"
                  style={fieldStyle()}
                />
                <div style={subPanelStyle}>
                  <div style={subPanelHeadingStyle}>YouTube Preview</div>
                  {videoDraft.youtubeId ? (
                    <div style={{ display: 'grid', gap: '0.8rem' }}>
                      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', borderRadius: '14px', background: '#000' }}>
                        <YouTubeThumbnail
                          youtubeId={videoDraft.youtubeId}
                          alt="YouTube thumbnail preview"
                          fill
                          sizes="(max-width: 768px) 100vw, 420px"
                          style={{ objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ color: '#8a8a8a', fontSize: '0.82rem' }}>
                        Stored ID: <span style={{ color: '#ffcf70', fontFamily: 'monospace' }}>{videoDraft.youtubeId}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#fca5a5', fontSize: '0.84rem', lineHeight: 1.7 }}>
                      Paste a valid YouTube URL or ID to preview the thumbnail.
                    </div>
                  )}
                </div>
                <input value={videoDraft.batchNamesText} onChange={(event) => setVideoDraft((current) => ({ ...current, batchNamesText: event.target.value }))} placeholder="Visible batches (comma separated, leave blank for all)" style={fieldStyle()} />

                <div style={subPanelStyle}>
                  <div style={subPanelHeadingStyle}>Visible Branches</div>
                  <div style={chipGridStyle}>
                    {branchOptions.map((branch) => {
                      const selected = videoDraft.branchSlugs.includes(branch.slug)
                      return (
                        <label key={branch.slug} style={chipLabelStyle(selected)}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(event) =>
                              setVideoDraft((current) => ({
                                ...current,
                                branchSlugs: event.target.checked
                                  ? [...current.branchSlugs, branch.slug]
                                  : current.branchSlugs.filter((value) => value !== branch.slug),
                              }))
                            }
                            style={{ display: 'none' }}
                          />
                          {branch.name}
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div style={subPanelStyle}>
                  <div style={subPanelHeadingStyle}>Visible Belt Levels</div>
                  <div style={chipGridStyle}>
                    {BELT_OPTIONS.map((belt) => {
                      const selected = videoDraft.beltLevels.includes(belt)
                      return (
                        <label key={belt} style={chipLabelStyle(selected)}>
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={(event) =>
                              setVideoDraft((current) => ({
                                ...current,
                                beltLevels: event.target.checked
                                  ? [...current.beltLevels, belt]
                                  : current.beltLevels.filter((value) => value !== belt),
                              }))
                            }
                            style={{ display: 'none' }}
                          />
                          {belt.charAt(0).toUpperCase() + belt.slice(1)}
                        </label>
                      )
                    })}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                  <input type="number" value={videoDraft.sortOrder} onChange={(event) => setVideoDraft((current) => ({ ...current, sortOrder: Number(event.target.value || 0) }))} placeholder="Sort order" style={fieldStyle()} />
                  <input value={videoDraft.youtubeId} readOnly placeholder="Extracted YouTube ID" style={{ ...fieldStyle(), color: videoDraft.youtubeId ? '#ffcf70' : '#777', fontFamily: 'monospace' }} />
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <label style={toggleLabelStyle}>
                    <input type="checkbox" checked={videoDraft.isPublished} onChange={(event) => setVideoDraft((current) => ({ ...current, isPublished: event.target.checked }))} />
                    Published to portal
                  </label>
                  <label style={toggleLabelStyle}>
                    <input type="checkbox" checked={videoDraft.isFeatured} onChange={(event) => setVideoDraft((current) => ({ ...current, isFeatured: event.target.checked }))} />
                    Feature in hero lane
                  </label>
                  <label style={toggleLabelStyle}>
                    <input type="checkbox" checked={videoDraft.showInTechniques} onChange={(event) => setVideoDraft((current) => ({ ...current, showInTechniques: event.target.checked }))} />
                    Show in public Technique Library
                  </label>
                </div>

                {videoDraft.showInTechniques ? (
                  <div style={{ ...subPanelStyle, borderColor: '#3d2c12', background: 'rgba(61,44,18,0.25)' }}>
                    <div style={{ color: '#ffd89a', fontSize: '0.84rem', lineHeight: 1.7 }}>
                      Public Technique Library videos must stay global. Leave branch and batch visibility blank so they can safely appear on the public site.
                    </div>
                  </div>
                ) : null}

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button type="button" onClick={handleVideoSubmit} disabled={busyKey.startsWith('video:')} style={primaryButtonStyle}>
                    {videoDraft.id ? 'Save Video' : 'Create Video'}
                  </button>
                  {videoDraft.id ? (
                    <button type="button" onClick={() => setVideoDraft(buildEmptyVideoDraft())} style={secondaryButtonStyle}>
                      Clear Editor
                    </button>
                  ) : null}
                </div>
              </div>
            </section>

            <section style={panelStyle}>
              <SectionHeader
                eyebrow="Live Library"
                title="Published & Draft Videos"
                subtitle="Each entry shows the current audience rules so you can confirm exactly who sees each home-practice video."
              />

              <div style={{ display: 'grid', gap: '0.9rem' }}>
                {videos.length === 0 ? (
                  <div style={emptyStateStyle}>No portal videos configured yet.</div>
                ) : (
                  videos.map((video) => (
                    <div key={video.id} style={rowCardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                          <div style={{ position: 'relative', width: '140px', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden', background: '#000', flexShrink: 0 }}>
                            <YouTubeThumbnail
                              youtubeId={video.youtubeId}
                              alt={video.title}
                              fill
                              sizes="140px"
                              style={{ objectFit: 'cover' }}
                            />
                          </div>
                          <div>
                          <div style={{ fontSize: '1rem', fontWeight: 600 }}>{video.title}</div>
                          <div style={{ marginTop: '0.35rem', color: '#7c7c7c', fontSize: '0.86rem', lineHeight: 1.6 }}>
                            {video.description || 'No description added yet.'}
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
                            {badge(video.category)}
                            {video.isPublished ? badge('Published', '#194d33', '#baf7cf') : badge('Draft', '#3d2c12', '#ffcc7a')}
                            {video.isFeatured ? badge('Featured', '#332011', '#ffd89a') : null}
                            {video.showInTechniques ? badge('Technique Library', '#1a2e4d', '#b7d7ff') : null}
                          </div>
                          <div style={{ marginTop: '0.9rem', color: '#8a8a8a', fontSize: '0.82rem', lineHeight: 1.7 }}>
                            Branches: {video.branchSlugs.length ? video.branchSlugs.join(', ') : 'All'}
                            <br />
                            Batches: {video.batchNames.length ? video.batchNames.join(', ') : 'All'}
                            <br />
                            Belts: {video.beltLevels.length ? video.beltLevels.join(', ') : 'All'}
                            <br />
                            YouTube ID: <span style={{ fontFamily: 'monospace', color: '#b7b7b7' }}>{video.youtubeId}</span>
                          </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <button type="button" onClick={() => setVideoDraft(buildVideoDraft(video))} style={secondaryButtonStyle}>
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              submitAction(
                                { entity: 'video', operation: 'delete', id: video.id },
                                'Home practice video removed.'
                              )
                            }
                            style={dangerButtonStyle}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'minmax(340px, 0.95fr) minmax(0, 1.25fr)' }}>
            <section style={panelStyle}>
              <SectionHeader
                eyebrow={timetableDraft.id ? 'Edit Timetable' : 'New Timetable'}
                title={timetableDraft.id ? 'Update Branch Timetable' : 'Create Branch Timetable'}
                subtitle="Attach the branch’s live Drive asset and optional preview image. The athlete portal will always show the active timetable for the branch."
              />

              <div style={{ display: 'grid', gap: '0.9rem' }}>
                <select value={timetableDraft.branchSlug} onChange={(event) => setTimetableDraft((current) => ({ ...current, branchSlug: event.target.value }))} style={fieldStyle()}>
                  <option value="">Select branch</option>
                  {branchOptions.map((branch) => (
                    <option key={branch.slug} value={branch.slug}>
                      {branch.name} — {branch.cityName}
                    </option>
                  ))}
                </select>
                <input value={timetableDraft.title} onChange={(event) => setTimetableDraft((current) => ({ ...current, title: event.target.value }))} placeholder="Timetable title" style={fieldStyle()} />
                <input value={timetableDraft.driveUrl} onChange={(event) => setTimetableDraft((current) => ({ ...current, driveUrl: event.target.value }))} placeholder="Drive share link or image URL" style={fieldStyle()} />
                <input value={timetableDraft.imageUrl} onChange={(event) => setTimetableDraft((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="Preview image URL (optional)" style={fieldStyle()} />
                <input value={timetableDraft.monthLabel} onChange={(event) => setTimetableDraft((current) => ({ ...current, monthLabel: event.target.value }))} placeholder="Month / term label" style={fieldStyle()} />
                <div style={{ display: 'grid', gap: '0.9rem', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}>
                  <input type="date" value={timetableDraft.effectiveFrom} onChange={(event) => setTimetableDraft((current) => ({ ...current, effectiveFrom: event.target.value }))} style={fieldStyle()} />
                  <input type="date" value={timetableDraft.effectiveTo} onChange={(event) => setTimetableDraft((current) => ({ ...current, effectiveTo: event.target.value }))} style={fieldStyle()} />
                </div>
                <textarea value={timetableDraft.notes} onChange={(event) => setTimetableDraft((current) => ({ ...current, notes: event.target.value }))} placeholder="Optional notes shown in the portal" rows={4} style={fieldStyle()} />
                <label style={toggleLabelStyle}>
                  <input type="checkbox" checked={timetableDraft.isActive} onChange={(event) => setTimetableDraft((current) => ({ ...current, isActive: event.target.checked }))} />
                  Active timetable
                </label>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button type="button" onClick={handleTimetableSubmit} disabled={busyKey.startsWith('timetable:')} style={primaryButtonStyle}>
                    {timetableDraft.id ? 'Save Timetable' : 'Create Timetable'}
                  </button>
                  {timetableDraft.id ? (
                    <button type="button" onClick={() => setTimetableDraft(buildEmptyTimetableDraft(branchOptions[0]?.slug || ''))} style={secondaryButtonStyle}>
                      Clear Editor
                    </button>
                  ) : null}
                </div>
              </div>
            </section>

            <section style={panelStyle}>
              <SectionHeader
                eyebrow="Branch Schedule"
                title="Timetable Assignments"
                subtitle="Each branch can keep current and historical timetable records, but only active records surface in the athlete portal."
              />

              <div style={{ display: 'grid', gap: '0.9rem' }}>
                {timetables.length === 0 ? (
                  <div style={emptyStateStyle}>No branch timetables configured yet.</div>
                ) : (
                  timetables.map((timetable) => {
                    const branch = branchOptions.find((option) => option.slug === timetable.branchSlug)
                    return (
                      <div key={timetable.id} style={rowCardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' }}>
                          <div>
                            <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                              {branch?.name || timetable.branchSlug}
                            </div>
                            <div style={{ marginTop: '0.35rem', color: '#7c7c7c', fontSize: '0.86rem', lineHeight: 1.6 }}>
                              {timetable.title}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.8rem' }}>
                              {timetable.isActive ? badge('Active', '#194d33', '#baf7cf') : badge('Inactive', '#3d2c12', '#ffcc7a')}
                              {timetable.monthLabel ? badge(timetable.monthLabel, '#161f34', '#9fc1ff') : null}
                            </div>
                            <div style={{ marginTop: '0.9rem', color: '#8a8a8a', fontSize: '0.82rem', lineHeight: 1.7 }}>
                              Effective: {timetable.effectiveFrom || 'Immediate'} to {timetable.effectiveTo || 'Until replaced'}
                              <br />
                              {timetable.notes || 'No portal notes added.'}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '0.55rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setTimetableDraft(buildTimetableDraft(timetable))} style={secondaryButtonStyle}>
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                submitAction(
                                  { entity: 'timetable', operation: 'delete', id: timetable.id },
                                  'Branch timetable removed.'
                                )
                              }
                              style={dangerButtonStyle}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

const panelStyle: CSSProperties = {
  background: '#0b0b0b',
  border: '1px solid #171717',
  borderRadius: '22px',
  padding: '1.35rem',
}

const subPanelStyle: CSSProperties = {
  border: '1px solid #1d1d1d',
  borderRadius: '16px',
  padding: '1rem',
  background: '#060606',
}

const subPanelHeadingStyle: CSSProperties = {
  marginBottom: '0.8rem',
  color: '#9b9b9b',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
}

const chipGridStyle: CSSProperties = {
  display: 'flex',
  gap: '0.55rem',
  flexWrap: 'wrap',
}

function chipLabelStyle(selected: boolean): CSSProperties {
  return {
    padding: '0.5rem 0.75rem',
    borderRadius: '999px',
    border: `1px solid ${selected ? 'rgba(255,183,3,0.35)' : '#2a2a2a'}`,
    background: selected ? 'rgba(255,183,3,0.08)' : '#0b0b0b',
    color: selected ? '#ffcf70' : '#d5d5d5',
    cursor: 'pointer',
    fontSize: '0.82rem',
  }
}

function tabStyle(active: boolean): CSSProperties {
  return {
    padding: '0.75rem 1.2rem',
    borderRadius: '999px',
    border: `1px solid ${active ? 'rgba(255,183,3,0.35)' : '#252525'}`,
    background: active ? 'rgba(255,183,3,0.08)' : '#0b0b0b',
    color: active ? '#ffcf70' : '#d3d3d3',
    cursor: 'pointer',
    fontWeight: 600,
  }
}

const toggleLabelStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  color: '#ececec',
}

const primaryButtonStyle: CSSProperties = {
  padding: '0.88rem 1.2rem',
  borderRadius: '999px',
  border: 'none',
  background: '#fff',
  color: '#000',
  fontWeight: 700,
  cursor: 'pointer',
}

const secondaryButtonStyle: CSSProperties = {
  padding: '0.72rem 1rem',
  borderRadius: '999px',
  border: '1px solid #2a2a2a',
  background: '#050505',
  color: '#d7d7d7',
  cursor: 'pointer',
}

const dangerButtonStyle: CSSProperties = {
  padding: '0.72rem 1rem',
  borderRadius: '999px',
  border: '1px solid rgba(214, 40, 40, 0.35)',
  background: 'rgba(214, 40, 40, 0.08)',
  color: '#ff9a9a',
  cursor: 'pointer',
}

const emptyStateStyle: CSSProperties = {
  border: '1px dashed #2a2a2a',
  borderRadius: '18px',
  padding: '2rem',
  textAlign: 'center',
  color: '#777',
}

const rowCardStyle: CSSProperties = {
  border: '1px solid #1c1c1c',
  borderRadius: '18px',
  background: '#070707',
  padding: '1rem',
}

function badge(label: string, background = '#161616', color = '#d5d5d5') {
  return (
    <span
      style={{
        padding: '0.3rem 0.65rem',
        borderRadius: '999px',
        background,
        color,
        fontSize: '0.75rem',
        fontWeight: 600,
      }}
    >
      {label}
    </span>
  )
}
