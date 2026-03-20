"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import StudentForm from "@/app/components/athlete/StudentForm"

export default function AdminStudentFormShell({
  initialData = null,
  isEditing = false,
}) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleSave(data) {
    setIsSaving(true)
    setError("")

    try {
      const response = await fetch(
        isEditing ? `/api/admin/athletes/${initialData.id}` : "/api/admin/athletes",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      )

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || "Unable to save the student record.")
      }

      router.push("/admin/students")
      router.refresh()
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div className="mx-auto max-w-5xl rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}
      {isSaving ? (
        <div className="mx-auto max-w-5xl rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
          Saving student record...
        </div>
      ) : null}
      <StudentForm
        initialData={initialData}
        isEditing={isEditing}
        onSave={handleSave}
      />
    </div>
  )
}
