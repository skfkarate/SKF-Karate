'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

type PaymentCopyButtonProps = {
  label: string
  value: string
}

export default function PaymentCopyButton({ label, value }: PaymentCopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const fallbackCopy = () => {
    const textarea = document.createElement('textarea')
    textarea.value = value
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    try {
      document.execCommand('copy')
    } finally {
      document.body.removeChild(textarea)
    }
  }

  const handleCopy = () => {
    const copyTask = navigator.clipboard?.writeText
      ? navigator.clipboard.writeText(value).catch(fallbackCopy)
      : Promise.resolve(fallbackCopy())

    void copyTask.finally(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    })
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={`Copy ${label}`}
      title={copied ? 'Copied' : `Copy ${label}`}
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        border: copied ? '1px solid rgba(34,197,94,0.45)' : '1px solid rgba(255,183,3,0.28)',
        background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(255,183,3,0.08)',
        color: copied ? '#22c55e' : 'var(--gold, #ffb703)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'border-color 0.18s ease, background 0.18s ease, color 0.18s ease',
      }}
    >
      {copied ? <Check size={15} strokeWidth={2.4} /> : <Copy size={14} strokeWidth={2.1} />}
    </button>
  )
}
