'use client'
import { useState } from 'react'
import CsvUploaderModal from './CsvUploaderModal'
import { FaUpload } from 'react-icons/fa'
import { useRouter } from 'next/navigation'

export default function StudentCsvImportClient() {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()
    return (
        <>
            <button onClick={() => setIsOpen(true)} style={{
                background: '#fff',
                color: '#000',
                border: 'none',
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <FaUpload /> Import CSV
            </button>
            <CsvUploaderModal isOpen={isOpen} onClose={() => setIsOpen(false)} onComplete={() => router.refresh()} />
        </>
    )
}
