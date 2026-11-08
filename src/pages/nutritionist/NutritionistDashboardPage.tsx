import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { nutritionistApi } from '@/api/nutritionistApi'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { getErrorMessage } from '@/utils/errors'

export function NutritionistDashboardPage() {
  const [totalPatients, setTotalPatients] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void (async () => {
      setLoading(true)
      try {
        const data = await nutritionistApi.getDashboard()
        setTotalPatients(data.totalPatients)
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
        title="Painel do nutricionista"
        description="Dados fornecidos por GET /nutritionist/dashboard."
        actions={
          <Link to="/nutritionist/patients" className="nf-btn-secondary">
            Ver pacientes
          </Link>
        }
      />
      <ErrorAlert message={error} onClose={() => setError('')} />
      {loading ? <LoadingState /> : <StatCard label="Total de pacientes vinculados" value={totalPatients} />}
    </div>
  )
}
