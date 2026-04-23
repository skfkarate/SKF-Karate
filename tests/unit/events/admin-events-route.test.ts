import { NextResponse } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMocks = vi.hoisted(() => ({
  getAuthorizedApiSession: vi.fn(),
}))

const repositoryMocks = vi.hoisted(() => ({
  createEventRecordLive: vi.fn(),
  getAllEventsAdminLive: vi.fn(),
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
  revalidateEventSitePaths: vi.fn(),
  revalidateTournamentSitePaths: vi.fn(),
}))

vi.mock('@/lib/server/auth/session', () => ({
  getAuthorizedApiSession: authMocks.getAuthorizedApiSession,
}))

vi.mock('@/lib/server/repositories/events-live', () => ({
  createEventRecordLive: repositoryMocks.createEventRecordLive,
  getAllEventsAdminLive: repositoryMocks.getAllEventsAdminLive,
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
  revalidateEventSitePaths: revalidationMocks.revalidateEventSitePaths,
  revalidateTournamentSitePaths: revalidationMocks.revalidateTournamentSitePaths,
}))

import { GET, POST } from '@/app/api/admin/events/route'

describe('/api/admin/events', () => {
  beforeEach(() => {
    authMocks.getAuthorizedApiSession.mockReset()
    repositoryMocks.createEventRecordLive.mockReset()
    repositoryMocks.getAllEventsAdminLive.mockReset()
    apiMocks.readJsonBody.mockReset()
    apiMocks.createErrorResponse.mockClear()
    validationMocks.validateEventPayload.mockReset()
    validationMocks.validateTournamentPayload.mockReset()
    revalidationMocks.revalidateEventSitePaths.mockReset()
    revalidationMocks.revalidateTournamentSitePaths.mockReset()
  })

  it('rejects unauthorized create requests', async () => {
    authMocks.getAuthorizedApiSession.mockResolvedValue(null)

    const response = await POST(new Request('http://localhost/api/admin/events', { method: 'POST' }))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' })
  })

  it('creates standalone events with validated payloads and revalidates event paths', async () => {
    const requestBody = { name: 'Summer Camp', type: 'camp' }
    const validatedPayload = { ...requestBody, slug: 'summer-camp', date: '2026-05-01' }
    const createdEvent = { id: 'evt_1', type: 'camp', slug: 'summer-camp' }

    authMocks.getAuthorizedApiSession.mockResolvedValue({ user: { role: 'admin' } })
    apiMocks.readJsonBody.mockResolvedValue(requestBody)
    validationMocks.validateEventPayload.mockReturnValue(validatedPayload)
    repositoryMocks.createEventRecordLive.mockResolvedValue(createdEvent)

    const response = await POST(new Request('http://localhost/api/admin/events', { method: 'POST' }))

    expect(validationMocks.validateEventPayload).toHaveBeenCalledWith(requestBody)
    expect(repositoryMocks.createEventRecordLive).toHaveBeenCalledWith(validatedPayload)
    expect(revalidationMocks.revalidateEventSitePaths).toHaveBeenCalledWith(createdEvent)
    expect(revalidationMocks.revalidateTournamentSitePaths).not.toHaveBeenCalled()
    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({ success: true, event: createdEvent })
  })

  it('creates tournament records through the tournament validator and revalidation path', async () => {
    const requestBody = { name: 'Nationals', type: 'tournament' }
    const validatedTournament = { name: 'Nationals', slug: 'nationals-2026', shortName: 'Nationals' }
    const createdEvent = { id: 'tour_1', type: 'tournament', slug: 'nationals-2026' }

    authMocks.getAuthorizedApiSession.mockResolvedValue({ user: { role: 'admin' } })
    apiMocks.readJsonBody.mockResolvedValue(requestBody)
    validationMocks.validateTournamentPayload.mockReturnValue(validatedTournament)
    repositoryMocks.createEventRecordLive.mockResolvedValue(createdEvent)

    const response = await POST(new Request('http://localhost/api/admin/events', { method: 'POST' }))

    expect(validationMocks.validateTournamentPayload).toHaveBeenCalledWith(requestBody)
    expect(repositoryMocks.createEventRecordLive).toHaveBeenCalledWith({
      ...validatedTournament,
      type: 'tournament',
    })
    expect(revalidationMocks.revalidateTournamentSitePaths).toHaveBeenCalledWith(createdEvent)
    expect(response.status).toBe(201)
  })

  it('returns shared error responses for validation and conflict failures', async () => {
    const error = Object.assign(new Error('An event with this slug already exists.'), { status: 409 })

    authMocks.getAuthorizedApiSession.mockResolvedValue({ user: { role: 'admin' } })
    apiMocks.readJsonBody.mockResolvedValue({ name: 'Duplicate Event' })
    validationMocks.validateEventPayload.mockImplementation(() => {
      throw error
    })

    const response = await POST(new Request('http://localhost/api/admin/events', { method: 'POST' }))

    expect(apiMocks.createErrorResponse).toHaveBeenCalledWith(error, 'Unable to create the event.')
    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toEqual({
      error: 'An event with this slug already exists.',
    })
  })

  it('returns event lists for authorized admins', async () => {
    const events = [{ id: 'evt_1', name: 'Summer Camp' }]

    authMocks.getAuthorizedApiSession.mockResolvedValue({ user: { role: 'admin' } })
    repositoryMocks.getAllEventsAdminLive.mockResolvedValue(events)

    const response = await GET(new Request('http://localhost/api/admin/events'))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ events })
  })
})
