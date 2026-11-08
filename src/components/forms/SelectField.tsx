import type { SelectHTMLAttributes } from 'react'

interface Option {
  value: string
  label: string
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: Option[]
  error?: string
  placeholder?: string
}

export function SelectField({
  label,
  options,
  error,
  placeholder,
  id,
  className = '',
  ...props
}: SelectFieldProps) {
  const selectId = id ?? props.name
  return (
    <div className={className}>
      <label htmlFor={selectId} className="nf-label">
        {label}
      </label>
      <select id={selectId} className={`nf-input ${error ? 'border-[var(--color-danger)]' : ''}`} {...props}>
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <p className="mt-1 text-xs text-[var(--color-danger)]">{error}</p> : null}
    </div>
  )
}
