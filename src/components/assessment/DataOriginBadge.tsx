import type { ReactNode } from 'react'

export type DataOrigin = 'backend' | 'pending' | 'unavailable'

const LABELS: Record<DataOrigin, string> = {
  backend: 'Calculado pelo backend',
  pending: 'Regra pendente',
  unavailable: 'Não disponível',
}

const SYMBOLS: Record<DataOrigin, string> = {
  backend: '✓',
  pending: '⚠',
  unavailable: '—',
}

interface DataOriginBadgeProps {
  origin: DataOrigin
  className?: string
}

export function DataOriginBadge({ origin, className = '' }: DataOriginBadgeProps) {
  return (
    <span className={`nf-origin nf-origin-${origin} ${className}`.trim()} title={LABELS[origin]}>
      <span aria-hidden>{SYMBOLS[origin]}</span> {LABELS[origin]}
    </span>
  )
}

interface MetricCardProps {
  label: string
  value: ReactNode
  origin: DataOrigin
  hint?: string
}

export function AssessmentMetricCard({ label, value, origin, hint }: MetricCardProps) {
  return (
    <article className="nf-card nf-assessment-metric">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-charcoal-muted">{label}</p>
        <DataOriginBadge origin={origin} />
      </div>
      <p className="mt-3 font-display text-3xl text-forest">{value}</p>
      {hint ? <p className="mt-2 text-xs text-charcoal-muted">{hint}</p> : null}
    </article>
  )
}
