import { NextResponse } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMocks = vi.hoisted(() => ({
  getAuthorizedApiSession: vi.fn(),
}))

const repositoryMocks = vi.hoisted(() => ({
  getEventByIdAdminLive: vi.fn(),
  updateEventRecordLive: vi.fn(),
  deleteEventRecordLive: vi.fn(),
}))

const syncMocks = vi.hoisted(() => ({
  clearSyncedEventArtifactsFromAthletes: vi.fn(),
}))

const apiMocks = vi.hoisted(() => ({
  readJsonBody: vi.fn(),
  createErrorResponse: vi.fn((error: any, fallbackMessage: string) =>
    NextResponse.json(
      { error: error?.message || fallbackMessage },
      { status: error?.status || 500 }
    )
  ),
}))

const validationMocks = vi.hoisted(() => ({
  validateEventPayload: vi.fn(),
  validateTournamentPayload: vi.fn(),
}))

const revalidationMocks = vi.hoisted(() => ({
  revalidateAthleteSitePaths: vi.fn(),
  revalidateEventSitePaths: vi.fn(),
  revalidateTournamentSitePaths: vi.fn(),
}))

vi.mock('@/lib/server/auth/session', () => ({
  getAuthorizedApiSession: authMocks.getAuthorizedApiSession,
}))

vi.mock('@/lib/server/repositories/events-live', () => ({
  getEventByIdAdminLive: repositoryMocks.getEventByIdAdminLive,
  updateEventRecordLive: repositoryMocks.updateEventRecordLive,
  deleteEventRecordLive: repositoryMocks.deleteEventRecordLive,
}))

vi.mock('@/lib/server/event-athlete-sync', () => ({
  clearSyncedEventArtifactsFromAthletes: syncMocks.clearSyncedEventArtifactsFromAthletes,
}))

vi.mock('@/lib/server/api', () => ({
  readJsonBody: apiMocks.readJsonBody,
  createErrorResponse: apiMocks.createErrorResponse,
}))

vi.mock('@/lib/server/validation', () => ({
  validateEventPayload: validationMocks.validateEventPayload,
  validateTournamentPayload: validationMocks.validateTournamentPayload,
}))

vi.mock('@/lib/server/revalidation', () => ({
  revalidateAthleteSitePaths: revalidationMocks.revalidateAthleteSitePaths,
  revalidateEventSitePaths: revalidationMocks.revalidateEventSitePaths,
  revalidateTournamentSitePaths: revalidationMocks.revalidateTournamentSitePaths,
}))

import { DELETE, PUT, PATCH } from '@/app/api/admin/events/[id]/route'

