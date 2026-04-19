'use client'

import { useTrialModal } from '@/app/_components/TrialModalContext'

export default function BookTrialCTAButton() {
    const { openModal } = useTrialModal()

    return (
        <button className="btn btn-primary" onClick={() => openModal()} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>
            Book Free Trial
        </button>
    )
}
