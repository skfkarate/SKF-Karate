'use client'

import type { ReactNode, RefObject } from 'react'
import { useInView } from '@/hooks/useInView'

type Props = {
    children: ReactNode
    className?: string
}

export default function AnimatedSection({ children, className = '' }: Props) {
    const ref = useInView({ threshold: 0.1, triggerOnce: true }) as RefObject<HTMLElement | null>

    return (
        <section ref={ref} className={`fade-in-up ${className}`}>
            {children}
        </section>
    )
}
