import { redirect } from "next/navigation"
import { requireAdminSession } from "@/lib/utils/auth"

export default async function AdminIndexPage() {
  const session = await requireAdminSession(["admin", "instructor"])

  if (session.user.role === "admin") {
    redirect("/admin/students")
  }

  redirect("/admin/results")
}
