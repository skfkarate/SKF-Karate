'use client'

export default function InstagramEmbed({ url }) {
    // Extract the reel ID from the URL to build the embed URL
    const match = url.match(/\/(reel|p)\/([A-Za-z0-9_-]+)/)
    const embedUrl = match
        ? `https://www.instagram.com/reel/${match[2]}/embed/`
        : url

    return (
        <div className="ig-embed">
            <div className="ig-embed__clip">
                <iframe
                    src={embedUrl}
                    className="ig-embed__iframe"
                    frameBorder="0"
                    scrolling="no"
                    allowTransparency="true"
                    allow="encrypted-media"
                    title="Training camp video from Instagram"
                />
            </div>
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="ig-embed__link"
            >
                Watch on Instagram →
            </a>
        </div>
    )
}
