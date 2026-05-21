import { FeeLedgerService } from './fee-ledger.service'
import { sendTelegramMessage } from './telegram.service'
import { isSupabaseReady, supabaseAdmin } from '@/lib/server/supabase'
import { logger } from '../lib/logger'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
] as const

async function getDevFundExpenses(year: number): Promise<number> {
  if (!isSupabaseReady()) return 0
  const { data, error } = await supabaseAdmin
    .from('development_fund_expenses')
    .select('amount, expense_date')
    .gte('expense_date', `${year}-01-01`)
    .lte('expense_date', `${year}-12-31`)
    
  if (error || !data) return 0
  return data.reduce((sum, row) => sum + (Number(row.amount) || 0), 0)
}

type PendingStudentForReport = {
  athleteName: string
  amount: number
}

function formatBranchPendingMessage(branchName: string, students: PendingStudentForReport[], monthName: string) {
  if (students.length === 0) {
    return `*${branchName.toUpperCase()} Branch - Fully Paid*\nNo pendings for ${monthName}.`
  }

  const lines = [`*${branchName.toUpperCase()} - Pending Fees (${monthName})*`]
  students.forEach((s, index) => {
    lines.push(`${index + 1}. ${s.athleteName} - ₹${s.amount}`)
  })
  lines.push(``)
  lines.push(`*Total Pending:* ₹${students.reduce((acc, s) => acc + s.amount, 0)}`)
  return lines.join('\n')
}

export class TelegramReportsService {
  /**
   * 5th of the Month: Simple Reminder
   */
  static async sendEarlyMonthReminder() {
    const monthName = MONTHS[new Date().getMonth()]
    
    const message = [
      `📋 *Monthly Fee Reminder - ${monthName}*`,
      `Please ensure a gentle reminder message is posted in all parent groups (MPSC & Herohalli) to clear the fees for ${monthName} by the 10th.`,
    ].join('\n')
    
    await sendTelegramMessage({ channel: 'fees', text: message, parseMode: 'Markdown' })
    logger.info('telegram_report.sent', { report: 'early_month' })
    return { success: true }
  }

  /**
   * 10th & 22nd of the Month: Pending Lists
   */
  static async sendMidMonthPendingList(isEscalation = false) {
    const year = new Date().getFullYear()
    const currentMonthIndex = new Date().getMonth()
    const monthName = MONTHS[currentMonthIndex]
    
    // Fetch ledger for the current month across all branches
    const ledger = await FeeLedgerService.getAdminLedger({ year, month: monthName })
    
    const mpscPending = ledger.entries.filter(e => 
      e.status === 'due' && e.branch.toLowerCase().includes('mp')
    )
    const heroPending = ledger.entries.filter(e => 
      e.status === 'due' && e.branch.toLowerCase().includes('hero')
    )

    const title = isEscalation 
      ? `*ESCALATION: Pending Fees - ${monthName}*`
      : `*Mid-Month Pending Fees - ${monthName}*`
      
    const intro = isEscalation
      ? `These accounts are heavily overdue for ${monthName}. Please contact parents immediately.`
      : `Please remind the following students for ${monthName} fees.`

    // Send MPSC Message
    const mpscMessage = [title, intro, '', formatBranchPendingMessage('MPSC', mpscPending, monthName)].join('\n')
    await sendTelegramMessage({ channel: 'fees', text: mpscMessage, parseMode: 'Markdown' })
    
    // Send Herohalli Message
    const heroMessage = [title, intro, '', formatBranchPendingMessage('Herohalli', heroPending, monthName)].join('\n')
    await sendTelegramMessage({ channel: 'fees', text: heroMessage, parseMode: 'Markdown' })

    logger.info('telegram_report.sent', { report: isEscalation ? 'late_month' : 'mid_month' })
    return { success: true }
  }

