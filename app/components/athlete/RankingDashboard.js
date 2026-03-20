import Link from 'next/link'

import { getRankSnapshots } from '@/lib/data/athletes'

import { buildRankingBoards } from './rankingsData'

function beltLabel(value) {
  return String(value || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase())
}

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export default function RankingDashboard() {
  const snapshots = getRankSnapshots().filter((entry) => Number(entry.totalPoints || 0) > 0)
  const boards = buildRankingBoards(snapshots).slice(0, 4)
  const podium = [...snapshots]
    .sort((a, b) => Number(b.totalPoints || 0) - Number(a.totalPoints || 0))
    .slice(0, 3)

  const summaryCards = [
    {
      label: 'Ranked Athletes',
      value: snapshots.length,
      copy: 'Active athletes currently placed on the live board.',
    },
    {
      label: 'Ranking Categories',
      value: boards.length,
      copy: 'Live slices grouped by gender, age, and discipline.',
    },
    {
      label: 'Top Active Score',
      value: podium[0] ? Number(podium[0].totalPoints || 0).toFixed(0) : '0',
      copy: podium[0] ? `${podium[0].athleteName} leads the current cycle.` : 'No active ranking data yet.',
    },
  ]

  return (
    <section className="relative px-4 pb-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <span className="text-xs font-bold uppercase tracking-[0.24em] text-gold">
              Official Standings
            </span>
            <h2 className="mt-3 text-3xl font-black uppercase tracking-tight text-white md:text-4xl">
              Athlete Rankings Dashboard
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
              The dashboard below the athlete search is restored as a dedicated ranking view with live athlete standings and direct links into each athlete profile page.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {summaryCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">
                    {card.label}
                  </p>
                  <p className="mt-3 text-4xl font-black text-white">{card.value}</p>
                  <p className="mt-3 text-sm leading-6 text-white/55">{card.copy}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,183,3,0.08),rgba(255,255,255,0.02))] p-8 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-brand-red">Top Ranked</p>
            <h3 className="mt-3 text-2xl font-black uppercase tracking-tight text-white">
              Podium Athletes
            </h3>

            <div className="mt-6 space-y-4">
              {podium.map((entry, index) => (
                <Link
                  key={entry.athleteId}
                  href={`/athlete/${entry.registrationNumber}`}
                  className="flex items-center gap-4 rounded-[1.5rem] border border-white/10 bg-black/20 p-5 transition hover:border-gold/35 hover:bg-black/30"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-sm font-black text-white">
                    {getInitials(entry.athleteName)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-gold">
                        #{index + 1}
                      </span>
                      <p className="truncate text-sm font-black uppercase tracking-[0.12em] text-white">
                        {entry.athleteName}
                      </p>
                    </div>
                    <p className="mt-2 truncate text-xs uppercase tracking-[0.14em] text-white/45">
                      {entry.branchName} · {beltLabel(entry.currentBelt)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-black text-white">
                      {Number(entry.totalPoints || 0).toFixed(0)}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-gold">
                      points
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          {boards.map((board) => (
            <div
              key={board.key}
              className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
            >
              <div className="border-b border-white/10 px-6 py-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-red">Category</p>
                <h3 className="mt-2 text-xl font-black uppercase tracking-tight text-white">
                  {board.label}
                </h3>
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
                      <p className="text-lg font-black text-white">
                        {Number(entry.totalPoints || 0).toFixed(0)}
                      </p>
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
