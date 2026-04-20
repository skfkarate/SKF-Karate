import { getAllTournaments } from '@/lib/server/repositories/tournaments'

export default function sitemap() {
    const baseUrl = 'https://skfkarate.org'

    const routes = [
        { path: '/', priority: 1.0, changeFrequency: 'weekly' },
        { path: '/about', priority: 0.9, changeFrequency: 'monthly' },
        { path: '/dojos', priority: 0.9, changeFrequency: 'monthly' },
        { path: '/grading', priority: 0.85, changeFrequency: 'monthly' },
        { path: '/senseis', priority: 0.8, changeFrequency: 'monthly' },
        { path: '/events', priority: 0.8, changeFrequency: 'weekly' },
        { path: '/honours', priority: 0.8, changeFrequency: 'monthly' },
        { path: '/contact', priority: 0.8, changeFrequency: 'monthly' },
        { path: '/gallery', priority: 0.7, changeFrequency: 'monthly' },
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
