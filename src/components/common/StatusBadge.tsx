interface StatusBadgeProps {
  status: string
  label?: string
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'
}

const toneClasses: Record<NonNullable<StatusBadgeProps['tone']>, string> = {
  neutral: 'bg-cream-dark text-charcoal-muted',
  success: 'bg-[var(--color-success-bg)] text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]',
  info: 'bg-[var(--color-info-bg)] text-[var(--color-info)]',
}

export function statusTone(status: string): StatusBadgeProps['tone'] {
  const s = status.toUpperCase()
  if (['ACTIVE', 'CONFIRMED'].includes(s)) return 'success'
  if (['PENDING', 'PAST_DUE'].includes(s)) return 'warning'
  if (['INACTIVE', 'CANCELLED', 'EXPIRED', 'REJECTED', 'ARCHIVED'].includes(s)) return 'danger'
  return 'neutral'
}

export function StatusBadge({ status, label, tone }: StatusBadgeProps) {
  const resolved: NonNullable<StatusBadgeProps['tone']> = tone ?? statusTone(status) ?? 'neutral'
  return (
    <span className={`inline-flex rounded-md px-2.5 py-1 text-xs font-semibold ${toneClasses[resolved]}`}>
      {label ?? status}
    </span>
  )
}
