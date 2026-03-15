import { HTMLAttributes, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  muted?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ muted = false, className = '', style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`rounded-3xl ${className}`}
        style={{
          background: muted ? '#f6f3ef' : '#ffffff',
          ...style,
        }}
        {...props}
      />
    )
  }
)

Card.displayName = 'Card'
