'use client'

import Link from 'next/link'
import { FaArrowRight } from 'react-icons/fa'

export default function HomeHeroActions() {

    return (
        <div className="hero__actions animate-in delay-4">
            <Link href="/classes" className="btn btn-primary">
                Find Classes <FaArrowRight />
            </Link>
            <Link
                href="/book-trial"
                className="btn btn-secondary"
            >
                Book Free Trial
            </Link>
        </div>
    )
}
