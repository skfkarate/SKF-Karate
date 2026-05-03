import { describe, expect, it } from 'vitest'

import {
  applyRankingMovements,
  buildRankingSnapshotRows,
  type RankingSnapshotRow,
} from '@/lib/server/repositories/ranking-snapshots'

function previousRow(overrides: Partial<RankingSnapshotRow> = {}): RankingSnapshotRow {
  return {
    snapshotKey: 'previous',
    reason: 'test',
    sourceType: 'tournament',
    sourceId: 'tour_1',
    categoryKey: 'junior:female:kata:open',
    athleteId: 'ath_1',
    skfId: 'SKF24RJ001',
    athleteName: 'Asha Kumar',
    branchName: 'Rajajinagar',
    currentBelt: 'brown',
    overallRank: 5,
    categoryRank: 3,
    branchRank: 2,
    totalPoints: 120,
    goldCount: 1,
    silverCount: 0,
    bronzeCount: 0,
    fightWinCount: 1,
    tournamentCount: 1,
    totalMedals: 1,
    previousOverallRank: null,
    previousCategoryRank: null,
    previousBranchRank: null,
    overallRankDelta: null,
    categoryRankDelta: null,
    branchRankDelta: null,
    overallMovement: 'new',
    categoryMovement: 'new',
    branchMovement: 'new',
    rankingCategory: { key: 'junior:female:kata:open' },
    pointsBreakdown: [],
    createdAt: '2026-05-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('ranking snapshots', () => {
  it('calculates movement from previous stored ranks', () => {
    const rows = buildRankingSnapshotRows(
      [
        {
          athleteId: 'ath_1',
          skfId: 'SKF24RJ001',
          athleteName: 'Asha Kumar',
          branchName: 'Rajajinagar',
          currentBelt: 'brown',
          overallRank: 3,
          branchRank: 2,
          totalPoints: 300,
          goldCount: 2,
          silverCount: 0,
          bronzeCount: 0,
          fightWinCount: 4,
          tournamentCount: 2,
          totalMedals: 2,
          rankingCategory: { key: 'junior:female:kata:open' },
          pointsBreakdown: [],
        },
      ],
      [previousRow()],
      { reason: 'tournament_results_published', sourceType: 'tournament', sourceId: 'tour_2' },
      '2026-05-02T00:00:00.000Z'
    )

    expect(rows[0]).toEqual(
      expect.objectContaining({
        previousOverallRank: 5,
        previousCategoryRank: 3,
        previousBranchRank: 2,
        overallRankDelta: 2,
        categoryRankDelta: 2,
        branchRankDelta: 0,
        overallMovement: 'up',
        categoryMovement: 'up',
        branchMovement: 'same',
      })
    )
  })

  it('marks athletes with no matching history as new entries', () => {
    const rows = buildRankingSnapshotRows(
      [
        {
          athleteId: 'ath_2',
          skfId: 'SKF24ML002',
          athleteName: 'Diya Nair',
          branchName: 'Malleshwaram',
          currentBelt: 'green',
          overallRank: 1,
          branchRank: 1,
          totalPoints: 80,
          rankingCategory: { key: 'cadet:female:kumite:open' },
        },
      ],
      [previousRow()],
      {},
      '2026-05-02T00:00:00.000Z'
    )

    expect(rows[0]).toEqual(
      expect.objectContaining({
        previousOverallRank: null,
        previousCategoryRank: null,
        previousBranchRank: null,
        overallMovement: 'new',
        categoryMovement: 'new',
        branchMovement: 'new',
      })
    )
  })

  it('hydrates current ranking entries from the latest stored snapshot', () => {
    const hydrated = applyRankingMovements(
      [
        {
          athleteId: 'ath_1',
          skfId: 'SKF24RJ001',
          athleteName: 'Asha Kumar',
          overallRank: 5,
          branchRank: 2,
          totalPoints: 120,
          rankingCategory: { key: 'junior:female:kata:open' },
        },
      ],
      [
        previousRow({
          snapshotKey: 'latest',
          categoryRank: 1,
          previousCategoryRank: 4,
          categoryRankDelta: 3,
          categoryMovement: 'up',
          createdAt: '2026-05-02T00:00:00.000Z',
        }),
      ]
    )

    expect(hydrated[0]).toEqual(
      expect.objectContaining({
        categoryMovement: 'up',
        rankingMovement: 'up',
        rankDelta: 3,
        previousCategoryRank: 4,
        rankingSnapshotRecordedAt: '2026-05-02T00:00:00.000Z',
      })
    )
  })

  it('compares current ranks to the latest snapshot when records changed outside a capture', () => {
    const hydrated = applyRankingMovements(
      [
        {
          athleteId: 'ath_1',
          skfId: 'SKF24RJ001',
          athleteName: 'Asha Kumar',
          overallRank: 3,
          branchRank: 2,
          totalPoints: 300,
          rankingCategory: { key: 'junior:female:kata:open' },
        },
      ],
      [previousRow()]
    )

    expect(hydrated[0]).toEqual(
      expect.objectContaining({
        previousOverallRank: 5,
        previousCategoryRank: 3,
        overallMovement: 'up',
        categoryMovement: 'up',
        overallRankDelta: 2,
        categoryRankDelta: 2,
      })
    )
  })
})
