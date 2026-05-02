import { getAllEventsLive } from '@/lib/server/repositories/events-live'
import EventsPageClient from './EventsPageClient'
import './events.css'
import { getEventLabel } from '@/data/constants/categories'
import { absoluteMediaUrl, absoluteSiteUrl } from '@/data/constants/siteConfig'



function formatDisplayDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

export const metadata = {
    title: 'SKF Karate',
    description: 'Upcoming SKF Karate events, seminars, and past competition results.',
    alternates: {
        canonical: absoluteSiteUrl('/events'),
    },
    openGraph: {
        title: 'SKF Karate',
        description: 'Upcoming SKF Karate events, seminars, and past competition results.',
        url: absoluteSiteUrl('/events'),
        type: 'website',
        images: [{ url: absoluteMediaUrl(), width: 1200, height: 630, alt: 'SKF Karate events and results' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'SKF Karate',
        description: 'Upcoming SKF Karate events, seminars, and past competition results.',
        images: [absoluteMediaUrl()],
    },
}

export default async function EventsPage() {
    const events = await getAllEventsLive()
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
        <EventsPageClient 
            upcomingEvents={upcomingEvents}
            pastEvents={pastEvents}
            filterOptions={filterOptions}
        />
    )
}
