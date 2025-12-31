import * as React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, type, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
              {icon}
            </div>
          )}
          <input
            type={type}
            className={`
              flex h-12 w-full rounded-lg border border-[var(--border)] bg-transparent 
              px-4 py-3 text-sm ring-offset-background 
              file:border-0 file:bg-transparent file:text-sm file:font-medium 
              placeholder:text-[var(--muted-foreground)] 
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 
              disabled:cursor-not-allowed disabled:opacity-50
              ${icon ? 'pl-10' : ''}
              ${error ? 'border-[var(--destructive)]' : ''}
              ${className}
            `}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-[var(--destructive)]">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
