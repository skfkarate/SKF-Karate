import bcrypt from 'bcryptjs'

import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'

export interface AuthUser {
  id: string
  name: string
  role: string
  branchScope?: string
}

function buildUser({
  id,
  name,
  role,
  branchScope = 'all',
}: {
  id: string
  name: string
  role: string
  branchScope?: string
}): AuthUser {
  return { id, name, role, branchScope }
}

async function findStaffAccount(username: string, password: string): Promise<AuthUser | null> {
  if (!isSupabaseReady()) return null

  const { data, error } = await supabaseAdmin
    .from('staff_accounts')
    .select('id, username, password_hash, display_name, role, branch_scope, is_active')
    .eq('username', username)
    .maybeSingle()

  if (error || !data?.is_active || !data.password_hash) {
    return null
  }

  const valid = await bcrypt.compare(password, String(data.password_hash))
  if (!valid) return null

  await supabaseAdmin
    .from('staff_accounts')
    .update({ last_login_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', data.id)

  return buildUser({
    id: String(data.id),
    name: String(data.display_name || data.username || 'Fee Staff'),
    role: String(data.role || 'fee_manager'),
    branchScope: String(data.branch_scope || 'all'),
  })
}

export async function authorizeStaffCredentials(
  usernameInput: string,
  passwordInput: string
): Promise<AuthUser | null> {
  const username = String(usernameInput || '').trim()
  const password = String(passwordInput || '')
  if (!username || !password) return null

  const staffAccount = await findStaffAccount(username, password)
  if (staffAccount) {
    return staffAccount
  }

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    return buildUser({
      id: 'admin-1',
      name: 'Admin',
      role: 'admin',
      branchScope: 'all',
    })
  }

  if (
    username === process.env.INSTRUCTOR_USERNAME &&
    password === process.env.INSTRUCTOR_PASSWORD
  ) {
    return buildUser({
      id: 'instructor-1',
      name: 'Instructor',
      role: 'instructor',
      branchScope: 'all',
    })
  }

  return null
}
