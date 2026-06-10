import { getAllEventsLive } from '@/lib/server/repositories/events-live'
import EventsPageClient from './EventsPageClient'
import './events.css'
import { getEventLabel } from '@/data/constants/categories'
import JsonLdScript from '@/components/JsonLdScript'
import { buildBreadcrumbJsonLd, buildSeoMetadata } from '@/data/constants/seo'

function formatDisplayDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

export const metadata = buildSeoMetadata(
    '/events',
    'View SKF Karate events, seminars, camps, gradings, and tournaments for karate students training in kata, kumite, self-defense, and competition skills.'
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

    return (
        <>
            <JsonLdScript data={breadcrumbJsonLd} />
            <EventsPageClient
                upcomingEvents={upcomingEvents}
                pastEvents={pastEvents}
                filterOptions={filterOptions}
            />
        </>
    )
}
