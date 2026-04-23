import type { City } from '@/lib/classesData'

import AthleteRecordEditor from '../../_components/AthleteRecordEditor'

export default function EditStudentClient({
  initialCities,
  profile,
  automationSummary,
  publicProfileHref,
}: {
  initialCities: City[]
  profile: any
  automationSummary: any
  publicProfileHref?: string | null
}) {
  return (
    <AthleteRecordEditor
      mode="edit"
      initialCities={initialCities}
      initialValues={profile}
      automationSummary={automationSummary}
      publicProfileHref={publicProfileHref}
    />
  )
}
