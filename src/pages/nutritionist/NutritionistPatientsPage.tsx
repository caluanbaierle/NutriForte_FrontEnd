import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { nutritionistApi } from '@/api/nutritionistApi'
import type { NutritionistPatientListItem } from '@/types/nutritionist'
import { PageHeader } from '@/components/common/PageHeader'
import { TextField } from '@/components/forms/TextField'
import { Button } from '@/components/forms/Button'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { EmptyState } from '@/components/feedback/EmptyState'
import { getErrorMessage } from '@/utils/errors'
import { formatDateTime } from '@/utils/format'

export function NutritionistPatientsPage() {
  const [items, setItems] = useState<NutritionistPatientListItem[]>([])
  const [name, setName] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load(nextPage = 0) {
    setLoading(true)
    setError('')
    try {
      const data = await nutritionistApi.listPatients({
        name: name || undefined,
        page: nextPage,
        size: 20,
      })
      setItems(data.content)
      setPage(data.page)
      setTotalPages(data.totalPages)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="nf-page">
      <PageHeader title="Meus pacientes" description="Pacientes vinculados a você pelo administrador." />
      <ErrorAlert message={error} onClose={() => setError('')} />
      <div className="nf-card flex flex-col gap-3 sm:flex-row sm:items-end">
        <TextField
          className="flex-1"
          label="Buscar por nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button onClick={() => void load(0)}>Buscar</Button>
      </div>
      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState title="Nenhum paciente encontrado" />
      ) : (
        <>
          <div className="nf-table-wrap">
            <table className="nf-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Desde</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td>{item.fullName}</td>
                    <td>{formatDateTime(item.createdAt)}</td>
                    <td>
                      <Link to={`/nutritionist/patients/${item.id}`} className="nf-btn-secondary">
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-charcoal-muted">
              Página {page + 1} de {Math.max(totalPages, 1)}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" disabled={page <= 0} onClick={() => void load(page - 1)}>
                Anterior
              </Button>
              <Button
                variant="secondary"
                disabled={page + 1 >= totalPages}
                onClick={() => void load(page + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
