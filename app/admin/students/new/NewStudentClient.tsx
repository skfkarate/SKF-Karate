import type { City } from '@/lib/classesData'

import AthleteRecordEditor from '../_components/AthleteRecordEditor'

export default function NewStudentClient({ initialCities }: { initialCities: City[] }) {
  return (
    <AthleteRecordEditor
      mode="create"
      initialCities={initialCities}
      initialValues={{
        name: '',
        dob: '',
        enrolledDate: new Date().toISOString().split('T')[0],
        branch: '',
        batch: '',
        belt: 'white',
        gender: 'male',
        parentName: '',
        phone: '',
        email: '',
        photoUrl: '',
        monthlyFee: 0,
        photoConsent: false,
        isPublic: true,
        isFeatured: false,
        status: 'Active',
      }}
    />
  )
}
