import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { verifyJWT, COOKIE_NAME } from '@/lib/server/auth_legacy'
import AthleteProfileClient from '@/app/_components/athlete/profile/AthleteProfileClient'
import { buildRestoredAthleteProfileData } from '@/app/_components/athlete/profile/athleteProfileData'
import { getAthleteByRegistrationNumber, getAthleteRank } from '@/lib/server/repositories/athletes'

export const dynamic = 'force-dynamic'

export default async function DojoDashboard() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  const session = verifyJWT(token)

  if (!session || !session.skfId) {
    redirect('/portal/login')
  }

  const athlete = getAthleteByRegistrationNumber(session.skfId)
  if (!athlete) {
    return (
      <div style={{ padding: '6rem 2rem', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>Identity Not Found</h2>
        <p style={{ color: 'rgba(255,255,255,0.45)', marginBottom: '2rem' }}>Please contact your Branch Sensei for assistance.</p>
        <Link href="/portal/login" style={{ color: 'var(--gold, #ffb703)', fontWeight: 700 }}>Return to Login</Link>
      </div>
    )
  }

  const rankInfo = getAthleteRank(athlete.id)
  const profile = buildRestoredAthleteProfileData(athlete, rankInfo)

  return <AthleteProfileClient {...profile} isDashboardContext={true} />
}
