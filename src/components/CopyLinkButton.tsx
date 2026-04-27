'use client'

import { useState } from 'react'

const PARENT_BASE_URL = 'https://app.ourhearth.co/parent'

export function CopyLinkButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(`${PARENT_BASE_URL}?code=${code}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      title="Copy link"
      className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-xl border transition-colors whitespace-nowrap"
      style={{
        borderColor: copied ? '#059669' : '#e5ddd5',
        color: copied ? '#059669' : '#6b5e52',
        background: copied ? '#d1fae5' : '#f6f3ef',
      }}
    >
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  )
}
