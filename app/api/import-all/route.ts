import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/server/supabase'
import { getBelt } from '@/data/constants/belts'

type ImportRecord = {
  date: string
  name: string
  type: 'enrollment' | 'belt-grading'
  beltEarned: string
  eventName: string
  grade: string
  examiner: string
  location: string
  dp: boolean
}

const rawData = `SKF13BL000	SHRIROSHAN P	Bangalore	2013-04-01	White Belt Issued	White Belt	Joining / White Belt Issued	Issued			No	Black Belt	Legacy pre-SKF ID record
SKF13BL000	SHRIROSHAN P	Bangalore	2013-10-13	Belt Exam	Yellow Belt	SKF Progressive Kyu Examination – October 2013	Pass	A	Dr. Renshi Channegowda UC	No	Black Belt	
SKF13BL000	SHRIROSHAN P	Bangalore	2014-01-14	Belt Exam	Orange Belt	SKF Progressive Kyu Examination – January 2014	Pass	A	Dr. Renshi Channegowda UC	No	Black Belt	
SKF13BL000	SHRIROSHAN P	Bangalore	2014-04-18	Belt Exam	Green II Belt	SKF Progressive Kyu Examination – April 2014	Pass	A	Dr. Renshi Channegowda UC	No	Black Belt	
SKF13BL000	SHRIROSHAN P	Bangalore	2014-07-09	Belt Exam	Green I Belt	SKF Progressive Kyu Examination – July 2014	Pass	A	Dr. Renshi Channegowda UC	No	Black Belt	
SKF13BL000	SHRIROSHAN P	Bangalore	2015-06-03	Belt Exam	Blue Belt	SKF Progressive Kyu Examination – June 2015	Pass	A	Dr. Renshi Channegowda UC	No	Black Belt	
SKF13BL000	SHRIROSHAN P	Bangalore	2016-05-06	Belt Exam	Purple Belt	SKF Progressive Kyu Examination – May 2016	Pass	A	Dr. Renshi Channegowda UC	No	Black Belt	
SKF13BL000	SHRIROSHAN P	Bangalore	2017-03-01	Belt Exam	Brown III Belt	SKF Progressive Kyu Examination – March 2017	Pass	A	Dr. Renshi Channegowda UC	No	Black Belt	
SKF13BL000	SHRIROSHAN P	Bangalore	2017-08-13	Belt Exam	Brown II Belt	SKF Progressive Kyu Examination – August 2017	Pass	A	Dr. Renshi Channegowda UC	No	Black Belt	
SKF13BL000	SHRIROSHAN P	Bangalore	2018-12-15	Belt Exam	Brown I Belt	SKF Progressive Kyu Examination – December 2018	Pass	A	Dr. Renshi Channegowda UC	No	Black Belt	
SKF13BL000	SHRIROSHAN P	Bangalore	2020-05-17	Belt Exam	Black Belt	SKF Progressive Kyu Examination – May 2020	Pass	A	Dr. Renshi Channegowda UC	No	Black Belt	
SKF20HE001	SANJANA S	Herohalli	2020-10-22	White Belt Issued	White Belt	Joining / White Belt Issued	Issued			No	Brown III Belt	White belt issued / joining date
SKF20HE001	SANJANA S	Herohalli	2021-04-22	Belt Exam	Yellow Belt	SKF Progressive Kyu Examination – April 2021	Pass	A	Dr. Renshi Channegowda UC	No	Brown III Belt	
SKF20HE001	SANJANA S	Herohalli	2021-10-22	Belt Exam	Orange Belt	SKF Progressive Kyu Examination – October 2021	Pass	A	Dr. Renshi Channegowda UC	No	Brown III Belt	
SKF20HE001	SANJANA S	Herohalli	2022-04-14	Belt Exam	Green II Belt	SKF Progressive Kyu Examination – April 2022	Pass	A	Dr. Renshi Channegowda UC	No	Brown III Belt	
SKF20HE001	SANJANA S	Herohalli	2023-04-14	Belt Exam	Green I Belt	SKF Progressive Kyu Examination – April 2023	Pass	A	Dr. Renshi Channegowda UC	No	Brown III Belt	
SKF20HE001	SANJANA S	Herohalli	2023-10-01	Belt Exam	Blue Belt	SKF Progressive Kyu Examination – October 2023	Pass	A	Dr. Renshi Channegowda UC	No	Brown III Belt	
SKF20HE001	SANJANA S	Herohalli	2024-04-14	Belt Exam	Purple Belt	SKF Progressive Kyu Examination – April 2024	Pass	A	Dr. Renshi Channegowda UC	No	Brown III Belt	
SKF20HE001	SANJANA S	Herohalli	2025-06-01	Belt Exam	Brown III Belt	SKF Progressive Kyu Examination – June 2025	Pass	A	Dr. Renshi Channegowda UC	No	Brown III Belt	
SKF20HE002	TEJASHREE S	Herohalli	2020-10-22	White Belt Issued	White Belt	Joining / White Belt Issued	Issued			No	Brown I Belt	White belt issued / joining date
SKF20HE002	TEJASHREE S	Herohalli	2021-04-22	Belt Exam	Yellow Belt	SKF Progressive Kyu Examination – April 2021	Pass	A	Dr. Renshi Channegowda UC	No	Brown I Belt	
SKF20HE002	TEJASHREE S	Herohalli	2021-10-22	Belt Exam	Orange Belt	SKF Progressive Kyu Examination – October 2021	Pass	A	Dr. Renshi Channegowda UC	No	Brown I Belt	
SKF20HE002	TEJASHREE S	Herohalli	2022-04-14	Belt Exam	Green II Belt	SKF Progressive Kyu Examination – April 2022	Pass	A	Dr. Renshi Channegowda UC	No	Brown I Belt	
SKF20HE002	TEJASHREE S	Herohalli	2023-04-14	Belt Exam	Green I Belt	SKF Progressive Kyu Examination – April 2023	Pass	A	Dr. Renshi Channegowda UC	No	Brown I Belt	
SKF20HE002	TEJASHREE S	Herohalli	2023-10-01	Belt Exam	Blue Belt	SKF Progressive Kyu Examination – October 2023	Pass	A	Dr. Renshi Channegowda UC	No	Brown I Belt	
SKF20HE002	TEJASHREE S	Herohalli	2024-04-14	Belt Exam	Purple Belt	SKF Progressive Kyu Examination – April 2024	Pass	A	Dr. Renshi Channegowda UC	No	Brown I Belt	
SKF20HE002	TEJASHREE S	Herohalli	2024-09-29	Belt Exam	Brown III Belt	SKF Progressive Kyu Examination – September 2024	Pass	A	Dr. Renshi Channegowda UC	No	Brown I Belt	
SKF20HE002	TEJASHREE S	Herohalli	2025-06-01	Belt Exam	Brown II Belt	SKF Progressive Kyu Examination – June 2025	Pass	A	Dr. Renshi Channegowda UC	No	Brown I Belt	
SKF20HE002	TEJASHREE S	Herohalli	2025-12-07	Belt Exam	Brown I Belt	SKF Progressive Kyu Examination – December 2025	Pass	A	Dr. Renshi Channegowda UC	No	Brown I Belt	
SKF20HE003	AYUSH KASHYAP G	Herohalli	2020-01-01	White Belt Issued	White Belt	Joining / White Belt Issued	Issued			No	Brown I Belt	White belt issued / joining date
SKF20HE003	AYUSH KASHYAP G	Herohalli	2020-07-01	Belt Exam	Yellow Belt	SKF Progressive Kyu Examination – July 2020	Pass	A	Dr. Renshi Channegowda UC	No	Brown I Belt	
SKF20HE003	AYUSH KASHYAP G	Herohalli	2021-01-01	Belt Exam	Orange Belt	SKF Progressive Kyu Examination – January 2021	Pass	A	Dr. Renshi Channegowda UC	No	Brown I Belt	
SKF20HE003	AYUSH KASHYAP G	Herohalli	2021-07-01	Belt Exam	Green II Belt	SKF Progressive Kyu Examination – July 2021	Pass	A	Dr. Renshi Channegowda UC	No	Brown I Belt	
SKF20HE003	AYUSH KASHYAP G	Herohalli	2022-01-01	Belt Exam	Green I Belt	SKF Progressive Kyu Examination – January 2022	Pass	A	Dr. Renshi Channegowda UC	No	Brown I Belt	
SKF20HE003	AYUSH KASHYAP G	Herohalli	2023-10-01	Belt Exam	Purple Belt	SKF Progressive Kyu Examination – October 2023	Pass	A	Dr. Renshi Channegowda UC	Yes	Brown I Belt	Direct promotion; no Blue Belt row
SKF20HE003	AYUSH KASHYAP G	Herohalli	2024-04-14	Belt Exam	Brown III Belt	SKF Progressive Kyu Examination – April 2024	Pass	A	Dr. Renshi Channegowda UC	No	Brown I Belt	
SKF20HE003	AYUSH KASHYAP G	Herohalli	2024-09-29	Belt Exam	Brown II Belt	SKF Progressive Kyu Examination – September 2024	Pass	A	Dr. Renshi Channegowda UC	No	Brown I Belt	
SKF20HE003	AYUSH KASHYAP G	Herohalli	2025-06-01	Belt Exam	Brown I Belt	SKF Progressive Kyu Examination – June 2025	Pass	A	Dr. Renshi Channegowda UC	No	Brown I Belt	
SKF21HE001	ISHAAN GOWDA B S	Herohalli	2021-01-08	White Belt Issued	White Belt	Joining / White Belt Issued	Issued			No	Brown II Belt	Exact joining date known
SKF21HE001	ISHAAN GOWDA B S	Herohalli	2022-02-20	Belt Exam	Yellow Belt	SKF Progressive Kyu Examination – February 2022	Pass	A	Dr. Renshi Channegowda UC	No	Brown II Belt	
SKF21HE001	ISHAAN GOWDA B S	Herohalli	2022-07-03	Belt Exam	Orange Belt	SKF Progressive Kyu Examination – July 2022	Pass	A	Dr. Renshi Channegowda UC	No	Brown II Belt	
SKF21HE001	ISHAAN GOWDA B S	Herohalli	2023-01-03	Belt Exam	Green II Belt	SKF Progressive Kyu Examination – January 2023	Pass	A	Dr. Renshi Channegowda UC	No	Brown II Belt	
SKF21HE001	ISHAAN GOWDA B S	Herohalli	2023-10-01	Belt Exam	Green I Belt	SKF Progressive Kyu Examination – October 2023	Pass	A	Dr. Renshi Channegowda UC	No	Brown II Belt	
SKF21HE001	ISHAAN GOWDA B S	Herohalli	2024-04-14	Belt Exam	Blue Belt	SKF Progressive Kyu Examination – April 2024	Pass	A	Dr. Renshi Channegowda UC	No	Brown II Belt	
SKF21HE001	ISHAAN GOWDA B S	Herohalli	2024-09-29	Belt Exam	Purple Belt	SKF Progressive Kyu Examination – September 2024	Pass	A	Dr. Renshi Channegowda UC	No	Brown II Belt	
SKF21HE001	ISHAAN GOWDA B S	Herohalli	2025-06-01	Belt Exam	Brown III Belt	SKF Progressive Kyu Examination – June 2025	Pass	A	Dr. Renshi Channegowda UC	No	Brown II Belt	
SKF21HE001	ISHAAN GOWDA B S	Herohalli	2025-12-07	Belt Exam	Brown II Belt	SKF Progressive Kyu Examination – December 2025	Pass	A	Dr. Renshi Channegowda UC	No	Brown II Belt	
SKF21HE002	JNANAVI RAM	Bangalore	2021-08-01	White Belt Issued	White Belt	Joining / White Belt Issued	Issued			No	Purple Belt	White belt issued / joining date
SKF21HE002	JNANAVI RAM	Bangalore	2022-02-20	Belt Exam	Yellow Belt	SKF Progressive Kyu Examination – February 2022	Pass	A	Dr. Renshi Channegowda UC	No	Purple Belt	
SKF21HE002	JNANAVI RAM	Bangalore	2022-08-20	Belt Exam	Orange Belt	SKF Progressive Kyu Examination – August 2022	Pass	A	Dr. Renshi Channegowda UC	No	Purple Belt	
SKF21HE002	JNANAVI RAM	Bangalore	2023-02-20	Belt Exam	Green II Belt	SKF Progressive Kyu Examination – February 2023	Pass	A	Dr. Renshi Channegowda UC	No	Purple Belt	
SKF21HE002	JNANAVI RAM	Bangalore	2024-09-29	Belt Exam	Green I Belt	SKF Progressive Kyu Examination – September 2024	Pass	A	Dr. Renshi Channegowda UC	No	Purple Belt	
SKF21HE002	JNANAVI RAM	Bangalore	2025-06-01	Belt Exam	Blue Belt	SKF Progressive Kyu Examination – June 2025	Pass	A	Dr. Renshi Channegowda UC	No	Purple Belt	
SKF21HE002	JNANAVI RAM	Bangalore	2025-12-07	Belt Exam	Purple Belt	SKF Progressive Kyu Examination – December 2025	Pass	A	Dr. Renshi Channegowda UC	No	Purple Belt	
SKF23HE001	HARSHA KUMAR S P	Herohalli	2023-10-14	White Belt Issued	White Belt	Joining / White Belt Issued	Issued			No	Blue Belt	White belt issued / joining date
SKF23HE001	HARSHA KUMAR S P	Herohalli	2024-04-14	Belt Exam	Yellow Belt	SKF Progressive Kyu Examination – April 2024	Pass	A	Dr. Renshi Channegowda UC	No	Blue Belt	
SKF23HE001	HARSHA KUMAR S P	Herohalli	2024-09-29	Belt Exam	Orange Belt	SKF Progressive Kyu Examination – September 2024	Pass	A	Dr. Renshi Channegowda UC	No	Blue Belt	
SKF23HE001	HARSHA KUMAR S P	Herohalli	2025-06-01	Belt Exam	Green II Belt	SKF Progressive Kyu Examination – June 2025	Pass	A	Dr. Renshi Channegowda UC	No	Blue Belt	
SKF23HE001	HARSHA KUMAR S P	Herohalli	2025-12-07	Belt Exam	Blue Belt	SKF Progressive Kyu Examination – December 2025	Pass	A	Dr. Renshi Channegowda UC	No	Blue Belt	
SKF23HE002	VEDANK GOWDA K	Herohalli	2023-10-14	White Belt Issued	White Belt	Joining / White Belt Issued	Issued			No	Blue Belt	White belt issued / joining date
SKF23HE002	VEDANK GOWDA K	Herohalli	2024-04-14	Belt Exam	Yellow Belt	SKF Progressive Kyu Examination – April 2024	Pass	A	Dr. Renshi Channegowda UC	No	Blue Belt	
SKF23HE002	VEDANK GOWDA K	Herohalli	2024-09-29	Belt Exam	Orange Belt	SKF Progressive Kyu Examination – September 2024	Pass	A	Dr. Renshi Channegowda UC	No	Blue Belt	
SKF23HE002	VEDANK GOWDA K	Herohalli	2025-06-01	Belt Exam	Green II Belt	SKF Progressive Kyu Examination – June 2025	Pass	A	Dr. Renshi Channegowda UC	No	Blue Belt	
SKF23HE002	VEDANK GOWDA K	Herohalli	2025-12-07	Belt Exam	Blue Belt	SKF Progressive Kyu Examination – December 2025	Pass	A	Dr. Renshi Channegowda UC	No	Blue Belt	
SKF23HE003	DEEKSHA RAM	Bangalore	2023-04-01	White Belt Issued	White Belt	Joining / White Belt Issued	Issued			No	Blue Belt	White belt issued / joining date
SKF23HE003	DEEKSHA RAM	Bangalore	2023-10-01	Belt Exam	Yellow Belt	SKF Progressive Kyu Examination – October 2023	Pass	A	Dr. Renshi Channegowda UC	No	Blue Belt	
SKF23HE003	DEEKSHA RAM	Bangalore	2024-04-01	Belt Exam	Orange Belt	SKF Progressive Kyu Examination – April 2024	Pass	A	Dr. Renshi Channegowda UC	No	Blue Belt	
SKF23HE003	DEEKSHA RAM	Bangalore	2024-09-29	Belt Exam	Green II Belt	SKF Progressive Kyu Examination – September 2024	Pass	A	Dr. Renshi Channegowda UC	No	Blue Belt	
SKF23HE003	DEEKSHA RAM	Bangalore	2025-06-01	Belt Exam	Green I Belt	SKF Progressive Kyu Examination – June 2025	Pass	A	Dr. Renshi Channegowda UC	No	Blue Belt	
SKF23HE003	DEEKSHA RAM	Bangalore	2025-12-07	Belt Exam	Blue Belt	SKF Progressive Kyu Examination – December 2025	Pass	A	Dr. Renshi Channegowda UC	No	Blue Belt	
SKF23HE004	MANOGNA B N	Herohalli	2023-10-14	White Belt Issued	White Belt	Joining / White Belt Issued	Issued			No	Green I Belt	White belt issued / joining date
SKF23HE004	MANOGNA B N	Herohalli	2024-04-14	Belt Exam	Yellow Belt	SKF Progressive Kyu Examination – April 2024	Pass	A	Dr. Renshi Channegowda UC	No	Green I Belt	
SKF23HE004	MANOGNA B N	Herohalli	2024-09-29	Belt Exam	Orange Belt	SKF Progressive Kyu Examination – September 2024	Pass	A	Dr. Renshi Channegowda UC	No	Green I Belt	
SKF23HE004	MANOGNA B N	Herohalli	2025-06-01	Belt Exam	Green II Belt	SKF Progressive Kyu Examination – June 2025	Pass	A	Dr. Renshi Channegowda UC	No	Green I Belt	
SKF23HE004	MANOGNA B N	Herohalli	2025-12-07	Belt Exam	Green I Belt	SKF Progressive Kyu Examination – December 2025	Pass	A	Dr. Renshi Channegowda UC	No	Green I Belt	
SKF23HE005	PRITHVI RAJ B N	Herohalli	2023-10-14	White Belt Issued	White Belt	Joining / White Belt Issued	Issued			No	Green I Belt	White belt issued / joining date
SKF23HE005	PRITHVI RAJ B N	Herohalli	2024-04-14	Belt Exam	Yellow Belt	SKF Progressive Kyu Examination – April 2024	Pass	A	Dr. Renshi Channegowda UC	No	Green I Belt	
SKF23HE005	PRITHVI RAJ B N	Herohalli	2024-09-29	Belt Exam	Orange Belt	SKF Progressive Kyu Examination – September 2024	Pass	A	Dr. Renshi Channegowda UC	No	Green I Belt	
SKF23HE005	PRITHVI RAJ B N	Herohalli	2025-06-01	Belt Exam	Green II Belt	SKF Progressive Kyu Examination – June 2025	Pass	A	Dr. Renshi Channegowda UC	No	Green I Belt	
SKF23HE005	PRITHVI RAJ B N	Herohalli	2025-12-07	Belt Exam	Green I Belt	SKF Progressive Kyu Examination – December 2025	Pass	A	Dr. Renshi Channegowda UC	No	Green I Belt	
SKF23HE006	KUSHAL K	Herohalli	2023-01-01	White Belt Issued	White Belt	Joining / White Belt Issued	Issued			No	Green I Belt	Source order normalized from the recorded history
SKF23HE006	KUSHAL K	Herohalli	2024-09-29	Belt Exam	Green I Belt	SKF Progressive Kyu Examination – September 2024	Pass	A	Dr. Renshi Channegowda UC	No	Green I Belt	
SKF23HE006	KUSHAL K	Herohalli	2025-06-01	Belt Exam	Green II Belt	SKF Progressive Kyu Examination – June 2025	Pass	A	Dr. Renshi Channegowda UC	No	Green I Belt	
SKF23HE006	KUSHAL K	Herohalli	2025-12-07	Belt Exam	Orange Belt	SKF Progressive Kyu Examination – December 2025	Pass	A	Dr. Renshi Channegowda UC	No	Green I Belt	
SKF24HE001	KUSHIL V	Herohalli	2025-01-01	White Belt Issued	White Belt	Joining / White Belt Issued	Issued			No	Orange Belt	White belt issued / joining date
SKF24HE001	KUSHIL V	Herohalli	2025-06-01	Belt Exam	Yellow Belt	SKF Progressive Kyu Examination – June 2025	Pass	A	Dr. Renshi Channegowda UC	No	Orange Belt	
SKF24HE001	KUSHIL V	Herohalli	2025-12-07	Belt Exam	Orange Belt	SKF Progressive Kyu Examination – December 2025	Pass	A	Dr. Renshi Channegowda UC	No	Orange Belt	
SKF25HE001	LIKHITH GOWDA U R	Herohalli	2025-01-12	White Belt Issued	White Belt	Joining / White Belt Issued	Issued			No	Yellow Belt	White belt issued / joining date
SKF25HE001	LIKHITH GOWDA U R	Herohalli	2025-07-12	Belt Exam	Yellow Belt	SKF Progressive Kyu Examination – June 2025	Pass	A	Dr. Renshi Channegowda UC	No	Yellow Belt	Normalized to June 2025 grading batch
SKF25HE002	MANAV	Herohalli	2025-11-01	White Belt Issued	White Belt	Joining / White Belt Issued	Issued			No	White Belt	Joining after October; no grading yet
SKF25HE003	MRITHIKA P	Herohalli	2025-01-01	White Belt Issued	White Belt	Joining / White Belt Issued	Issued			No	Yellow Belt	Enrollment; resuming June 2026
SKF25HE003	MRITHIKA P	Herohalli	2025-07-12	Belt Exam	Yellow Belt	SKF Progressive Kyu Examination – June 2025	Pass	A	Dr. Renshi Channegowda UC	No	Yellow Belt	Normalized to June 2025 grading batch
SKF26HE001	M MONISHPRASAD	Herohalli	2026-01-01	White Belt Issued	White Belt	Joining / White Belt Issued	Issued			No	White Belt	Exact joining date given; no grading yet`

