import { forwardRef, type TextareaHTMLAttributes } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-semibold text-ink">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`
            w-full rounded-lg border bg-white px-4 py-3 text-sm text-ink
            placeholder:text-on-surface-variant/60
            border-accent-border min-h-[120px] resize-y
            focus:border-primary focus:ring-[3px] focus:ring-primary/10
            focus:outline-none transition-all duration-200
            ${error ? 'border-role-challenger focus:border-role-challenger focus:ring-role-challenger/10' : ''}
            ${className}
          `}
          {...props}
        />
        <div className="mt-1.5 flex items-center justify-between">
          {error ? (
            <p className="text-xs font-medium text-role-challenger">{error}</p>
          ) : hint ? (
            <p className="text-xs text-on-surface-variant">{hint}</p>
          ) : (
            <span />
          )}
        </div>
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
