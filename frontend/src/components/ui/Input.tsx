import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full rounded-lg border bg-white px-4 py-2.5 text-sm text-ink
            placeholder:text-on-surface-variant/60
            border-accent-border
            focus:border-primary focus:ring-[3px] focus:ring-primary/10
            focus:outline-none transition-all duration-200
            ${error ? 'border-role-challenger focus:border-role-challenger focus:ring-role-challenger/10' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1 text-xs font-medium text-role-challenger">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