export async function POST(request: NextRequest) {
  const importSecret = process.env.CRON_SECRET?.trim()
  const providedSecret = request.headers.get('x-import-secret')?.trim()

  if (!importSecret || providedSecret !== importSecret) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const lines = rawData.trim().split('\n')
  const results = []

  // Step 1: Update SKF17BL000 to SKF13BL000
  await supabaseAdmin.from('athletes').update({ skf_id: 'SKF13BL000' }).eq('skf_id', 'SKF17BL000')
  await supabaseAdmin.from('bb_candidates').update({ skf_id: 'SKF13BL000' }).in('skf_id', ['SKF17BL000', 'SKF17BL0000', 'SKF17BL00'])
  await supabaseAdmin.from('student_billing_profiles').update({ skf_id: 'SKF13BL000' }).in('skf_id', ['SKF17BL000', 'SKF17BL0000', 'SKF17BL00'])
  await supabaseAdmin.from('fee_payment_proofs').update({ skf_id: 'SKF13BL000' }).in('skf_id', ['SKF17BL000', 'SKF17BL0000', 'SKF17BL00'])

  const groups = new Map<string, ImportRecord[]>()
  
  for (const line of lines) {
    if (!line.trim()) continue
    const parts = line.split('\t')
    if (parts.length < 10) continue
    
    const skf_id = parts[0].trim()
    const name = parts[1].trim()
    const branch = parts[2].trim()
    const date = parts[3].trim()
    const type = parts[4].trim()
    let belt = parts[5].trim()
    const eventName = parts[6].trim()
    const score = parts[8].trim()
    const examiner = parts[9].trim()
    const dp = parts[10] ? parts[10].trim() : 'No'
    
    if (!groups.has(skf_id)) {
      groups.set(skf_id, [])
    }
    
    // Correct Kushal K's sequence
    if (skf_id === 'SKF23HE006') {
      if (date === '2024-09-29') belt = 'Yellow Belt'
      if (date === '2025-06-01') belt = 'Orange Belt'
      if (date === '2025-12-07') belt = 'Green II Belt'
    }

    groups.get(skf_id)!.push({
      date,
      name,
      type: type === 'White Belt Issued' ? 'enrollment' : 'belt-grading',
      beltEarned: belt,
      eventName,
      grade: score || 'A',
      examiner: examiner || 'Dr. Renshi Channegowda UC',
      location: branch,
      dp: dp === 'Yes'
    })
  }

  for (const [skf_id, records] of Array.from(groups.entries())) {
    // Upsert the athlete
    const currentBeltRaw = records[records.length - 1].beltEarned
    const currentBeltObj = getBelt(currentBeltRaw)
    const currentBelt = currentBeltObj?.colour || 'white'
    
    // Find missing events and create them
    for (const record of records) {
      if (record.type === 'belt-grading') {
        const slug = record.eventName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        const id = `grading-${record.date}`
        await supabaseAdmin.from('events').upsert({
          id,
          slug,
          name: record.eventName,
          type: 'grading',
          status: 'active',
          date: record.date,
          hosting_branch: record.location,
          is_published: true,
          show_in_journey: true
        }, { onConflict: 'id' })
      }
    }

    const { data: existingAthlete } = await supabaseAdmin.from('athletes').select('*').eq('skf_id', skf_id).single()

    const newAchievements = records.map(r => {
      const title = r.type === 'enrollment' ? 'Joined SKF Karate' : `Passed ${r.beltEarned} Grading`
      return {
        id: r.type === 'enrollment' ? 'ach_initial_white_belt' : `ach_${randomUUID()}`,
        type: r.type,
        date: r.date,
        beltEarned: r.type === 'enrollment' ? 'white' : getBelt(r.beltEarned)?.label || r.beltEarned,
        grade: r.grade,
        examiner: r.examiner,
        location: r.location,
        title,
        description: r.eventName + (r.dp ? ' (Double Promotion)' : '')
      }
    })

    // Sort chronologically (oldest first... actually the portal expects newest first, so we reverse it or sort descending)
    newAchievements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    if (existingAthlete) {
      await supabaseAdmin.from('athletes').update({
        achievements: newAchievements,
        current_belt: currentBelt,
        branch_name: records[0].location // Ensure branch is correct
      }).eq('skf_id', skf_id)
    } else {
      // Very basic creation if completely missing
      await supabaseAdmin.from('athletes').insert({
        skf_id,
        first_name: records[0].name.split(' ')[0],
        last_name: records[0].name.split(' ').slice(1).join(' '),
        branch_name: records[0].location,
        join_date: records[0].date,
        current_belt: currentBelt,
        achievements: newAchievements,
        status: 'active'
      })
    }
    results.push({ skf_id, currentBelt, achievements: newAchievements.length })
  }

  return NextResponse.json({ success: true, count: groups.size, results })
}
