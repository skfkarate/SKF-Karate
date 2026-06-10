export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/portal', '/api', '/athlete', '/verify'],
            },
        ],
        sitemap: 'https://www.skfkarate.org/sitemap.xml',
    }
}
