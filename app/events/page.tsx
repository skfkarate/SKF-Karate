import { getAllEventsLive } from '@/lib/server/repositories/events-live'
import EventsPageClient from './EventsPageClient'
import './events.css'
import { getEventLabel } from '@/data/constants/categories'
import JsonLdScript from '@/components/JsonLdScript'
import { buildBreadcrumbJsonLd, buildSeoMetadata, buildSportsEventJsonLd } from '@/data/constants/seo'

function formatDisplayDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

export const metadata = buildSeoMetadata(
    '/events',
    "SKF hosts India's top karate tournaments — open, district, state, and national championships. Upcoming karate events, kumite & kata competitions in Karnataka and across India.",
    { title: "SKF Karate Tournaments & Events | Open Championships | State & National Karate Events India" }
)

export default async function EventsPage() {
    const events = await getAllEventsLive()
    const breadcrumbJsonLd = buildBreadcrumbJsonLd('Events', '/events')
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const mappedEvents = events
        .filter((event) => event.status !== 'archived')
        .map((event) => ({
            id: event.id,
            rawDate: new Date(event.date).getTime(),
            date: formatDisplayDate(event.date),
            title: event.name,
            location: `${event.venue}, ${event.city}`,
            branch: (event as Record<string, unknown>).hostingBranch as string || '',
            type: event.type,
            desc: event.description,
            cta: event.type === 'tournament' ? `/results/${event.slug}` : `/events/${event.slug}`,
        }))

    const upcomingEvents = mappedEvents
        .filter((event) => event.rawDate >= today.getTime())
        .sort((a, b) => a.rawDate - b.rawDate)

    const pastEvents = mappedEvents
        .filter((event) => event.rawDate < today.getTime())
        .sort((a, b) => b.rawDate - a.rawDate) // Sort past events descending

    const filterOptions = [
        'All',
        ...Array.from(new Set(mappedEvents.map((event) => getEventLabel(event.type)))).sort((a, b) => a.localeCompare(b)),
    ]

    const eventSchemas = events
        .filter((event) => event.status !== 'archived' && new Date(event.date).getTime() >= today.getTime())
        .map((event) => buildSportsEventJsonLd({
            name: event.name,
            description: event.description || event.name,
            startDate: event.date,
            venue: event.venue,
            city: event.city || 'Bangalore',
            url: event.type === 'tournament' ? `/results/${event.slug}` : `/events/${event.slug}`
        }))

    return (
        <>
            <JsonLdScript data={breadcrumbJsonLd} />
            {eventSchemas.map((schema, i) => (
                <JsonLdScript key={i} data={schema} />
            ))}
            <EventsPageClient
                upcomingEvents={upcomingEvents}
                pastEvents={pastEvents}
                filterOptions={filterOptions}
            />
        </>
    )
}
