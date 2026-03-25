export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin', '/portal', '/api', '/athlete', '/verify'],
            },
        ],
        sitemap: 'https://skfkarate.org/sitemap.xml',
    }
}