describe('/api/admin/events/[id]', () => {
  beforeEach(() => {
    authMocks.getAuthorizedApiSession.mockReset()
    repositoryMocks.getEventByIdAdminLive.mockReset()
    repositoryMocks.updateEventRecordLive.mockReset()
    repositoryMocks.deleteEventRecordLive.mockReset()
    syncMocks.clearSyncedEventArtifactsFromAthletes.mockReset()
    apiMocks.readJsonBody.mockReset()
    apiMocks.createErrorResponse.mockClear()
    validationMocks.validateEventPayload.mockReset()
    validationMocks.validateTournamentPayload.mockReset()
    revalidationMocks.revalidateAthleteSitePaths.mockReset()
    revalidationMocks.revalidateEventSitePaths.mockReset()
    revalidationMocks.revalidateTournamentSitePaths.mockReset()
  })

  it('returns 404 on update when the event does not exist', async () => {
    authMocks.getAuthorizedApiSession.mockResolvedValue({ user: { role: 'admin' } })
    repositoryMocks.getEventByIdAdminLive.mockResolvedValue(null)

    const response = await PUT(
      new Request('http://localhost/api/admin/events/evt_missing', {
        method: 'PUT',
        body: JSON.stringify({}),
      }),
      { params: { id: 'evt_missing' } }
    )

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Event not found' },
    })
  })

  it('merges partial standalone event updates through validation before persistence', async () => {
    const existing = {
      id: 'evt_1',
      type: 'camp',
      name: 'Summer Camp',
      slug: 'summer-camp',
      shortName: 'Summer Camp',
      status: 'upcoming',
      date: '2026-05-01',
      endDate: '',
      venue: '',
      city: '',
      state: 'Karnataka',
      description: '',
      coverImageUrl: '',
      affiliatedBody: '',
      hostingBranch: '',
      isPublished: false,
      isFeatured: false,
      isResultsPublished: true,
      participants: [],
      results: [],
      resultsAppliedAt: '',
    }
    const requestBody = {
      participants: [
        {
          id: 'p_1',
          athleteId: 'ath_1',
          athleteName: 'Asha Kumar',
          skfId: 'SKF24RJ001',
          branchName: 'Rajajinagar',
          belt: 'Brown',
        },
      ],
      isResultsPublished: false,
    }
    const validated = { ...existing, ...requestBody }
    const updated = { ...validated }

    authMocks.getAuthorizedApiSession.mockResolvedValue({ user: { role: 'admin' } })
    repositoryMocks.getEventByIdAdminLive.mockResolvedValue(existing)
    validationMocks.validateEventPayload.mockReturnValue(validated)
    repositoryMocks.updateEventRecordLive.mockResolvedValue(updated)

    const response = await PUT(
      new Request('http://localhost/api/admin/events/evt_1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
      }),
      { params: { id: 'evt_1' } }
    )

    expect(validationMocks.validateEventPayload).toHaveBeenCalledWith({
      ...existing,
      ...requestBody,
      id: 'evt_1',
    })
    expect(repositoryMocks.updateEventRecordLive).toHaveBeenCalledWith('evt_1', validated)
    expect(syncMocks.clearSyncedEventArtifactsFromAthletes).toHaveBeenCalledWith('evt_1')
    expect(revalidationMocks.revalidateEventSitePaths).toHaveBeenCalledWith(updated)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ success: true, event: updated })
  })

  it('validates tournament partial updates with the tournament validator and revalidates tournament paths', async () => {
    const existingTournament = {
      id: 'tour_1',
      type: 'tournament',
      name: 'Nationals',
      slug: 'nationals',
      shortName: 'Nationals',
      level: 'state',
      date: '2026-07-01',
      endDate: '',
      venue: 'Indoor Hall',
      city: 'Bengaluru',
      state: 'Karnataka',
      description: 'State event',
      coverImageUrl: '',
      totalParticipants: 100,
      skfParticipants: 10,
      affiliatedBody: '',
      status: 'upcoming',
      isPublished: false,
      isFeatured: false,
      participants: [],
      winners: [],
      results: [],
      resultsAppliedAt: '',
    }
    const requestBody = {
      participants: [
        {
          id: 'p_1',
          athleteName: 'Rohan Das',
          skfId: 'SKF24RJ002',
          branchName: 'Rajajinagar',
          belt: 'Brown Belt',
        },
      ],
    }
    const validated = { ...existingTournament, ...requestBody }
    const updated = { ...validated, type: 'tournament' }

    authMocks.getAuthorizedApiSession.mockResolvedValue({ user: { role: 'admin' } })
    repositoryMocks.getEventByIdAdminLive.mockResolvedValue(existingTournament)
    validationMocks.validateTournamentPayload.mockReturnValue(validated)
    repositoryMocks.updateEventRecordLive.mockResolvedValue(updated)

    const response = await PATCH(
      new Request('http://localhost/api/admin/events/tour_1', {
        method: 'PATCH',
        body: JSON.stringify(requestBody),
      }),
      { params: { id: 'tour_1' } }
    )

    expect(validationMocks.validateTournamentPayload).toHaveBeenCalledWith({
      ...existingTournament,
      ...requestBody,
      id: 'tour_1',
    })
    expect(revalidationMocks.revalidateTournamentSitePaths).toHaveBeenCalledWith(updated)
    expect(response.status).toBe(200)
  })

  it('clears synced achievements on delete and uses tournament revalidation when needed', async () => {
    const existingTournament = {
      id: 'tour_2',
      type: 'tournament',
      slug: 'district-open',
    }

    authMocks.getAuthorizedApiSession.mockResolvedValue({ user: { role: 'admin' } })
    repositoryMocks.getEventByIdAdminLive.mockResolvedValue(existingTournament)
    repositoryMocks.deleteEventRecordLive.mockResolvedValue(true)

    const response = await DELETE(
      new Request('http://localhost/api/admin/events/tour_2', { method: 'DELETE' }),
      { params: { id: 'tour_2' } }
    )

    expect(syncMocks.clearSyncedEventArtifactsFromAthletes).toHaveBeenCalledWith('tour_2')
    expect(revalidationMocks.revalidateTournamentSitePaths).toHaveBeenCalledWith(existingTournament)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ success: true })
  })
})
