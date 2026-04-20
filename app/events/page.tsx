import { getAllEvents } from '@/lib/server/repositories/events'
import EventsPageClient from './EventsPageClient'
import './events.css'



function formatDisplayDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

export const metadata = {
    title: 'Events & Results | SKF Karate',
    description: 'Upcoming SKF Karate events, seminars, and past competition results.',
}

export default function EventsPage() {
    const events = getAllEvents()
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

    return (
        <EventsPageClient 
            upcomingEvents={upcomingEvents}
            pastEvents={pastEvents}
        />
    )
}
