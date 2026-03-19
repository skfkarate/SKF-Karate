import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function requireAdminSession(allowedRoles) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/admin/login")
  }

  const rolesArray = allowedRoles
    ? Array.isArray(allowedRoles)
      ? allowedRoles
      : [allowedRoles]
    : ["admin", "instructor"]

  if (!rolesArray.includes(session.user.role)) {
    redirect("/admin")
  }

  return session
}

export async function getAdminSession() {
  return getServerSession(authOptions)
}

export function hasRole(session, role) {
  if (!session?.user) return false
  return session.user.role === role
}
