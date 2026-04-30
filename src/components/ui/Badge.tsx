import { HTMLAttributes } from 'react'

type BadgeStatus = 'draft' | 'sent' | 'in-progress' | 'completed' | 'default'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status?: BadgeStatus
}

const statusStyles: Record<BadgeStatus, { bg: string; color: string; label?: string }> = {
  draft: { bg: '#f6eedb', color: '#9a7040' },
  sent: { bg: '#fde8c8', color: '#5a4030' },
  'in-progress': { bg: '#ffe4e6', color: '#e11d48' },
  completed: { bg: '#d1fae5', color: '#059669' },
  default: { bg: '#f6eedb', color: '#9a7040' },
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
