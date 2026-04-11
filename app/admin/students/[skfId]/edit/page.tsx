import { getStudentBySkfId } from '@/lib/server/sheets'
import EditStudentClient from './EditStudentClient'
import { notFound } from 'next/navigation'

export default async function EditStudentPage({ params }: { params: { skfId: string } }) {
    const student = await getStudentBySkfId(params.skfId.toUpperCase())
    if (!student) return notFound()

    return <EditStudentClient student={student} />
}
