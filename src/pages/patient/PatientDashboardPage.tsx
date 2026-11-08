import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { patientApi } from '@/api/patientApi'
import type { PatientDashboardResponse } from '@/types/patient'
import { NUTRITION_PLAN_STATUS_LABELS } from '@/types/plan'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { getErrorMessage } from '@/utils/errors'
import { formatDateTime, formatNumber } from '@/utils/format'

export function PatientDashboardPage() {
  const [data, setData] = useState<PatientDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void (async () => {
      setLoading(true)
      try {
        setData(await patientApi.getDashboard())
      } catch (err) {
        setError(getErrorMessage(err, 'Complete seu perfil para ver o painel.'))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="nf-page">
      <PageHeader
        title="Meu painel"
        description="Indicadores fornecidos pelo backend a partir do seu perfil e check-ins."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link to="/patient/assessment" className="nf-btn-secondary">
              Avaliação nutricional
            </Link>
            <Link to="/patient/checkins" className="nf-btn-primary">
              Novo check-in
            </Link>
          </div>
        }
      />
      <ErrorAlert message={error} onClose={() => setError('')} />
      {loading ? (
        <LoadingState />
      ) : data ? (
        <>
          <p className="text-sm text-charcoal-muted">Olá, {data.patient.fullName}</p>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Peso atual" value={`${formatNumber(data.currentWeightKg)} kg`} />
            <StatCard label="Meta de peso" value={`${formatNumber(data.targetWeightKg)} kg`} />
            <StatCard label="% gordura" value={formatNumber(data.bodyFatPercent)} />
            <StatCard
              label="Último check-in"
              value={
                data.latestCheckin
                  ? `${formatNumber(data.latestCheckin.dietAdherencePercent, 0)}% adesão`
                  : '—'
              }
              hint={data.latestCheckin ? formatDateTime(data.latestCheckin.createdAt) : undefined}
            />
          </div>
          <div className="nf-card">
            <h2 className="font-display text-xl text-forest">Plano atual</h2>
            {data.currentNutritionPlan ? (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <StatusBadge
                  status={data.currentNutritionPlan.status}
                  label={NUTRITION_PLAN_STATUS_LABELS[data.currentNutritionPlan.status]}
                />
                <span className="text-sm">Versão {data.currentNutritionPlan.version}</span>
                <Link to="/patient/plan" className="text-sm font-semibold text-forest underline">
                  Ver plano
                </Link>
              </div>
            ) : (
              <p className="mt-2 text-sm text-charcoal-muted">Nenhum plano ativo no momento.</p>
            )}
          </div>
          {data.weightHistory?.length ? (
            <div className="nf-card">
              <h2 className="font-display text-xl text-forest">Histórico de peso</h2>
              <ul className="mt-3 space-y-1 text-sm">
                {data.weightHistory.slice(0, 8).map((point) => (
                  <li key={point.recordedAt}>
                    {formatDateTime(point.recordedAt)} — {formatNumber(point.weightKg)} kg
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
