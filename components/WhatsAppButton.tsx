'use client'

import { useState, useEffect } from 'react'
import { ChevronRight, UserCircle } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'
import { BRANCH_WHATSAPP_NUMBERS } from '@/data/constants/contact'

type Props = {
    branch?: string
}

type PortalStatus = 'checking' | 'authenticated' | 'guest'

type PortalSessionResponse = {
    name?: string | null
}

const BRANCH_NUMBERS = BRANCH_WHATSAPP_NUMBERS

export default function WhatsAppButton({ branch }: Props) {
    const [isVisible, setIsVisible] = useState(false)
    const [portalStatus, setPortalStatus] = useState<PortalStatus>('checking')
    const [portalName, setPortalName] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true
        const controller = new AbortController()

        async function checkPortalSession() {
            try {
                const response = await fetch('/api/auth/portal/session', {
                    cache: 'no-store',
                    credentials: 'same-origin',
                    signal: controller.signal,
                })

                if (response.ok) {
                    const session = await response.json().catch(() => null) as PortalSessionResponse | null
                    if (isMounted) {
                        setPortalName(typeof session?.name === 'string' ? session.name : null)
                        setPortalStatus('authenticated')
                    }
                    return
                }
            } catch {
                if (controller.signal.aborted) return
            }

            if (isMounted) {
                setPortalStatus('guest')
            }
        }

        checkPortalSession()

        return () => {
            isMounted = false
            controller.abort()
        }
    }, [])

    useEffect(() => {
        if (portalStatus !== 'guest') {
            return undefined
        }

        const timer = setTimeout(() => {
            setIsVisible(true)
        }, 5000)

        return () => clearTimeout(timer)
    }, [portalStatus])

    if (portalStatus === 'checking') return null

    if (portalStatus === 'authenticated') {
        return (
            <div className="skf-floating-action-container">
                <style dangerouslySetInnerHTML={{__html: `
                    .skf-floating-action-container {
                        position: fixed;
                        bottom: 2rem;
                        right: 2rem;
                        z-index: 1000;
                        font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    }
                    .skf-premium-pill {
                        display: inline-flex;
                        align-items: center;
                        gap: 8px;
                        height: 40px;
                        padding: 0 12px 0 12px;
                        border-radius: 20px;
                        background: rgba(15, 23, 42, 0.25);
                        border: 1px solid rgba(255, 255, 255, 0.18);
                        backdrop-filter: blur(16px);
                        -webkit-backdrop-filter: blur(16px);
                        box-shadow: 
                            inset 0 1.5px 1px rgba(255, 255, 255, 0.3),
                            0 8px 24px rgba(0, 0, 0, 0.3),
                            0 2px 4px rgba(0, 0, 0, 0.15);
                        color: #ffffff;
                        text-decoration: none;
                        font-size: 0.82rem;
                        font-weight: 700;
                        letter-spacing: 0.3px;
                        cursor: pointer;
                        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                        max-width: 220px;
                        overflow: hidden;
                    }
                    .skf-pill-icon {
                        color: rgba(255, 255, 255, 0.95);
                        flex-shrink: 0;
                        transition: transform 0.3s ease, color 0.3s ease;
                    }
                    .skf-pill-name {
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        color: #ffffff;
                        transition: color 0.3s ease;
                    }
                    .skf-arrow-icon {
                        color: rgba(255, 255, 255, 0.85);
                        flex-shrink: 0;
                        transition: transform 0.3s ease, color 0.3s ease;
                    }
                    .skf-premium-pill:hover {
                        transform: translateY(-3px);
                        border-color: rgba(255, 255, 255, 0.45);
                        background: rgba(255, 255, 255, 0.08);
                        box-shadow: 
                            inset 0 1.5px 1px rgba(255, 255, 255, 0.45),
                            0 12px 30px rgba(0, 0, 0, 0.45),
                            0 4px 10px rgba(0, 0, 0, 0.2);
                    }
                    .skf-premium-pill:hover .skf-pill-icon {
                        transform: scale(1.1);
                        color: #ffffff;
                    }
                    .skf-premium-pill:hover .skf-arrow-icon {
                        transform: translateX(2px);
                    }
                    @media (max-width: 768px) {
                        .skf-floating-action-container {
                            bottom: 4.5rem !important;
                            right: 1.25rem !important;
                        }
                    }
                `}} />
                <a
                    href="/portal/dashboard"
                    className="skf-premium-pill"
                    aria-label="Open athlete portal"
                >
                    <UserCircle size={20} strokeWidth={2.2} className="skf-pill-icon" />
                    <span className="skf-pill-name">
                        {portalName ? portalName : 'My Dashboard'}
                    </span>
                    <ChevronRight size={14} strokeWidth={3} className="skf-arrow-icon" />
                </a>
            </div>
        )
    }

    if (!isVisible) return null

    const phoneNumber = (branch && BRANCH_NUMBERS[branch]) ? BRANCH_NUMBERS[branch] : BRANCH_NUMBERS.default
    const branchText = branch ? ` ${branch.charAt(0).toUpperCase() + branch.slice(1)}` : ''
    const defaultMessage = `Hi, I'm interested in enrolling at SKF Karate${branchText}. Can you help me?`

    const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`

    return (
        <div className="skf-floating-action-container">
            <style dangerouslySetInnerHTML={{__html: `
                .skf-floating-action-container {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    z-index: 1000;
                    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
                .skf-premium-wa-pill {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    height: 40px;
                    padding: 0 14px 0 12px;
                    border-radius: 20px;
                    background: rgba(15, 23, 42, 0.25);
                    border: 1px solid rgba(255, 255, 255, 0.18);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    box-shadow: 
                        inset 0 1.5px 1px rgba(255, 255, 255, 0.3),
                        0 8px 24px rgba(0, 0, 0, 0.3),
                        0 2px 4px rgba(0, 0, 0, 0.15);
                    color: #ffffff;
                    text-decoration: none;
                    font-size: 0.82rem;
                    font-weight: 700;
                    letter-spacing: 0.3px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
                }
                .skf-wa-icon {
                    color: rgba(255, 255, 255, 0.95);
                    flex-shrink: 0;
                    transition: transform 0.3s ease;
                }
                .skf-wa-text {
                    color: #ffffff;
                }
                .skf-premium-wa-pill:hover {
                    transform: translateY(-3px);
                    border-color: rgba(255, 255, 255, 0.45);
                    background: rgba(255, 255, 255, 0.08);
                    box-shadow: 
                        inset 0 1.5px 1px rgba(255, 255, 255, 0.45),
                        0 12px 30px rgba(0, 0, 0, 0.45),
                        0 4px 10px rgba(0, 0, 0, 0.2);
                }
                .skf-premium-wa-pill:hover .skf-wa-icon {
                    transform: scale(1.1) rotate(8deg);
                }
                @media (max-width: 768px) {
                    .skf-floating-action-container {
                        bottom: 4.5rem !important;
                        right: 1.25rem !important;
                    }
                }
            `}} />
            <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="skf-premium-wa-pill"
                aria-label="Chat with us on WhatsApp"
            >
                <FaWhatsapp size={20} className="skf-wa-icon" />
                <span className="skf-wa-text">Enquiry</span>
            </a>
        </div>
    )
}
