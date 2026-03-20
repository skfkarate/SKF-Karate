import { getAllTournaments } from '../lib/data/tournaments'

export default function sitemap() {
    const baseUrl = 'https://skfkarate.org'

    const routes = [
        { path: '/', priority: 1.0, changeFrequency: 'weekly' },
        { path: '/about', priority: 0.9, changeFrequency: 'monthly' },
        { path: '/summer-camp', priority: 0.95, changeFrequency: 'weekly' },
        { path: '/contact', priority: 0.8, changeFrequency: 'monthly' },
        { path: '/senseis', priority: 0.8, changeFrequency: 'monthly' },
        { path: '/dojos', priority: 0.8, changeFrequency: 'monthly' },
        { path: '/grading', priority: 0.85, changeFrequency: 'monthly' },
        { path: '/events', priority: 0.9, changeFrequency: 'weekly' },
        { path: '/gallery', priority: 0.7, changeFrequency: 'monthly' },
        { path: '/honours', priority: 0.7, changeFrequency: 'monthly' },
        { path: '/documents', priority: 0.6, changeFrequency: 'yearly' },
        { path: '/results', priority: 0.85, changeFrequency: 'monthly' },
    ]

    // Add individual tournament pages
    const tournaments = getAllTournaments()
    const tournamentRoutes = tournaments.map(t => ({
        path: `/results/${t.slug}`,
        priority: 0.7,
        changeFrequency: 'monthly',
    }))

    return [...routes, ...tournamentRoutes].map((route) => ({
        url: `${baseUrl}${route.path}`,
        lastModified: new Date(),
        changeFrequency: route.changeFrequency,
        priority: route.priority,
    }))
}
