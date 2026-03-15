'use client'

import { motion } from 'framer-motion'

interface ProgressBarProps {
  value: number // 0–100
  className?: string
}

export function ProgressBar({ value, className = '' }: ProgressBarProps) {
  return (
    <div
      className={`h-2 rounded-full overflow-hidden ${className}`}
      style={{ background: '#f6f3ef' }}
    >
      <motion.div
        className="h-full rounded-full"
        style={{ background: '#f59e0b' }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ type: 'spring', stiffness: 60, damping: 15 }}
      />
    </div>
  )
}
