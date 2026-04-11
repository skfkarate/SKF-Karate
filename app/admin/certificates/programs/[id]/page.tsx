import { redirect } from 'next/navigation'

export default function RedirectToEditor({ params }: { params: { id: string } }) {
  // Directly manage template from the standard editor view routing. 
  // Future iterations can include renaming or changing branch restrictions natively here.
  redirect(`/admin/certificates/programs/${params.id}/template-editor`)
}
