import { redirect } from 'next/navigation'

export default async function RedirectToEditor({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  // Directly manage template from the standard editor view routing. 
  // Future iterations can include renaming or changing branch restrictions natively here.
  redirect(`/admin/certificates/programs/${id}/template-editor`)
}
