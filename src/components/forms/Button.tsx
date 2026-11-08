import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary: 'nf-btn-primary',
  secondary: 'nf-btn-secondary',
  danger: 'nf-btn-danger',
  ghost: 'nf-btn-ghost',
}

export function Button({ variant = 'primary', className = '', children, type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} className={`${variants[variant]} ${className}`.trim()} {...props}>
      {children}
    </button>
  )
}