  /**
   * Month End: Reconciliation & Financial Health Check
   */
  static async sendMonthEndReconciliation() {
    const year = new Date().getFullYear()
    const currentMonthIndex = new Date().getMonth()
    const monthName = MONTHS[currentMonthIndex]
    
    // We get the entire ledger for the year up to now to find "Long Pendings"
    const fullLedger = await FeeLedgerService.getAdminLedger({ year })
    
    // Current Month Only stats
    const currentMonthEntries = fullLedger.entries.filter(e => e.monthIndex === currentMonthIndex)
    const cmExpected = currentMonthEntries.reduce((sum, e) => sum + e.amount, 0)
    const cmPaid = currentMonthEntries.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0)
    const cmCollectionRate = cmExpected > 0 ? Math.round((cmPaid / cmExpected) * 100) : 0
    
    // YTD Long Pendings (Students owing 2+ months)
    const dueEntries = fullLedger.entries.filter(e => e.status === 'due' || e.status === 'overdue')
    const dueByStudent = dueEntries.reduce((acc, e) => {
      acc[e.athleteName] = (acc[e.athleteName] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const longPendings = Object.entries(dueByStudent).filter(([, count]) => count >= 2)

    // Dev Fund Calculations
    const allPaidYTD = fullLedger.entries.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.amount, 0)
    const devFundBudget = Math.round(allPaidYTD * 0.30)
    const devFundSpent = await getDevFundExpenses(year)
    const devFundBalance = devFundBudget - devFundSpent
    
    // Build Health Alert String
    let healthAlert = ''
    if (cmCollectionRate < 75) {
      healthAlert = `\n*CRITICAL:* Collection rate for ${monthName} is heavily down (${cmCollectionRate}%).\n`
    } else if (cmCollectionRate < 90) {
      healthAlert = `\n*ALERT:* Collection rate for ${monthName} is below target (${cmCollectionRate}%).\n`
    } else {
      healthAlert = `\n*HEALTHY:* Collection rate for ${monthName} is at ${cmCollectionRate}%.\n`
    }

    const message = [
      `*MONTH-END RECONCILIATION - ${monthName} ${year}*`,
      healthAlert,
      `*Financial Health (${monthName}):*`,
      `• Expected: ₹${cmExpected}`,
      `• Actually Collected: ₹${cmPaid}`,
      `• Pending: ₹${cmExpected - cmPaid}`,
      ``,
      `*Development Fund Budget (YTD):*`,
      `• 30% Budget: ₹${devFundBudget}`,
      `• Total Spent: ₹${devFundSpent}`,
      `• Available Balance: ₹${devFundBalance} ${devFundBalance < 0 ? '(OVER BUDGET)' : ''}`,
      ``,
      `*Long Pending Issues (2+ Months Due):*`,
      longPendings.length > 0 
        ? longPendings.map(([name, months]) => `• ${name} (${months} months)`).join('\n')
        : `• None! All accounts are relatively up to date.`
    ].join('\n')

    await sendTelegramMessage({ channel: 'fees', text: message, parseMode: 'Markdown' })
    logger.info('telegram_report.sent', { report: 'month_end' })
    return { success: true }
  }

  /**
   * Pending Verifications Alert (Every 8 hours)
   */
  static async sendPendingVerificationsAlert() {
    const year = new Date().getFullYear()
    
    // Check across all branches for current year (to catch any recent pending)
    const ledger = await FeeLedgerService.getAdminLedger({ year })
    const pendingVerifications = ledger.entries.filter(e => e.status === 'pending_verification')

    if (pendingVerifications.length === 0) {
      return { success: true, count: 0 } // No need to spam if there are no pendings
    }

    const message = [
      `*ACTION REQUIRED: Pending Approvals*`,
      `There are currently *${pendingVerifications.length}* fee payments awaiting manual verification.`,
      `Please approve them as soon as possible in the FeeTrack Action Inbox so the students' athlete portals are updated.`,
      ``,
      ...pendingVerifications.map((s, index) => `${index + 1}. ${s.athleteName} - ₹${s.amount} (${s.branch})`)
    ].join('\n')

    await sendTelegramMessage({ channel: 'fees', text: message, parseMode: 'Markdown' })
    logger.info('telegram_report.sent', { report: 'pending_verifications' })
    return { success: true, count: pendingVerifications.length }
  }
}
