import type { InputHTMLAttributes } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function TextField({ label, error, hint, id, className = '', ...props }: TextFieldProps) {
  const inputId = id ?? props.name
  return (
    <div className={className}>
      <label htmlFor={inputId} className="nf-label">
        {label}
      </label>
      <input id={inputId} className={`nf-input ${error ? 'border-[var(--color-danger)]' : ''}`} {...props} />
      {hint && !error ? <p className="mt-1 text-xs text-charcoal-muted">{hint}</p> : null}
      {error ? <p className="mt-1 text-xs text-[var(--color-danger)]">{error}</p> : null}
    </div>
  )
}
