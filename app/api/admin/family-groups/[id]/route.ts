import { supabaseAdmin } from '@/lib/server/supabase'
import { AuthenticationError } from '@/src/server/lib/errors'
import { logger } from '@/src/server/lib/logger'
import { timingSafeStringEqual } from '@/src/server/lib/security'
import { withRoute } from '@/src/server/lib/route'
import type { AuthUser } from '@/lib/server/auth/staff'

function assertApiKey(request: Request) {
  const expected = process.env.FEETRACK_API_KEY
  if (!expected) throw new AuthenticationError('Integration key is not configured.')
  const actual = request.headers.get('x-feetrack-api-key') || ''
  if (!timingSafeStringEqual(actual, expected)) {
    throw new AuthenticationError('Invalid integration key.')
  }
}

function readStaff(request: Request): AuthUser {
  const encoded = request.headers.get('x-feetrack-staff')
  if (!encoded) throw new AuthenticationError('Staff session is required.')
  try {
    const json = Buffer.from(encoded, 'base64url').toString('utf8')
    const staff = JSON.parse(json) as AuthUser
    if (!staff.id || !staff.role) throw new Error('Invalid staff')
    return staff
  } catch {
    throw new AuthenticationError('Invalid staff session.')
  }
}

export const GET = withRoute(
  { rateLimit: { tier: 'authed' } },
  async ({ request, params }) => {
    assertApiKey(request)
    readStaff(request)

    const groupId = params.id

    const { data: group, error: groupError } = await supabaseAdmin
      .from('family_groups')
      .select('*')
      .eq('id', groupId)
      .single()

    if (groupError || !group) {
      return Response.json({ success: false, error: 'Family group not found' }, { status: 404 })
    }

    const { data: members, error: membersError } = await supabaseAdmin
      .from('family_group_members')
      .select('*')
      .eq('group_id', groupId)

    if (membersError) {
      logger.warn('family_groups.members_fetch_failed', { error: membersError, groupId })
    }

    return Response.json({
      success: true,
      data: {
        id: group.id,
        notes: group.notes,
        createdAt: group.created_at,
        members: members || [],
        memberCount: (members || []).length,
      },
    })
  }
)

export const DELETE = withRoute(
  { rateLimit: { tier: 'write' } },
  async ({ request, params }) => {
    assertApiKey(request)
    readStaff(request)

    const groupId = params.id

    // Delete members first (FK cascade should handle this, but be explicit)
    const { error: membersError } = await supabaseAdmin
      .from('family_group_members')
      .delete()
      .eq('group_id', groupId)

    if (membersError) {
      logger.warn('family_groups.members_delete_failed', { error: membersError, groupId })
    }

    // Delete the group
    const { error: groupError } = await supabaseAdmin
      .from('family_groups')
      .delete()
      .eq('id', groupId)

    if (groupError) {
      logger.warn('family_groups.delete_failed', { error: groupError, groupId })
      throw new Error('Failed to delete family group')
    }

    return Response.json({ success: true })
  }
)

export const PATCH = withRoute(
  { rateLimit: { tier: 'write' } },
  async ({ request, params, body }) => {
    assertApiKey(request)
    readStaff(request)

    const groupId = params.id
    const { notes } = body as { notes?: string }

    if (notes === undefined) {
      return Response.json({ success: false, error: 'No fields to update' }, { status: 400 })
    }

    const { error } = await supabaseAdmin
      .from('family_groups')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('id', groupId)

    if (error) {
      logger.warn('family_groups.update_failed', { error, groupId })
      throw new Error('Failed to update family group')
    }

    return Response.json({ success: true })
  }
)
