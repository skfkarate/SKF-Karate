import { supabaseAdmin } from '@/lib/server/supabase'
import { getAllStudents } from '@/lib/server/sheets'

export async function GET() {
    try {
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0,0,0,0)

        // Fetch all EARN transactions this month
        const { data: transactions } = await supabaseAdmin
            .from('point_transactions')
            .select('skf_id, points')
            .eq('type', 'EARN')
            .gte('created_at', startOfMonth.toISOString())

        if (!transactions) return Response.json({ leaderboard: [] })

        const sums: Record<string, number> = {}
        for (const t of transactions) {
            sums[t.skf_id] = (sums[t.skf_id] || 0) + t.points
        }

        const sorted = Object.entries(sums)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)

        const students = await getAllStudents()
        const studentMap = new Map(students.map(s => [s.skfId, s]))

        const leaderboard = sorted.map(([skfId, points], idx) => {
            const student = studentMap.get(skfId)
            let displayName = 'Unknown Ninja'
            let belt = 'white'
            
            if (student) {
                const parts = student.name.trim().split(' ')
                const first = parts[0]
                const lastInitial = parts.length > 1 ? parts[parts.length - 1][0] + '.' : ''
                displayName = `${first} ${lastInitial}`.trim()
                belt = student.belt
            }

            return {
                rank: idx + 1,
                name: displayName,
                belt,
                points
            }
        })

        return Response.json({ leaderboard })
    } catch (e: any) {
        console.error('Leaderboard error:', e)
        return Response.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
    }
}
