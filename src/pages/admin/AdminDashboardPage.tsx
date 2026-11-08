import { useEffect, useState } from 'react'
import { adminApi } from '@/api/adminApi'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { getErrorMessage } from '@/utils/errors'

export function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [counts, setCounts] = useState({ patients: 0, nutritionists: 0, plans: 0, payments: 0 })

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError('')
      try {
        const [patients, nutritionists, plans, payments] = await Promise.all([
          adminApi.listPatients(),
          adminApi.listNutritionists(),
          adminApi.listPlans(),
          adminApi.listPayments(),
        ])
        setCounts({
          patients: patients.length,
          nutritionists: nutritionists.length,
          plans: plans.length,
          payments: payments.length,
        })
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="nf-page">
      <PageHeader
        title="Painel administrativo"
        description="Contagens obtidas diretamente das listas oficiais da API."
      />
      <ErrorAlert message={error} onClose={() => setError('')} />
      {loading ? (
        <LoadingState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Pacientes" value={counts.patients} />
          <StatCard label="Nutricionistas" value={counts.nutritionists} />
          <StatCard label="Planos de assinatura" value={counts.plans} />
          <StatCard label="Pagamentos" value={counts.payments} />
        </div>
      )}
    </div>
  )
}
