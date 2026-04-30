import type { City } from '@/lib/classesData'

import AthleteRecordEditor from '../../_components/AthleteRecordEditor'
import type { AthleteEditorValues, AutomationSummary } from '../../_components/AthleteRecordEditor'

export default function EditStudentClient({
  initialCities,
  profile,
  automationSummary,
  publicProfileHref,
}: {
  initialCities: City[]
  profile: AthleteEditorValues
  automationSummary: AutomationSummary
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
