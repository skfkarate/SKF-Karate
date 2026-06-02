import { requirePortalAthlete } from '@/lib/server/auth/require-portal-athlete'
import {
  getMonthlyPointsLeaderboard,
  getPortalPointsBalance,
  getPortalPointsHistory,
} from '@/src/server/services/portal-points.service'
import PointsClient from './PointsClient'

export const dynamic = 'force-dynamic'

export default async function PortalPointsPage() {
  const { session } = await requirePortalAthlete()

  const [balance, leaderboard, history] = await Promise.all([
    getPortalPointsBalance(session.skfId!),
    getMonthlyPointsLeaderboard(),
    getPortalPointsHistory(session.skfId!, 1, 10),
  ])

  return (
    <PointsClient
      initialBalance={balance}
      initialLeaderboard={leaderboard}
      initialTransactions={history.transactions}
      initialHasMore={history.hasMore}
    />
  )
}
