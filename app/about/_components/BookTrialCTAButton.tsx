import Link from 'next/link'

export default function BookTrialCTAButton() {
    return (
        <Link href="/book-trial" className="btn btn-primary" style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
            Book Free Trial
        </Link>
    )
}
