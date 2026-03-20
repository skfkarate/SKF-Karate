import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { getEventBySlug } from "@/lib/data/events"

export const dynamic = "force-dynamic"

function formatDate(date) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function getResultLabel(result) {
  if (result.result === "completed") return "Completed"
  if (result.result === "attended") return "Attended"
  if (result.result === "pass") return "Passed"
  if (result.result === "fail") return "Failed"
  return result.result || "Recorded"
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const event = getEventBySlug(slug)

  if (!event) {
    return { title: "Event Not Found | SKF Karate" }
  }

  return {
    title: `${event.name} | SKF Karate`,
    description: event.description,
  }
}

export default async function EventDetailPage({ params }) {
  const { slug } = await params
  const event = getEventBySlug(slug)

  if (!event) {
    notFound()
  }

  if (event.type === "tournament") {
    redirect(`/results/${event.slug}`)
  }

  return (
    <div className="min-h-screen bg-[#070b14] px-4 py-14 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">{event.type}</p>
          <h1 className="mt-3 text-4xl font-black uppercase tracking-tight text-white md:text-5xl">
            {event.name}
          </h1>
          <p className="mt-4 max-w-3xl text-base text-white/65">{event.description}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-white/45">Date</p>
              <p className="mt-2 text-lg font-semibold text-white">{formatDate(event.date)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-white/45">Venue</p>
              <p className="mt-2 text-lg font-semibold text-white">{event.venue}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-white/45">City</p>
              <p className="mt-2 text-lg font-semibold text-white">{event.city}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-white/45">Participants</p>
              <p className="mt-2 text-lg font-semibold text-white">{event.participants?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-10 xl:grid-cols-[1fr_0.95fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-red">Participants</p>
            <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">
              Assigned Athletes
            </h2>

            <div className="mt-6 space-y-3">
              {(event.participants || []).length === 0 ? (
                <p className="text-sm text-white/50">No participants assigned yet.</p>
              ) : (
                event.participants.map((participant) => (
                  <Link
                    key={participant.registrationNumber}
                    href={`/athlete/${participant.registrationNumber}`}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-gold/50 hover:bg-black/30"
                  >
                    <div>
                      <p className="font-bold uppercase tracking-wide text-white">
                        {participant.athleteName}
                      </p>
                      <p className="mt-1 text-xs text-white/45">
                        {participant.registrationNumber} · {participant.branchName}
                      </p>
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-widest text-gold">
                      View Profile
                    </span>
                  </Link>
                ))
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold">Results</p>
            <h2 className="mt-2 text-3xl font-black uppercase tracking-tight text-white">
              Outcome Summary
            </h2>

            <div className="mt-6 space-y-3">
              {(event.results || []).length === 0 ? (
                <p className="text-sm text-white/50">Results have not been recorded yet.</p>
              ) : (
                event.results.map((result) => (
                  <div
                    key={`${result.registrationNumber}-${result.id || result.result}`}
                    className="rounded-2xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-bold uppercase tracking-wide text-white">
                          {result.athleteName}
                        </p>
                        <p className="mt-1 text-xs text-white/45">{result.registrationNumber}</p>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/70">
                        {getResultLabel(result)}
                      </span>
                    </div>
                    {result.notes ? (
                      <p className="mt-3 text-sm text-white/55">{result.notes}</p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
