import { getAllEvents } from '../../lib/data/events'
import EventsPageClient from './EventsPageClient'
import './events.css'

function getEventLabel(type) {
    if (type === 'tournament') return 'Tournament'
    if (type === 'seminar') return 'Seminar'
    if (type === 'pelt-exam') return 'PELT Exam'
    if (type === 'grading') return 'Grading'
    if (type === 'camp') return 'Camp'
    return 'Fun'
}

function formatDisplayDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    })
}

function getPastEventSummary(event) {
    if (event.type === 'tournament') {
        const results = event.results || []
        const gold = results.filter((entry) => entry.medal === 'gold' || entry.result === 'gold').length
        const silver = results.filter((entry) => entry.medal === 'silver' || entry.result === 'silver').length
        const bronze = results.filter((entry) => entry.medal === 'bronze' || entry.result === 'bronze').length
        return `SKF Medals: ${gold} Gold, ${silver} Silver, ${bronze} Bronze`
    }

    const results = event.results || []
    const completed = results.filter((entry) => entry.result === 'completed' || entry.result === 'pass').length
    const attended = results.filter((entry) => entry.result === 'attended').length

    if (completed > 0) return `${completed} athlete${completed === 1 ? '' : 's'} completed this event`
    if (attended > 0) return `${attended} athlete${attended === 1 ? '' : 's'} attended this event`
    return 'Event completed'
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
            type: getEventLabel(event.type),
            desc: event.description,
            cta: event.type === 'tournament' ? `/results/${event.slug}` : `/events/${event.slug}`,
        }))

    const pastEvents = events
        .filter((event) => new Date(event.date) < today || event.status === 'completed')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3)
        .map((event) => ({
            date: formatDisplayDate(event.date),
            title: event.name,
            result: getPastEventSummary(event),
        }))

    return <EventsPageClient upcomingEvents={upcomingEvents} pastEvents={pastEvents} />
}
