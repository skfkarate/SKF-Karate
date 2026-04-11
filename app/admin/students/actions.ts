'use server'
import { requireAdminSession } from '@/lib/utils/auth'
import { updateStudent } from '@/lib/server/sheets'
import { revalidatePath } from 'next/cache'

export async function reactivateStudent(skfId: string) {
    await requireAdminSession()
    const ok = await updateStudent(skfId.toUpperCase(), { status: 'Active' as any })
    if (ok) {
        revalidatePath('/admin/students')
        return { success: true }
    }
    return { success: false, error: 'Failed to reactivate' }
}
