import { redirect } from "next/navigation"
import { getAdminSession } from "@/lib/utils/auth"

export default async function AdminIndexPage() {
  const session = await getAdminSession()

  if (!session) {
    redirect("/admin/login")
  }

  // Redirect to the new Dashboard Command Center
  redirect("/admin/dashboard")
}
