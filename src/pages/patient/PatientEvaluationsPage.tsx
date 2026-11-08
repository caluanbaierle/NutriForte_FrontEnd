import { useEffect, useState } from 'react'
import { assessmentApi } from '@/api/assessmentApi'
import type { AssessmentHistoryResponse } from '@/types/assessment'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { AssessmentHistory } from '@/components/assessment/AssessmentHistory'
import { getErrorMessage } from '@/utils/errors'

export function PatientEvaluationsPage() {
  const [history, setHistory] = useState<AssessmentHistoryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void (async () => {
      try {
        setHistory(await assessmentApi.mine())
      } catch (err) {
        setError(getErrorMessage(err, 'Não foi possível carregar suas avaliações.'))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="nf-page">
      <PageHeader
        title="Exames e testes"
        description="Testes físicos e perfis lipídicos registrados pelo seu nutricionista. Os resultados não são diagnóstico."
      />
      <ErrorAlert message={error} onClose={() => setError('')} />
      {loading ? <LoadingState /> : history ? <AssessmentHistory history={history} /> : null}
    </div>
  )
}
