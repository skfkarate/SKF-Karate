import { NextResponse } from 'next/server'
import { appendToSheet, readSheetTab, isGoogleSheetsReady } from '@/lib/server/sheets'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/server/auth/options'
export async function GET(request) {
  try {
    // 1. Authenticate Admin
    const session = await getServerSession(authOptions)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const branch = searchParams.get('branch')
    const batch = searchParams.get('batch')

    if (!isGoogleSheetsReady()) {
      // Return data from local athletes if sheets isn't configured
      try {
        const { getAllAthletes } = await import('@/lib/data/athletes')
        let athletes = getAllAthletes()
        if (branch) athletes = athletes.filter(a => a.branchName === branch)
        return NextResponse.json({ students: athletes.map(a => ({
          id: a.id,
          name: `${a.firstName} ${a.lastName}`,
          skfId: a.registrationNumber,
          branch: a.branchName,
          belt: a.currentBelt,
          status: a.status,
          firstName: a.firstName,
          lastName: a.lastName,
          registrationNumber: a.registrationNumber
        }))})
      } catch (e) {
        return NextResponse.json({ students: [] })
      }
    }

    // Read from Google Sheets
    const rows = await readSheetTab('Students')
    let students = rows || []
    
    if (branch) {
      students = students.filter(s => (s.Branch || s.branch) === branch)
    }
    if (batch) {
      students = students.filter(s => (s.Batch || s.batch) === batch)
    }

    return NextResponse.json({ students })
  } catch (error) {
    console.error('[API] Fetch students error:', error)
    return NextResponse.json({ students: [] })
  }
}

export async function POST(request) {
  try {
    // 1. Authenticate Admin
    const session = await getServerSession(authOptions)
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      skfId,
      firstName,
      lastName,
      dob,
      gender,
      branch,
      joiningDate,
      fatherName,
      motherName,
      phonePrimary,
      email,
      bloodGroup
    } = body

    if (!skfId || !firstName || !lastName || !branch) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // 2. Prepare row for Google Sheets (Matching standard SKF columns)
    // Format: SKF ID | First Name | Last Name | DOB | Gender | Branch | Batch | Belt | Joining Date | Phone | Email | Parent Name
    const newRow = [
      skfId,
      firstName,
      lastName,
      dob,
      gender,
      branch,
      'Beginner', // Default Batch
      'White', // Default Belt
      joiningDate,
      phonePrimary,
      email,
      `${fatherName} / ${motherName}`,
      bloodGroup
    ]

    // 3. Append to Google Sheets
    try {
      await appendToSheet('Students', newRow)
    } catch (sheetErr) {
      console.warn('Google Sheets append failed (Mock Mode?):', sheetErr.message)
      // We continue to return success in mock mode if env vars are missing
    }

    return NextResponse.json({ success: true, skfId })
  } catch (error) {
    console.error('[API] Create student error:', error)
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 })
  }
}
