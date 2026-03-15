import { HTMLAttributes } from 'react'

type BadgeStatus = 'draft' | 'sent' | 'in-progress' | 'completed' | 'default'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: BadgeStatus
}

const statusStyles: Record<BadgeStatus, { bg: string; color: string; label?: string }> = {
  draft: { bg: '#f3f3f3', color: '#888' },
  sent: { bg: '#fde8c8', color: '#92400e' },
  'in-progress': { bg: '#ffe4e6', color: '#e11d48' },
  completed: { bg: '#d1fae5', color: '#059669' },
  default: { bg: '#f6f3ef', color: '#6b5e52' },
}

export function Badge({ status = 'default', className = '', style, children, ...props }: BadgeProps) {
  const s = statusStyles[status]
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${className}`}
      style={{ background: s.bg, color: s.color, ...style }}
      {...props}
    >
      {children}
    </span>
  )
}
