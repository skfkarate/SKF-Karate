import { NextResponse } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const authMocks = vi.hoisted(() => ({
  getAuthorizedApiSession: vi.fn(),
}))

const repositoryMocks = vi.hoisted(() => ({
  createSenseiLive: vi.fn(),
  deleteSenseiLive: vi.fn(),
  getAllSenseisLive: vi.fn(),
  getSenseiByIdLive: vi.fn(),
  updateSenseiLive: vi.fn(),
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

const revalidationMocks = vi.hoisted(() => ({
  revalidateClassesSitePaths: vi.fn(),
  revalidateSenseiSitePaths: vi.fn(),
}))

vi.mock('@/lib/server/auth/session', () => ({
  getAuthorizedApiSession: authMocks.getAuthorizedApiSession,
}))

vi.mock('@/lib/server/repositories/senseis-live', () => ({
  createSenseiLive: repositoryMocks.createSenseiLive,
  deleteSenseiLive: repositoryMocks.deleteSenseiLive,
  getAllSenseisLive: repositoryMocks.getAllSenseisLive,
  getSenseiByIdLive: repositoryMocks.getSenseiByIdLive,
  updateSenseiLive: repositoryMocks.updateSenseiLive,
}))

vi.mock('@/lib/server/api', () => ({
  readJsonBody: apiMocks.readJsonBody,
  createErrorResponse: apiMocks.createErrorResponse,
}))

vi.mock('@/lib/server/revalidation', () => ({
  revalidateClassesSitePaths: revalidationMocks.revalidateClassesSitePaths,
  revalidateSenseiSitePaths: revalidationMocks.revalidateSenseiSitePaths,
}))

import { GET, POST } from '@/app/api/admin/senseis/route'

describe('/api/admin/senseis', () => {
  beforeEach(() => {
    authMocks.getAuthorizedApiSession.mockReset()
    repositoryMocks.createSenseiLive.mockReset()
    repositoryMocks.deleteSenseiLive.mockReset()
    repositoryMocks.getAllSenseisLive.mockReset()
    repositoryMocks.getSenseiByIdLive.mockReset()
    repositoryMocks.updateSenseiLive.mockReset()
    apiMocks.readJsonBody.mockReset()
    apiMocks.createErrorResponse.mockClear()
    revalidationMocks.revalidateClassesSitePaths.mockReset()
    revalidationMocks.revalidateSenseiSitePaths.mockReset()
  })

  it('rejects unauthorized writes', async () => {
    authMocks.getAuthorizedApiSession.mockResolvedValue(null)

    const response = await POST(new Request('http://localhost/api/admin/senseis', { method: 'POST' }))

    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({ error: 'Unauthorized' })
  })

  it('returns the live sensei directory to authorized admins', async () => {
    const senseis = [{ id: 'sensei_1', name: 'Sensei Usha C' }]

    authMocks.getAuthorizedApiSession.mockResolvedValue({ user: { role: 'admin' } })
    repositoryMocks.getAllSenseisLive.mockResolvedValue(senseis)

    const response = await GET()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ senseis })
  })

  it('updates senseis and revalidates both sensei and classes surfaces', async () => {
    const requestBody = {
      operation: 'update',
      id: 'sensei_1',
      payload: { name: 'Sensei Usha C', slug: 'usha-c' },
    }
    const updatedSensei = { id: 'sensei_1', slug: 'usha-c', name: 'Sensei Usha C' }
    const latestSenseis = [updatedSensei]

    authMocks.getAuthorizedApiSession.mockResolvedValue({ user: { role: 'admin' } })
    apiMocks.readJsonBody.mockResolvedValue(requestBody)
    repositoryMocks.updateSenseiLive.mockResolvedValue(updatedSensei)
    repositoryMocks.getAllSenseisLive.mockResolvedValue(latestSenseis)

    const response = await POST(new Request('http://localhost/api/admin/senseis', { method: 'POST' }))

    expect(repositoryMocks.updateSenseiLive).toHaveBeenCalledWith('sensei_1', requestBody.payload)
    expect(revalidationMocks.revalidateSenseiSitePaths).toHaveBeenCalledWith('usha-c')
    expect(revalidationMocks.revalidateClassesSitePaths).toHaveBeenCalledWith()
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ success: true, senseis: latestSenseis })
  })
})
