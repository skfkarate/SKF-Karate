'use client'

import Link from 'next/link'
import { FaArrowRight } from 'react-icons/fa'
import { useTrialModal } from '@/app/_components/TrialModalContext'

export default function HomeHeroActions() {
    const { openModal } = useTrialModal()

    return (
        <div className="hero__actions animate-in delay-4">
            <Link href="/classes" className="btn btn-primary">
                Find Classes <FaArrowRight />
            </Link>
            <button
                className="btn btn-secondary"
                onClick={() => openModal()}
            >
                Book Free Trial
            </button>
        </div>
    )
}
