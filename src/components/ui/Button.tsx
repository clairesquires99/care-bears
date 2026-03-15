import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'text-white font-semibold',
  secondary: 'font-semibold border',
  ghost: 'font-medium',
}

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-4 py-2 text-sm rounded-xl',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-2xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', style, ...props }, ref) => {
    const baseStyle: React.CSSProperties =
      variant === 'primary'
        ? { background: '#d97706', color: '#fff' }
        : variant === 'secondary'
        ? { background: 'transparent', borderColor: '#f59e0b', color: '#92400e' }
        : { background: 'transparent', color: '#6b5e52' }

    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center transition-all disabled:opacity-60 cursor-pointer ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        style={{ ...baseStyle, ...style }}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'
