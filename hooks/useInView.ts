'use client'

import { useEffect, useRef } from 'react'

export function useInView(options = { threshold: 0.1, triggerOnce: true }) {
    const ref = useRef<Element | null>(null)
    const { threshold, triggerOnce } = options

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible')
                if (triggerOnce) {
                    observer.unobserve(entry.target)
                }
            } else if (!triggerOnce) {
                entry.target.classList.remove('visible')
            }
        }, { threshold })

        const currentRef = ref.current
        if (currentRef) {
            observer.observe(currentRef)
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef)
            }
        }
    }, [threshold, triggerOnce])

    return ref
}
