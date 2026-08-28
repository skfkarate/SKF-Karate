import { z } from 'zod'

import { supabaseAdmin } from '@/lib/server/supabase'
import { AuthenticationError, ValidationError } from '@/src/server/lib/errors'
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

const addMemberSchema = z.object({
  skfId: z.string().min(1),
  guardianPhone: z.string().optional(),
})

export const POST = withRoute(
  { rateLimit: { tier: 'write' } },
  async ({ request, params, body }) => {
    assertApiKey(request)
    readStaff(request)

    const groupId = params.id
    const parsed = addMemberSchema.parse(body)

    // Verify the group exists
    const { data: group, error: groupError } = await supabaseAdmin
      .from('family_groups')
      .select('id')
      .eq('id', groupId)
      .single()

    if (groupError || !group) {
      return Response.json({ success: false, error: 'Family group not found' }, { status: 404 })
    }

    // Verify the athlete exists
    const { data: athlete, error: athleteError } = await supabaseAdmin
      .from('athletes')
      .select('skf_id, phone')
      .eq('skf_id', parsed.skfId.toUpperCase())
      .single()

    if (athleteError || !athlete) {
      throw new ValidationError({ skfId: ['Athlete not found.'] })
    }

    // Check if athlete is already in any family group
    const { data: existingMember } = await supabaseAdmin
      .from('family_group_members')
      .select('group_id')
      .eq('skf_id', parsed.skfId.toUpperCase())
      .limit(1)

    if (existingMember && existingMember.length > 0) {
      throw new ValidationError({
        skfId: ['Athlete is already in a family group. Remove them first.'],
      })
    }

    // Add to the group
    const { error: insertError } = await supabaseAdmin
      .from('family_group_members')
      .insert({
        group_id: groupId,
        skf_id: parsed.skfId.toUpperCase(),
        guardian_phone: parsed.guardianPhone || athlete.phone || '',
      })

    if (insertError) {
      logger.warn('family_groups.add_member_failed', { error: insertError, groupId, skfId: parsed.skfId })
      throw new Error('Failed to add member to family group')
    }

    return Response.json({
      success: true,
      data: {
        skfId: parsed.skfId.toUpperCase(),
        groupId,
      },
    }, { status: 201 })
  }
)

export const DELETE = withRoute(
  { rateLimit: { tier: 'write' } },
  async ({ request, params, body }) => {
    assertApiKey(request)
    readStaff(request)

    const groupId = params.id
    const { skfId } = body as { skfId?: string }

    if (!skfId) {
      throw new ValidationError({ skfId: ['SKF ID is required.'] })
    }

    const { error } = await supabaseAdmin
      .from('family_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('skf_id', skfId.toUpperCase())

    if (error) {
      logger.warn('family_groups.remove_member_failed', { error, groupId, skfId })
      throw new Error('Failed to remove member from family group')
    }

    return Response.json({ success: true })
  }
)
