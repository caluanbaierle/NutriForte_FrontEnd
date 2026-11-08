import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-sage-muted bg-cream/60 px-6 py-10 text-center">
      <h3 className="font-display text-lg text-forest">{title}</h3>
      {description ? <p className="mt-2 text-sm text-charcoal-muted">{description}</p> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}
