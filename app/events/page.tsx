import { getAllEvents } from '../../lib/data/events'
import {
  getAllTournaments,
  getAvailableYears,
  getTournamentStats,
} from '../../lib/data/tournaments'
import EventsPageClient from './EventsPageClient'
import './events.css'
import '@/app/results/results.css'

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

    const upcomingEvents = events
        .filter((event) => event.status !== 'archived')
        .filter((event) => new Date(event.date) >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((event) => ({
            date: formatDisplayDate(event.date),
            title: event.name,
            location: `${event.venue}, ${event.city}`,
            type: event.type,
            desc: event.description,
            cta: event.type === 'tournament' ? `/results/${event.slug}` : `/events/${event.slug}`,
        }))

    // Fetch tournament results data
    const allTournaments = getAllTournaments()
    const stats = getTournamentStats()
    const availableYears = getAvailableYears()

    return (
        <EventsPageClient 
            upcomingEvents={upcomingEvents}
            resultsData={{
                allTournaments,
                stats,
                availableYears
            }} 
        />
    )
}
