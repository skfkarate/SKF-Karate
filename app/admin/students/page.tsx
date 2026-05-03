import type { CSSProperties } from 'react'
import Link from 'next/link'

import { getBelt } from '@/data/constants/belts'
import {
  buildAdminAthleteRecord,
  buildAthleteAutomationSummary,
} from '@/lib/admin/athlete-records'
import { requireAdminSession } from '@/lib/server/auth/session'
import { getAllAthletesLive } from '@/lib/server/repositories/athletes-live'

import { reactivateStudent } from './actions'
import StudentCsvImportClient from './StudentCsvImportClient'

export const dynamic = 'force-dynamic'

const PAGE_BG = '#050505'
const PANEL_BG = '#0b0b0b'
const BORDER = '#171717'

export default async function AdminStudentsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await requireAdminSession(['admin', 'instructor'])
  const canManage = session.user.role === 'admin' || session.user.role === 'instructor'
  const params = (await searchParams) || {}

  const allAthletes = await getAllAthletesLive()
  let athletes = allAthletes.map(buildAdminAthleteRecord)

  const query = String(params?.q || '').trim().toLowerCase()
  const branchFilter = String(params?.branch || '').trim()
  const stateFilter = String(params?.state || '').trim().toLowerCase()

  if (query) {
    athletes = athletes.filter((athlete) =>
      [athlete.displayName, athlete.skfId, athlete.branch, athlete.batch]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query)
    )
  }

  if (branchFilter) {
    athletes = athletes.filter((athlete) => athlete.branch === branchFilter)
  }

  if (stateFilter === 'public') {
    athletes = athletes.filter((athlete) => athlete.isPublic)
  } else if (stateFilter === 'private') {
    athletes = athletes.filter((athlete) => !athlete.isPublic)
  } else if (stateFilter === 'inactive') {
    athletes = athletes.filter((athlete) => athlete.status === 'Inactive')
  }

  const totalProfiles = allAthletes.length
  const inactiveCount = allAthletes.filter(
    (athlete) => String(athlete.status || '').toLowerCase() === 'inactive'
  ).length
  const publicCount = allAthletes.filter((athlete) => athlete.isPublic).length
  const featuredCount = allAthletes.filter((athlete) => athlete.isFeatured).length

  const branchOptions = Array.from(
    new Set(allAthletes.map((athlete) => String(athlete.branchName || '').trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: PAGE_BG,
        color: '#fff',
        paddingBottom: '4rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <header
        style={{
          borderBottom: `1px solid ${BORDER}`,
          padding: '2.25rem 2.5rem',
          background: '#000',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <span
              style={{
                color: '#666',
                fontSize: '0.8rem',
                fontFamily: 'monospace',
                letterSpacing: '0.1em',
                display: 'block',
                marginBottom: '0.9rem',
                textTransform: 'uppercase',
              }}
            >
              Training Network / Athletes
            </span>
            <h1 style={{ fontSize: '2.6rem', fontWeight: 500, margin: 0, letterSpacing: '-0.04em' }}>
              Athlete Profiles
            </h1>
            <p style={{ margin: '0.8rem 0 0', color: '#777', maxWidth: '780px', lineHeight: 1.6 }}>
              This is now the single live athlete directory. Identity, branch assignment, portal login,
              public profile visibility, rankings, and event-driven achievements all connect here.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
            {canManage ? <StudentCsvImportClient /> : null}
            {canManage ? (
              <Link
                href="/admin/students/new"
                style={{
                  background: '#fff',
                  color: '#000',
                  border: '1px solid #fff',
                  padding: '0.85rem 1.35rem',
                  textDecoration: 'none',
                  borderRadius: '999px',
                  fontWeight: 700,
                }}
              >
                Add Athlete
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      <div style={{ padding: '2rem 2.5rem', display: 'grid', gap: '1.5rem' }}>
        <div
          style={{
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          }}
        >
          {[
            ['Athletes', totalProfiles],
            ['Public Profiles', publicCount],
            ['Featured', featuredCount],
            ['Inactive', inactiveCount],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                padding: '1.15rem 1.2rem',
                border: `1px solid ${BORDER}`,
                background: PANEL_BG,
                borderRadius: '18px',
              }}
            >
              <div
                style={{
                  color: '#666',
                  fontSize: '0.74rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </div>
              <div style={{ marginTop: '0.55rem', fontSize: '2rem', fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            border: `1px solid ${BORDER}`,
            background: PANEL_BG,
            borderRadius: '20px',
            padding: '1.25rem',
          }}
        >
          <form
            style={{
              display: 'grid',
              gap: '0.9rem',
              gridTemplateColumns: 'minmax(240px, 1.6fr) repeat(2, minmax(180px, 0.9fr)) auto auto',
            }}
          >
            <input
              name="q"
              defaultValue={String(params?.q || '')}
              type="text"
              placeholder="Search athlete ID, name, branch, or batch"
              style={filterFieldStyle}
            />
            <select name="branch" defaultValue={branchFilter} style={filterFieldStyle}>
              <option value="">All Branches</option>
              {branchOptions.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
            <select name="state" defaultValue={stateFilter} style={filterFieldStyle}>
              <option value="">All States</option>
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="inactive">Inactive</option>
            </select>
            <button type="submit" style={primaryActionStyle}>
              Apply Filters
            </button>
            {query || branchFilter || stateFilter ? (
              <Link href="/admin/students" style={secondaryLinkStyle}>
                Clear
              </Link>
            ) : null}
          </form>
        </div>

        <div
          style={{
            border: `1px solid ${BORDER}`,
            background: PANEL_BG,
            borderRadius: '20px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(260px, 1.4fr) repeat(4, minmax(120px, 0.6fr)) minmax(220px, 1fr)',
              gap: '1rem',
              padding: '1rem 1.4rem',
              borderBottom: `1px solid ${BORDER}`,
              color: '#666',
              fontSize: '0.74rem',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            <span>Athlete</span>
            <span>Belt</span>
            <span>Branch</span>
            <span>Batch</span>
            <span>Automation</span>
            <span style={{ textAlign: 'right' }}>Actions</span>
          </div>

          {athletes.length === 0 ? (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#666' }}>
              No athlete profiles matched the current filters.
            </div>
          ) : (
            athletes.map((athlete) => {
              const beltInfo = getBelt(athlete.belt)
              const isInactive = athlete.status === 'Inactive'
              const automation = buildAthleteAutomationSummary(
                allAthletes.find((entry) => entry.skfId === athlete.skfId)
              )

              return (
                <div
                  key={athlete.skfId}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(260px, 1.4fr) repeat(4, minmax(120px, 0.6fr)) minmax(220px, 1fr)',
                    gap: '1rem',
                    padding: '1rem 1.4rem',
                    alignItems: 'center',
                    borderBottom: `1px solid ${BORDER}`,
                    opacity: isInactive ? 0.62 : 1,
                    background: isInactive ? 'rgba(214, 40, 40, 0.04)' : 'transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.95rem', minWidth: 0 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: '#111',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#888',
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {athlete.displayName.charAt(0)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: '0.98rem',
                          color: isInactive ? '#aaa' : '#fff',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {athlete.displayName}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.55rem',
                          flexWrap: 'wrap',
                          marginTop: '0.32rem',
                          color: '#666',
                          fontSize: '0.76rem',
                        }}
                      >
                        <span style={{ fontFamily: 'monospace' }}>{athlete.skfId}</span>
                        <span style={{ color: athlete.isPublic ? '#ffb703' : '#666' }}>
                          {athlete.isPublic ? 'PUBLIC' : 'PRIVATE'}
                        </span>
                        {athlete.isFeatured ? <span style={{ color: '#fff' }}>FEATURED</span> : null}
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.92rem', color: '#d3d3d3', textTransform: 'capitalize' }}>
                    {beltInfo?.label || athlete.belt}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#cfcfcf' }}>{athlete.branch || '—'}</div>
                  <div style={{ fontSize: '0.88rem', color: '#9c9c9c' }}>{athlete.batch || '—'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#9c9c9c', lineHeight: 1.6 }}>
                    {automation.achievementCount} synced entries
                    <br />
                    {automation.lifetimePoints} lifetime pts
                  </div>

                  <div style={{ display: 'flex', gap: '0.55rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    {isInactive ? (
                      <form
                        action={async () => {
                          'use server'
                          await reactivateStudent(athlete.skfId)
                        }}
                      >
                        <button type="submit" style={reactivateButtonStyle}>
                          Reactivate
                        </button>
                      </form>
                    ) : null}
                    {athlete.publicProfileHref ? (
                      <Link href={athlete.publicProfileHref} target="_blank" style={publicViewLinkStyle}>
                        Public View
                      </Link>
                    ) : null}
                    <Link href={`/admin/students/${athlete.skfId}/edit`} style={editLinkStyle}>
                      Edit
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

const filterFieldStyle: CSSProperties = {
  width: '100%',
  minWidth: 0,
  padding: '0.9rem 1rem',
  borderRadius: '14px',
  border: '1px solid #252525',
  background: '#050505',
  color: '#fff',
  outline: 'none',
  fontSize: '0.92rem',
}

const primaryActionStyle: CSSProperties = {
  padding: '0.9rem 1.2rem',
  borderRadius: '14px',
  border: 'none',
  background: '#fff',
  color: '#000',
  fontWeight: 700,
  cursor: 'pointer',
}

const secondaryLinkStyle: CSSProperties = {
  padding: '0.9rem 1.2rem',
  borderRadius: '14px',
  border: '1px solid #252525',
  background: '#050505',
  color: '#cfcfcf',
  textDecoration: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const editLinkStyle: CSSProperties = {
  color: '#fff',
  border: '1px solid #333',
  padding: '0.5rem 0.9rem',
  fontSize: '0.8rem',
  textDecoration: 'none',
  borderRadius: '999px',
}

const publicViewLinkStyle: CSSProperties = {
  color: '#ffb703',
  border: '1px solid rgba(255, 183, 3, 0.35)',
  padding: '0.5rem 0.9rem',
  fontSize: '0.8rem',
  textDecoration: 'none',
  borderRadius: '999px',
}

const reactivateButtonStyle: CSSProperties = {
  background: 'transparent',
  color: '#4caf50',
  border: '1px solid #2f7e45',
  padding: '0.5rem 0.9rem',
  fontSize: '0.8rem',
  borderRadius: '999px',
  cursor: 'pointer',
}
