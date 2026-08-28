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

const createGroupSchema = z.object({
  skfIds: z.array(z.string().min(1)).min(2, 'At least 2 SKF IDs required'),
  notes: z.string().optional(),
})

export const GET = withRoute(
  { rateLimit: { tier: 'authed' } },
  async ({ request }) => {
    assertApiKey(request)
    readStaff(request)

    const { data: groups, error: groupsError } = await supabaseAdmin
      .from('family_groups')
      .select('*')
      .order('created_at', { ascending: false })

    if (groupsError) {
      logger.warn('family_groups.list_failed', { error: groupsError })
      throw new Error('Failed to fetch family groups')
    }

    const { data: members, error: membersError } = await supabaseAdmin
      .from('family_group_members')
      .select('*')

    if (membersError) {
      logger.warn('family_groups.members_list_failed', { error: membersError })
      throw new Error('Failed to fetch family group members')
    }

    // Group members by group_id
    const membersByGroup = new Map<string, typeof members>()
    for (const member of members || []) {
      const list = membersByGroup.get(member.group_id) || []
      list.push(member)
      membersByGroup.set(member.group_id, list)
    }

    const result = (groups || []).map(group => ({
      id: group.id,
      notes: group.notes,
      createdAt: group.created_at,
      members: membersByGroup.get(group.id) || [],
      memberCount: (membersByGroup.get(group.id) || []).length,
    }))

    return Response.json({ success: true, data: result })
  }
)

export const POST = withRoute(
  { rateLimit: { tier: 'write' } },
  async ({ request, body }) => {
    assertApiKey(request)
    readStaff(request)

    const parsed = createGroupSchema.parse(body)

    // Verify all SKF IDs exist
    const { data: athletes, error: athleteError } = await supabaseAdmin
      .from('athletes')
      .select('skf_id, first_name, last_name, phone')
      .in('skf_id', parsed.skfIds)

    if (athleteError || !athletes || athletes.length !== parsed.skfIds.length) {
      throw new ValidationError({ skfIds: ['One or more SKF IDs not found.'] })
    }

    // Check if any of these athletes are already in a family group
    const { data: existingMembers } = await supabaseAdmin
      .from('family_group_members')
      .select('group_id, skf_id')
      .in('skf_id', parsed.skfIds)

    if (existingMembers && existingMembers.length > 0) {
      const alreadyLinked = existingMembers.map(m => m.skf_id)
      throw new ValidationError({
        skfIds: [`Athletes already in a family group: ${alreadyLinked.join(', ')}`],
      })
    }

    // Create the group
    const groupId = `fam_admin_${Date.now()}`
    const { error: createError } = await supabaseAdmin
      .from('family_groups')
      .insert({
        id: groupId,
        created_by: 'admin',
        notes: parsed.notes || '',
      })

    if (createError) {
      logger.warn('family_groups.create_failed', { error: createError })
      throw new Error('Failed to create family group')
    }

    // Add all athletes to the group
    const phone = athletes[0]?.phone || ''
    const members = parsed.skfIds.map(skfId => ({
      group_id: groupId,
      skf_id: skfId,
      guardian_phone: phone,
    }))

    const { error: membersError } = await supabaseAdmin
      .from('family_group_members')
      .insert(members)

    if (membersError) {
      logger.warn('family_groups.members_insert_failed', { error: membersError })
      // Rollback: delete the group
      await supabaseAdmin.from('family_groups').delete().eq('id', groupId)
      throw new Error('Failed to add members to family group')
    }

    return Response.json({
      success: true,
      data: {
        groupId,
        memberCount: members.length,
        athletes: athletes.map(a => ({
          skfId: a.skf_id,
          name: [a.first_name, a.last_name].filter(Boolean).join(' '),
        })),
      },
    }, { status: 201 })
  }
)
