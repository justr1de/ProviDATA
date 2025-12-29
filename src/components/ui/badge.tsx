import * as React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = '', variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-[var(--primary)] text-[var(--primary-foreground)]',
      secondary: 'bg-[var(--secondary)] text-[var(--secondary-foreground)]',
      destructive: 'bg-[var(--destructive)] text-[var(--destructive-foreground)]',
      outline: 'border border-[var(--border)] text-[var(--foreground)]',
      success: 'bg-green-100 text-green-800',
      warning: 'bg-amber-100 text-amber-800',
    }

    return (
      <div
        ref={ref}
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors ${variants[variant]} ${className}`}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

export { Badge }
