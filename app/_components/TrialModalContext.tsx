'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface TrialModalContextType {
    isOpen: boolean
    openModal: (preselectedBranch?: string) => void
    closeModal: () => void
    preselectedBranch: string | null
}

const TrialModalContext = createContext<TrialModalContextType>({
    isOpen: false,
    openModal: () => {},
    closeModal: () => {},
    preselectedBranch: null,
})

export function useTrialModal() {
    return useContext(TrialModalContext)
}

export function TrialModalProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [preselectedBranch, setPreselectedBranch] = useState<string | null>(null)

    const openModal = useCallback((branch?: string) => {
        setPreselectedBranch(branch || null)
        setIsOpen(true)
    }, [])

    const closeModal = useCallback(() => {
        setIsOpen(false)
        setPreselectedBranch(null)
    }, [])

    return (
        <TrialModalContext.Provider value={{ isOpen, openModal, closeModal, preselectedBranch }}>
            {children}
        </TrialModalContext.Provider>
    )
}
