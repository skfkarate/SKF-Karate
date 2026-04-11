'use client'

import { ReactNode } from 'react'
import { useInView } from '@/hooks/useInView'

type Props = {
    children: ReactNode
    className?: string
}

export default function AnimatedSection({ children, className = '' }: Props) {
    const ref = useInView({ threshold: 0.1, triggerOnce: true })

    return (
        <section ref={ref as any} className={`fade-in-up ${className}`}>
            {children}
        </section>
    )
}
