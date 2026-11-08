import { useEffect, useState } from 'react'
import { adminApi } from '@/api/adminApi'
import type { AdminPatientResponse } from '@/types/admin'
import { PageHeader } from '@/components/common/PageHeader'
import { LoadingState } from '@/components/feedback/LoadingState'
import { ErrorAlert } from '@/components/feedback/ErrorAlert'
import { EmptyState } from '@/components/feedback/EmptyState'
import { getErrorMessage } from '@/utils/errors'
import { formatDateTime } from '@/utils/format'

export function AdminPatientsPage() {
  const [items, setItems] = useState<AdminPatientResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    void (async () => {
      setLoading(true)
      try {
        setItems(await adminApi.listPatients())
      } catch (err) {
        setError(getErrorMessage(err))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <div className="nf-page">
      <PageHeader title="Pacientes" description="Lista administrativa de pacientes cadastrados." />
      <ErrorAlert message={error} onClose={() => setError('')} />
      {loading ? (
        <LoadingState />
      ) : items.length === 0 ? (
        <EmptyState title="Nenhum paciente" description="Ainda não há pacientes com perfil cadastrado." />
      ) : (
        <div className="nf-table-wrap">
          <table className="nf-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>User ID</th>
                <th>Criado em</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{item.fullName}</td>
                  <td>{item.cpf}</td>
                  <td className="font-mono text-xs">{item.userId}</td>
                  <td>{formatDateTime(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
