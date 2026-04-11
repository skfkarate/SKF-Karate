import { redirect } from "next/navigation"
import AdminLoginForm from "@/app/_components/admin/AdminLoginForm"
import { getAdminSession } from "@/lib/utils/auth"

export default async function LoginPage() {
  const session = await getAdminSession()

  if (session) {
    redirect("/admin")
  }

  return <AdminLoginForm />
}
