import { useEffect, useState } from 'react'
import axios from 'axios'
import { planApi } from '@/api/planApi'
import type { NutritionPlanResponse } from '@/types/plan'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { EmptyState } from '@/components/feedback/EmptyState'
import { PlanView } from '@/components/plan/PlanView'
import { getErrorMessage } from '@/utils/errors'

export function PatientPlanPage() {
  const [plan, setPlan] = useState<NutritionPlanResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void (async () => {
      setLoading(true)
      setError('')
      try {
        setPlan(await planApi.current())
      } catch (err) {
        setPlan(null)
        // 404 = ainda não há plano publicado; não é erro para o paciente.
        if (!(axios.isAxiosError(err) && err.response?.status === 404)) {
          setError(getErrorMessage(err, 'Não foi possível carregar o plano.'))
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="nf-page">
      <PageHeader
        title="Plano alimentar"
        description="Plano elaborado pelo seu nutricionista. Troque alimentos apenas pelas substituições autorizadas."
      />
      <ErrorAlert message={error} onClose={() => setError('')} />
      {loading ? (
        <LoadingState />
      ) : !plan ? (
        <EmptyState
          title="Sem plano publicado"
          description="Seu nutricionista ainda não publicou um plano alimentar para você."
        />
      ) : (
        <PlanView plan={plan} />
      )}
    </div>
  )
}
