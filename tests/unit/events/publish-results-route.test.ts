import { NextResponse } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMocks = vi.hoisted(() => ({
  getAuthorizedApiSession: vi.fn(),
}))

const repositoryMocks = vi.hoisted(() => ({
  getEventByIdAdminLive: vi.fn(),
  updateEventRecordLive: vi.fn(),
}))

const syncMocks = vi.hoisted(() => ({
  syncStandaloneEventResultsToAthletes: vi.fn(),
  syncTournamentResultsToAthletes: vi.fn(),
}))

const apiMocks = vi.hoisted(() => ({
  createErrorResponse: vi.fn((error: any, fallbackMessage: string) =>
    NextResponse.json(
      { error: error?.message || fallbackMessage },
      { status: error?.status || 500 }
    )
  ),
}))

const revalidationMocks = vi.hoisted(() => ({
  revalidateEventSitePaths: vi.fn(),
  revalidateTournamentSitePaths: vi.fn(),
}))

vi.mock('@/lib/server/auth/session', () => ({
  getAuthorizedApiSession: authMocks.getAuthorizedApiSession,
}))

vi.mock('@/lib/server/repositories/events-live', () => ({
  getEventByIdAdminLive: repositoryMocks.getEventByIdAdminLive,
  updateEventRecordLive: repositoryMocks.updateEventRecordLive,
}))

vi.mock('@/lib/server/event-athlete-sync', () => ({
  syncStandaloneEventResultsToAthletes: syncMocks.syncStandaloneEventResultsToAthletes,
  syncTournamentResultsToAthletes: syncMocks.syncTournamentResultsToAthletes,
}))

vi.mock('@/lib/server/api', () => ({
  createErrorResponse: apiMocks.createErrorResponse,
}))

vi.mock('@/lib/server/revalidation', () => ({
  revalidateEventSitePaths: revalidationMocks.revalidateEventSitePaths,
  revalidateTournamentSitePaths: revalidationMocks.revalidateTournamentSitePaths,
}))

import { POST } from '@/app/api/admin/events/[id]/publish-results/route'

describe('/api/admin/events/[id]/publish-results', () => {
  beforeEach(() => {
    authMocks.getAuthorizedApiSession.mockReset()
    repositoryMocks.getEventByIdAdminLive.mockReset()
    repositoryMocks.updateEventRecordLive.mockReset()
    syncMocks.syncStandaloneEventResultsToAthletes.mockReset()
    syncMocks.syncTournamentResultsToAthletes.mockReset()
    apiMocks.createErrorResponse.mockClear()
    revalidationMocks.revalidateEventSitePaths.mockReset()
    revalidationMocks.revalidateTournamentSitePaths.mockReset()
  })

  it('returns 404 when the event is missing', async () => {
    authMocks.getAuthorizedApiSession.mockResolvedValue({ user: { role: 'admin' } })
    repositoryMocks.getEventByIdAdminLive.mockResolvedValue(null)

    const response = await POST(
      new Request('http://localhost/api/admin/events/evt_missing/publish-results', { method: 'POST' }),
      { params: { id: 'evt_missing' } }
    )

    expect(response.status).toBe(404)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Event not found' },
    })
  })

  it('refuses to publish when no results have been recorded', async () => {
    authMocks.getAuthorizedApiSession.mockResolvedValue({ user: { role: 'admin' } })
    repositoryMocks.getEventByIdAdminLive.mockResolvedValue({
      id: 'evt_1',
      slug: 'camp',
      type: 'camp',
      results: [],
    })

    const response = await POST(
      new Request('http://localhost/api/admin/events/evt_1/publish-results', { method: 'POST' }),
      { params: { id: 'evt_1' } }
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: { results: ['No results recorded to publish.'] },
      },
    })
  })

  it('publishes standalone event results to athlete profiles and revalidates event paths', async () => {
    const event = {
      id: 'evt_2',
      slug: 'summer-camp',
      type: 'camp',
      results: [{ id: 'res_1' }],
    }
    const updatedEvent = {
      ...event,
      isResultsPublished: true,
    }
    const syncSummary = { updatedAthletes: 2 }

    authMocks.getAuthorizedApiSession.mockResolvedValue({ user: { role: 'admin' } })
    repositoryMocks.getEventByIdAdminLive.mockResolvedValue(event)
    syncMocks.syncStandaloneEventResultsToAthletes.mockResolvedValue(syncSummary)
    repositoryMocks.updateEventRecordLive.mockResolvedValue(updatedEvent)

    const response = await POST(
      new Request('http://localhost/api/admin/events/evt_2/publish-results', { method: 'POST' }),
      { params: { id: 'evt_2' } }
    )

    expect(syncMocks.syncStandaloneEventResultsToAthletes).toHaveBeenCalledWith(event)
    expect(repositoryMocks.updateEventRecordLive).toHaveBeenCalledWith(
      'evt_2',
      expect.objectContaining({
        isResultsPublished: true,
      })
    )
    expect(revalidationMocks.revalidateEventSitePaths).toHaveBeenCalledWith(updatedEvent)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      event: updatedEvent,
      syncSummary,
    })
  })

  it('publishes tournament results through the tournament sync path and revalidates result pages', async () => {
    const tournament = {
      id: 'tour_1',
      slug: 'district-open',
      type: 'tournament',
      results: [{ id: 'res_1' }],
      winners: [{ id: 'winner_1' }],
    }
    const syncSummary = { updatedAthletes: 1 }

    authMocks.getAuthorizedApiSession.mockResolvedValue({ user: { role: 'admin' } })
    repositoryMocks.getEventByIdAdminLive.mockResolvedValue(tournament)
    syncMocks.syncTournamentResultsToAthletes.mockResolvedValue(syncSummary)
    repositoryMocks.updateEventRecordLive.mockResolvedValue(tournament)

    const response = await POST(
      new Request('http://localhost/api/admin/events/tour_1/publish-results', { method: 'POST' }),
      { params: { id: 'tour_1' } }
    )

    expect(syncMocks.syncTournamentResultsToAthletes).toHaveBeenCalledWith(tournament)
    expect(revalidationMocks.revalidateTournamentSitePaths).toHaveBeenCalledWith(tournament)
    expect(response.status).toBe(200)
  })
})
