import Link from 'next/link'

import { getRankSnapshots } from '@/lib/data/athletes'

import { buildRankingBoards } from './rankingBoardUtils'

function beltLabel(value) {
  return String(value || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

export default function RankingDashboard() {
  const snapshots = getRankSnapshots().filter((entry) => entry.totalPoints > 0)
  const boards = buildRankingBoards(snapshots).slice(0, 4)

  return (
    <section className="relative px-4 pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.24em] text-gold">Official Standings</span>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
              Athlete Rankings Dashboard
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60">
              Current leaderboard slices built from live athlete records, medal outcomes, and active ranking points.
            </p>
          </div>
          <div className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white/55">
            {snapshots.length} ranked athletes
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {boards.map((board) => (
            <div
              key={board.key}
              className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
            >
              <div className="border-b border-white/10 px-6 py-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red">Category</p>
                <h3 className="mt-2 text-xl font-black uppercase tracking-tight text-white">{board.label}</h3>
              </div>

              <div className="divide-y divide-white/5">
                {board.items.slice(0, 5).map((entry) => (
                  <Link
                    key={entry.athleteId}
                    href={`/athlete/${entry.registrationNumber}`}
                    className="flex items-center justify-between gap-4 px-6 py-5 transition hover:bg-white/[0.03]"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm font-black text-white">
                        #{entry.categoryRank}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold uppercase tracking-[0.08em] text-white">
                          {entry.athleteName}
                        </p>
                        <p className="mt-1 truncate text-xs uppercase tracking-[0.14em] text-white/45">
                          {entry.branchName} · {beltLabel(entry.currentBelt)}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-lg font-black text-white">{Number(entry.totalPoints || 0).toFixed(0)}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
                        points
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
