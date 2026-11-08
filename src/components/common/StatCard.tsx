interface StatCardProps {
  label: string
  value: string | number
  hint?: string
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="nf-card">
      <p className="text-sm font-medium text-charcoal-muted">{label}</p>
      <p className="mt-2 font-display text-3xl text-forest">{value}</p>
      {hint ? <p className="mt-1 text-xs text-charcoal-muted">{hint}</p> : null}
    </div>
  )
}
